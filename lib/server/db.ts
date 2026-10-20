import { promises as fs } from "fs";
import path from "path";
import { toKey } from "../date";
import { DEFAULT_MEDICINES, emptyState, type AppState } from "../types";

/*
 * Lưu dữ liệu:
 *  - Có biến môi trường Upstash Redis (khi deploy Vercel) → lưu trong Redis.
 *  - Không có → lưu file data/db.json (chạy ở máy).
 */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY = "tet2027:state";
const LOCK_KEY = "tet2027:email-lock";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const usingRedis = Boolean(REDIS_URL && REDIS_TOKEN);

async function redis<T>(...command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result as T;
}

async function readRaw(): Promise<string | null> {
  if (usingRedis) return redis<string | null>("GET", REDIS_KEY);
  try {
    return await fs.readFile(DB_FILE, "utf8");
  } catch {
    return null;
  }
}

async function writeRaw(json: string) {
  if (usingRedis) {
    await redis("SET", REDIS_KEY, json);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, DB_FILE);
}

function normalize(saved: Partial<AppState> | null): AppState {
  if (!saved) return emptyState();
  const s: AppState = { ...emptyState(), ...saved, defaultsSeeded: saved.defaultsSeeded === true };
  s.notes = s.notes.map((n) => (n.date ? n : { ...n, date: toKey(new Date(n.createdAt)) }));
  s.medicines = s.medicines.map(({ id, name }) => ({ id, name }));
  // Dữ liệu cũ: thêm thuốc tạo sẵn đúng một lần (sau đó người dùng xoá thì không thêm lại).
  if (!s.defaultsSeeded) {
    const missing = DEFAULT_MEDICINES.filter((d) => !s.medicines.some((m) => m.id === d.id));
    s.medicines = [...missing, ...s.medicines];
    s.defaultsSeeded = true;
  }
  return s;
}

export async function readState(): Promise<AppState> {
  const raw = await readRaw();
  return normalize(raw ? JSON.parse(raw) : null);
}

// Ghi tuần tự trong cùng một tiến trình để không ghi đè lẫn nhau.
let queue: Promise<unknown> = Promise.resolve();

export function updateState(fn: (s: AppState) => AppState): Promise<AppState> {
  const run = queue.then(async () => {
    const next = fn(await readState());
    await writeRaw(JSON.stringify(next));
    return next;
  });
  queue = run.catch(() => {});
  return run;
}

/** Khoá ngắn hạn để email không bị gửi 2 lần khi nhiều cron gọi cùng lúc. */
export async function acquireEmailLock(): Promise<boolean> {
  if (!usingRedis) return true;
  return (await redis<string | null>("SET", LOCK_KEY, "1", "NX", "EX", 300)) === "OK";
}
