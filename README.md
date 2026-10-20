# Đếm ngược Tết Đinh Mùi 2027 🧧

Website cá nhân: đếm ngược đến giao thừa (00:00 ngày 06/02/2027), lịch đánh dấu tập gym / uống thuốc / việc đã làm (có âm lịch), và tự gửi email tổng kết đúng đêm giao thừa.

## Chạy ở máy

```bash
pnpm install
cp .env.example .env.local   # điền SMTP nếu muốn thử gửi email
pnpm dev
```

Ở máy, dữ liệu lưu trong `data/db.json` và email do bộ hẹn giờ trong server tự gửi.

## Deploy lên Vercel (miễn phí)

| Phần | Dùng gì |
| --- | --- |
| Lưu dữ liệu | Upstash Redis (gói Free, qua Vercel Marketplace) |
| Gửi email lúc giao thừa | cron-job.org gọi `/api/cron` mỗi phút (chính xác) + Vercel Cron dự phòng (`vercel.json`) |
| Gửi email | Gmail SMTP với Mật khẩu ứng dụng |

Biến môi trường cần có trên Vercel: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CRON_SECRET`, và `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Vercel tự thêm khi kết nối Upstash).

- Email chỉ gửi **1 lần** dù cron gọi nhiều lần; lỡ giờ thì gửi bù trong 3 ngày.
- Xem trước email: `/api/email/preview`. Gửi thử: `curl -X POST https://<domain>/api/email`.
- Đẩy dữ liệu đang có ở máy lên Redis: `node --env-file=.env.local scripts/upload-data.mjs`.
- App không có đăng nhập: ai có link đều xem/sửa được.
