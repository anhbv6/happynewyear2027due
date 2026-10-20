// Đẩy dữ liệu đang có ở máy (data/db.json) lên Upstash Redis.
// Chạy: node --env-file=.env.local scripts/upload-data.mjs
import { readFile } from "fs/promises";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("Thiếu KV_REST_API_URL / KV_REST_API_TOKEN trong .env.local");
  process.exit(1);
}

const json = await readFile("data/db.json", "utf8");
JSON.parse(json); // kiểm tra file hợp lệ

const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(["SET", "tet2027:state", json]),
});
console.log(res.ok ? "Đã đẩy dữ liệu lên Redis ✔" : `Lỗi: ${res.status} ${await res.text()}`);
