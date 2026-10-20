import { readState } from "@/lib/server/db";
import { buildTetEmail } from "@/lib/server/email";

/** Xem trước nội dung email trong trình duyệt. */
export async function GET() {
  const { html } = buildTetEmail(await readState());
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
