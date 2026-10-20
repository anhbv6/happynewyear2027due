import nodemailer from "nodemailer";
import { formatKey, NEW_YEAR_EVE_KEY, toKey } from "../date";
import { computeStats } from "../stats";
import type { AppState } from "../types";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function statCell(icon: string, value: number | string, label: string) {
  return `<td width="33%" style="padding:6px">
    <div style="background:#fff7e6;border:1px solid #f5d38a;border-radius:14px;padding:14px 8px;text-align:center">
      <div style="font-size:26px">${icon}</div>
      <div style="font-size:28px;font-weight:800;color:#b91c1c;line-height:1.2">${value}</div>
      <div style="font-size:13px;color:#7c5a1e">${label}</div>
    </div></td>`;
}

/** Email tổng kết, tính đến hết ngày 30 Tết (đêm giao thừa). */
export function buildTetEmail(state: AppState, opts: { test?: boolean } = {}) {
  const today = toKey(new Date());
  const until = today < NEW_YEAR_EVE_KEY ? today : NEW_YEAR_EVE_KEY;
  const st = computeStats(state, until);
  const done = state.notes.filter((n) => n.done).sort((a, b) => a.date.localeCompare(b.date));
  const startText = state.startedAt ? formatKey(toKey(new Date(state.startedAt))) : "—";

  const doneList = done.length
    ? done
        .map(
          (n, i) => `<tr><td style="padding:8px 0;border-bottom:1px dashed #f1d9a6;font-size:15px;color:#3b2a10">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:#16a34a;color:#fff;font-size:13px;margin-right:8px">${i + 1}</span>
          ${esc(n.text)}<span style="color:#a8875a;font-size:12px"> · ${formatKey(n.date)}</span></td></tr>`,
        )
        .join("")
    : `<tr><td style="color:#a8875a;font-size:14px;padding:8px 0">Chưa có mục nào được tick hoàn thành — năm mới cùng cố gắng nhé!</td></tr>`;

  const maxGym = Math.max(1, ...st.months.map((m) => m.gym));
  const monthRows = st.months
    .map(
      (m) => `<tr>
      <td style="padding:6px 8px;font-size:13px;color:#3b2a10;white-space:nowrap">${m.label}</td>
      <td style="padding:6px 8px;width:100%">
        <div style="background:#fdecc8;border-radius:6px;height:12px;overflow:hidden">
          <div style="background:#dc2626;height:12px;width:${Math.round((m.gym / maxGym) * 100)}%"></div>
        </div></td>
      <td style="padding:6px 8px;font-size:13px;color:#b91c1c;white-space:nowrap;text-align:right">💪 ${m.gym} · 💊 ${m.doses}</td>
    </tr>`,
    )
    .join("");

  const medRows = st.perMed.length
    ? st.perMed
        .map(
          (m) => `<tr><td style="padding:6px 0;font-size:14px;color:#3b2a10">💊 ${esc(m.name)}</td>
          <td style="padding:6px 0;font-size:14px;color:#b91c1c;font-weight:700;text-align:right">${m.taken} lần</td></tr>`,
        )
        .join("")
    : "";

  const workoutLine = st.workouts.some((w) => w.count > 0)
    ? `<tr><td style="padding:4px 20px 0;font-size:14px;color:#7c5a1e;text-align:center">🏋️ ${st.workouts
        .map((w) => `${esc(w.name)} <b style="color:#b91c1c">${w.count}</b>`)
        .join(" &nbsp;·&nbsp; ")}</td></tr>`
    : "";

  const subject = `${opts.test ? "[Thử] " : ""}🧧 Chúc mừng năm mới Đinh Mùi 2027 — Tổng kết hành trình của bạn`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#fdf3e1;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf3e1;padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(185,28,28,.12)">
  <tr><td style="background:linear-gradient(135deg,#b91c1c,#dc2626);background-color:#b91c1c;padding:36px 24px;text-align:center;color:#fff">
    <div style="font-size:44px">🧧🌸🎆</div>
    <div style="font-size:15px;letter-spacing:2px;color:#fde68a;margin-top:8px">GIAO THỪA ĐÃ ĐIỂM</div>
    <div style="font-size:30px;font-weight:800;margin-top:6px">Chúc Mừng Năm Mới 2027</div>
    <div style="font-size:15px;color:#fee2e2;margin-top:8px">Xuân Đinh Mùi — An khang thịnh vượng, vạn sự như ý!</div>
  </td></tr>
  <tr><td style="padding:24px 20px 4px;font-size:15px;color:#3b2a10;line-height:1.6">
    Chúc mừng bạn đã đi trọn hành trình đếm ngược từ <b>${startText}</b> đến Tết — <b>${st.daysCounted} ngày</b> kiên trì.
    Đây là những gì bạn đã làm được 🎉
  </td></tr>
  <tr><td style="padding:8px 14px"><table width="100%" cellpadding="0" cellspacing="0"><tr>
    ${statCell("💪", st.gymDays, "buổi tập gym")}
    ${statCell("💊", st.totalDoses, "lần uống thuốc")}
    ${statCell("✅", `${st.notesDone}/${st.notesTotal}`, "việc hoàn thành")}
  </tr><tr>
    ${statCell("🔥", st.longestGymStreak, "chuỗi gym dài nhất")}
    ${statCell("🌟", st.fullMedDays, "ngày uống đủ thuốc")}
    ${statCell("📅", st.daysCounted, "ngày đã count")}
  </tr></table></td></tr>
  ${workoutLine}
  <tr><td style="padding:16px 20px 4px"><div style="font-size:18px;font-weight:800;color:#b91c1c">🏆 Những việc bạn đã làm được</div></td></tr>
  <tr><td style="padding:0 20px"><table width="100%" cellpadding="0" cellspacing="0">${doneList}</table></td></tr>
  ${monthRows ? `<tr><td style="padding:20px 20px 4px"><div style="font-size:18px;font-weight:800;color:#b91c1c">📆 Theo từng tháng</div></td></tr>
  <tr><td style="padding:0 12px"><table width="100%" cellpadding="0" cellspacing="0">${monthRows}</table></td></tr>` : ""}
  ${medRows ? `<tr><td style="padding:20px 20px 4px"><div style="font-size:18px;font-weight:800;color:#b91c1c">💊 Thuốc đã uống</div></td></tr>
  <tr><td style="padding:0 20px"><table width="100%" cellpadding="0" cellspacing="0">${medRows}</table></td></tr>` : ""}
  <tr><td style="padding:28px 20px;text-align:center">
    <div style="display:inline-block;background:#fef3c7;border:2px dashed #f59e0b;border-radius:16px;padding:16px 20px;color:#92400e;font-size:15px;line-height:1.6">
      Một năm mới khỏe mạnh hơn, kỷ luật hơn và hạnh phúc hơn.<br/><b>Tiếp tục giữ phong độ nhé! 🐐✨</b>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`;

  return { subject, html };
}

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function recipient() {
  return process.env.MAIL_TO || "anhbv216@gmail.com";
}

export async function sendTetEmail(state: AppState, opts: { test?: boolean } = {}) {
  const to = recipient();
  if (!smtpConfigured()) throw new Error("Chưa cấu hình SMTP trong file .env.local");

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const { subject, html } = buildTetEmail(state, opts);
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `Đếm ngược Tết <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
