"use client";

import { useEffect, useState } from "react";
import { TET_AT } from "@/lib/date";
import type { Action, AppState } from "@/lib/types";

function useNow() {
  // Chỉ render ở client (App đợi tải dữ liệu xong mới hiện), nên lấy giờ ngay được.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Mỗi chữ số được key theo giá trị nên khi đổi sẽ chạy lại hiệu ứng trượt vào. */
function Digits({ value, min = 2 }: { value: number; min?: number }) {
  return (
    <span className="inline-flex overflow-hidden">
      {String(value)
        .padStart(min, "0")
        .split("")
        .map((c, i, arr) => (
          <span key={`${arr.length - i}-${c}`} className="digit-in inline-block">
            {c}
          </span>
        ))}
    </span>
  );
}

export default function Countdown({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const now = useNow();
  const left = Math.max(0, TET_AT.getTime() - now);
  const parts = [
    { v: Math.floor(left / 86400000), l: "Ngày", min: 2 },
    { v: Math.floor(left / 3600000) % 24, l: "Giờ", min: 2 },
    { v: Math.floor(left / 60000) % 60, l: "Phút", min: 2 },
    { v: Math.floor(left / 1000) % 60, l: "Giây", min: 2 },
  ];

  return (
    <header className="tet-bg relative overflow-hidden rounded-3xl px-3 py-5 text-white shadow-lg sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -right-6 -top-8 select-none text-[100px] opacity-15 sm:text-[150px]">🌸</div>
      <div className="pointer-events-none absolute -bottom-10 -left-4 select-none text-[90px] opacity-10 sm:text-[120px]">🏮</div>
      {left === 0 ? (
        <p className="relative py-4 text-center text-2xl font-extrabold text-amber-200 sm:text-4xl">🎆 Chúc mừng năm mới! 🎆</p>
      ) : (
        <div className="relative mx-auto grid max-w-2xl grid-cols-4 gap-2 sm:gap-4">
          {parts.map((p, i) => (
            <div key={p.l} className="relative rounded-2xl bg-white/12 py-3 text-center ring-1 ring-white/20 backdrop-blur-sm sm:py-5">
              <div className="text-[2rem] font-extrabold leading-none tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,.25)] sm:text-6xl">
                <Digits value={p.v} min={p.min} />
              </div>
              <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-100/90 sm:text-xs">{p.l}</div>
              {i < 3 && (
                <span className="absolute -right-[7px] top-1/2 hidden -translate-y-1/2 text-2xl font-bold text-white/40 sm:block">:</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!state.startedAt && (
        <div className="relative mt-4 flex justify-center">
          <button
            onClick={() => dispatch({ type: "start", at: new Date().toISOString() })}
            title="Cắm mốc bắt đầu"
            aria-label="Cắm mốc bắt đầu"
            className="flag-pulse flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl ring-1 ring-white/30 backdrop-blur transition hover:bg-white/30 active:scale-90 sm:h-12 sm:w-12 sm:text-2xl"
          >
            🚩
          </button>
        </div>
      )}
    </header>
  );
}
