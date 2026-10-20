import { readState } from "@/lib/server/db";
import { recipient, sendTetEmail, smtpConfigured } from "@/lib/server/email";

/** Trạng thái cấu hình email. */
export async function GET() {
  const state = await readState();
  return Response.json({
    smtpConfigured: smtpConfigured(),
    to: recipient(),
    sentAt: state.email.sentAt,
    lastError: state.email.lastError,
  });
}

/** Gửi thử email tổng kết ngay bây giờ. */
export async function POST() {
  try {
    await sendTetEmail(await readState(), { test: true });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
