export const TZ = "Asia/Ho_Chi_Minh";

/** Giao thừa Tết Đinh Mùi: 00:00 ngày 06/02/2027 (mùng 1 Tết) giờ Việt Nam. */
export const TET_AT = new Date("2027-02-06T00:00:00+07:00");
export const TET_KEY = "2027-02-06";
export const NEW_YEAR_EVE_KEY = "2027-02-05";

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Ngày dạng YYYY-MM-DD theo giờ Việt Nam. */
export function toKey(d: Date): string {
  return keyFormatter.format(d);
}

export function keyFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m: m - 1, d };
}

export function addDays(key: string, n: number): string {
  const { y, m, d } = parseKey(key);
  const t = new Date(Date.UTC(y, m, d + n));
  return keyFromParts(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}

export function daysBetween(a: string, b: string): number {
  const pa = parseKey(a);
  const pb = parseKey(b);
  return Math.round((Date.UTC(pb.y, pb.m, pb.d) - Date.UTC(pa.y, pa.m, pa.d)) / 86400000);
}

/** 0 = Thứ 2 ... 6 = Chủ nhật */
export function weekdayMon(y: number, m: number, d: number): number {
  return (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export function formatKey(key: string, withWeekday = false): string {
  const { y, m, d } = parseKey(key);
  const base = `${String(d).padStart(2, "0")}/${String(m + 1).padStart(2, "0")}/${y}`;
  return withWeekday ? `${WEEKDAYS[weekdayMon(y, m, d)]}, ${base}` : base;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
