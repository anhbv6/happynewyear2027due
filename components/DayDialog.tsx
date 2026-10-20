"use client";

import { useEffect, useState } from "react";
import { formatKey } from "@/lib/date";
import { lunarOf } from "@/lib/lunar";
import { WORKOUTS, type Action, type AppState, type DayLog } from "@/lib/types";
import MedForm from "./MedForm";
import { NoteList } from "./Notes";

export default function DayDialog({
  date,
  state,
  dispatch,
  onClose,
}: {
  date: string;
  state: AppState;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const log: DayLog = state.days[date] ?? { gym: false, meds: [] };
  const workouts = log.workouts ?? [];
  const meds = state.medicines;
  const takenCount = meds.filter((m) => log.meds.includes(m.id)).length;
  const lunar = lunarOf(date);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = (next: Partial<DayLog>) => dispatch({ type: "day/set", date, log: { ...log, ...next } });
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-white px-3.5 pb-[calc(.75rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:pt-4"
      >
        <div className="mx-auto mb-1.5 h-1 w-9 rounded-full bg-stone-200 sm:hidden" />

        {/* Ngày */}
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-tight">{formatKey(date, true)}</h3>
            <p className="text-[11px] text-stone-500">
              Âm lịch {lunar.day}/{lunar.month}
              {lunar.leap ? " nhuận" : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-stone-400 hover:bg-stone-100">
            ✕
          </button>
        </div>

        {/* Gym */}
        <Section>
          <Row on={log.gym} onClick={() => set(log.gym ? { gym: false, workouts: [] } : { gym: true })}>
            💪 <span className="font-semibold">Tập gym</span>
          </Row>
          {log.gym && (
            <div className="mt-1 flex flex-wrap gap-1 pl-6">
              {WORKOUTS.map((w) => {
                const on = workouts.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => set({ workouts: toggle(workouts, w) })}
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition active:scale-95 ${
                      on ? "border-red-500 bg-red-500 text-white" : "border-stone-200 text-stone-600 hover:border-red-300"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Thuốc */}
        <Section>
          <div className="mb-0.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-stone-500">
              💊 Thuốc {meds.length > 0 && <span className={takenCount === meds.length ? "text-emerald-600" : "text-amber-600"}>{takenCount}/{meds.length}</span>}
            </span>
            {meds.length > 1 && takenCount < meds.length && (
              <button
                onClick={() => set({ meds: [...new Set([...log.meds, ...meds.map((m) => m.id)])] })}
                className="font-medium text-emerald-600 hover:underline"
              >
                Tick tất cả
              </button>
            )}
          </div>

          {meds.length === 0 && !adding && <p className="py-0.5 text-[11px] text-stone-400">Chưa có thuốc nào.</p>}
          {meds.map((m) => (
            <Row key={m.id} on={log.meds.includes(m.id)} onClick={() => set({ meds: toggle(log.meds, m.id) })}>
              <span className="leading-snug">{m.name}</span>
            </Row>
          ))}

          {adding ? (
            <div className="mt-1.5">
              <MedForm
                compact
                onCancel={() => setAdding(false)}
                onAdd={(med) => {
                  dispatch({ type: "med/add", med });
                  setAdding(false);
                }}
              />
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="mt-0.5 text-[11px] font-medium text-amber-700 hover:underline">
              + Thêm thuốc
            </button>
          )}
        </Section>

        {/* Việc đã làm */}
        <Section last>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">📝 Việc đã làm</p>
          <NoteList date={date} state={state} dispatch={dispatch} compact />
        </Section>

        <button onClick={onClose} className="btn-primary mt-1 h-9 w-full py-0">Xong</button>
      </div>
    </div>
  );
}

function Section({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <div className={`py-2 ${last ? "" : "border-b border-stone-100"}`}>{children}</div>;
}

/** Một dòng có ô tick nhỏ. */
function Row({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-md py-1 text-left text-[13px] active:bg-stone-50">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[9px] font-bold transition ${
          on ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className={`flex-1 ${on ? "text-stone-800" : "text-stone-600"}`}>{children}</span>
    </button>
  );
}
