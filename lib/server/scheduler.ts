import { TET_AT } from "../date";
import { acquireEmailLock, readState, updateState } from "./db";
import { sendTetEmail } from "./email";

// Nếu lỡ giờ giao thừa (server tắt / cron trễ), vẫn gửi bù trong vòng 3 ngày.
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
let sending = false;

export type CheckResult = "too-early" | "too-late" | "already-sent" | "busy" | "sent" | "failed";

/** Gửi email chúc mừng nếu đã đến giao thừa và chưa gửi. Gọi nhiều lần cũng chỉ gửi 1 lần. */
export async function checkAndSend(now = Date.now()): Promise<CheckResult> {
  if (now < TET_AT.getTime()) return "too-early";
  if (now > TET_AT.getTime() + GRACE_MS) return "too-late";
  if (sending) return "busy";
  const state = await readState();
  if (state.email.sentAt) return "already-sent";
  if (!(await acquireEmailLock())) return "busy";

  sending = true;
  try {
    await sendTetEmail(state);
    await updateState((s) => ({ ...s, email: { sentAt: new Date().toISOString(), lastError: null } }));
    console.log("[tet] Đã gửi email chúc mừng năm mới");
    return "sent";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await updateState((s) => ({ ...s, email: { ...s.email, lastError: msg } }));
    console.error("[tet] Gửi email thất bại:", msg);
    return "failed";
  } finally {
    sending = false;
  }
}

/** Hẹn giờ trong tiến trình — chỉ dùng khi tự chạy server (máy/VPS). Trên Vercel dùng cron gọi /api/cron. */
export function startScheduler() {
  const g = globalThis as { __tetScheduler?: boolean };
  if (g.__tetScheduler) return;
  g.__tetScheduler = true;

  const tick = () => checkAndSend().catch((e) => console.error("[tet]", e));
  const msLeft = TET_AT.getTime() - Date.now();
  if (msLeft > 0 && msLeft < 2_147_483_647) setTimeout(tick, msLeft + 1000);
  setInterval(tick, 60_000);
  tick();
  console.log(`[tet] Đã bật hẹn giờ gửi email lúc ${TET_AT.toISOString()}`);
}
