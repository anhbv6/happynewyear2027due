import { checkAndSend } from "@/lib/server/scheduler";

/**
 * Được cron gọi quanh giờ giao thừa (Vercel Cron và cron-job.org).
 * Bảo vệ bằng CRON_SECRET: header `Authorization: Bearer <secret>` hoặc `?secret=<secret>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? url.searchParams.get("secret");
  if (!secret || given !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ result: await checkAndSend() });
}
