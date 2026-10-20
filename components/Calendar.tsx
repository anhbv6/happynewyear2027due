"use client";

import { useState } from "react";
import { daysInMonth, keyFromParts, NEW_YEAR_EVE_KEY, parseKey, TET_KEY, toKey, weekdayMon } from "@/lib/date";
import { lunarOf } from "@/lib/lunar";
import type { AppState } from "@/lib/types";

const HEAD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function Calendar({ state, onPick }: { state: AppState; onPick: (key: string) => void }) {
  const [today] = useState(() => toKey(new Date()));
  const [view, setView] = useState(() => {
    const { y, m } = parseKey(today);
    return { y, m };
  });

  const { y, m } = view;
  const offset = weekdayMon(y, m, 1);
  const total = daysInMonth(y, m);
  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => keyFromParts(y, m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  // Chỉ báo "quên uống thuốc" từ ngày bắt đầu theo dõi (ngày cắm cờ, hoặc ngày đầu tiên có đánh dấu).
  const trackFrom = state.startedAt ? toKey(new Date(state.startedAt)) : Object.keys(state.days).sort()[0] ?? today;

  const move = (delta: number) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const goToday = () => {
    const p = parseKey(today);
    setView({ y: p.y, m: p.m });
  };

  return (
    <section className="card flex min-h-0 flex-1 flex-col p-2.5 sm:p-4 lg:p-5">
      <div className="mb-2 flex items-center gap-2 lg:mb-3">
        <h2 className="flex-1 text-base font-bold sm:text-lg lg:text-xl">
          Tháng {m + 1}
          <span className="text-stone-400">/{y}</span>
        </h2>
        <button onClick={goToday} className="btn-ghost px-2.5 py-1.5 text-xs">Hôm nay</button>
        <button onClick={() => move(-1)} aria-label="Tháng trước" className="btn-ghost h-8 w-8 p-0 text-lg lg:h-10 lg:w-10">‹</button>
        <button onClick={() => move(1)} aria-label="Tháng sau" className="btn-ghost h-8 w-8 p-0 text-lg lg:h-10 lg:w-10">›</button>
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-1 sm:gap-1.5"
        style={{ gridTemplateRows: `auto repeat(${cells.length / 7}, minmax(0, 1fr))` }}
      >
        {HEAD.map((h) => (
          <div key={h} className={`pb-1 text-center text-xs font-semibold ${h === "CN" ? "text-red-500" : "text-stone-400"}`}>
            {h}
          </div>
        ))}
        {cells.map((key, i) => {
          if (!key) return <div key={i} />;
          const log = state.days[key];
          const active = state.medicines;
          const taken = log?.meds.filter((id) => active.some((m) => m.id === id)).length ?? 0;
          const isToday = key === today;
          const isTet = key === TET_KEY;
          const isEve = key === NEW_YEAR_EVE_KEY;
          const isPast = key < today;
          const lunar = lunarOf(key);
          const hasNotes = state.notes.some((n) => n.date === key);

          return (
            <button
              key={key}
              onClick={() => onPick(key)}
              className={`relative flex h-full min-h-0 flex-col overflow-hidden items-center justify-start rounded-xl border p-1 text-left transition hover:border-red-300 hover:bg-red-50/60 active:scale-95 lg:aspect-[1/0.9] lg:h-auto lg:p-1.5 ${
                isTet
                  ? "border-red-400 bg-gradient-to-br from-red-500 to-rose-500 text-white"
                  : log?.gym || taken
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-stone-100 bg-stone-50/40"
              } ${isToday ? "ring-2 ring-red-500 ring-offset-1" : ""}`}
            >
              <span
                className={`text-xs font-bold sm:text-sm ${isTet ? "" : isPast ? "text-stone-500" : "text-stone-800"} ${
                  isToday ? "text-red-600" : ""
                }`}
              >
                {parseKey(key).d}
              </span>
              <span
                className={`text-[9px] leading-tight sm:text-[11px] ${
                  isTet ? "text-amber-100" : lunar.day === 1 || lunar.day === 15 ? "font-semibold text-red-500" : "text-stone-400"
                }`}
              >
                {lunar.day === 1 ? `${lunar.day}/${lunar.month}${lunar.leap ? "N" : ""}` : lunar.day}
              </span>
              {isTet && <span className="text-xs sm:text-base">🧧</span>}
              {isEve && !log && <span className="text-xs sm:text-base">🎆</span>}
              <div className="mt-auto flex w-full flex-wrap items-center justify-center gap-0.5">
                {log?.gym && <span className="text-xs leading-none sm:text-base" title="Đã tập gym">💪</span>}
                {taken > 0 && (
                  <span title={`Đã uống ${taken}/${active.length} thuốc`} className="flex items-center text-xs leading-none sm:text-base">
                    💊<span className="text-[9px] font-bold text-stone-600 sm:text-[11px]">x{taken}</span>
                  </span>
                )}
              </div>
              {hasNotes && (
                <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-sky-500" title="Có ghi việc" />
              )}
              {active.length > 0 && taken === 0 && isPast && key >= trackFrom && !isTet && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-400" title="Chưa uống thuốc" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 hidden flex-wrap gap-x-4 gap-y-1 lg:flex text-xs text-stone-500">
        <span>💪 Đã tập gym</span>
        <span>💊x2 Số thuốc đã uống</span>
        <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-red-400" /> Quên uống</span>
        <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Có ghi việc</span>
      </div>
      <p className="mt-2 hidden text-xs text-stone-400 lg:block">Bấm vào một ngày để đánh dấu gym, thuốc và ghi việc đã làm. Số nhỏ bên dưới là ngày âm lịch.</p>
    </section>
  );
}
