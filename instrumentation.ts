export async function register() {
  // Trên Vercel không có tiến trình chạy liên tục → email do cron gọi /api/cron.
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { startScheduler } = await import("./lib/server/scheduler");
    startScheduler();
  }
}
