"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reduce } from "@/lib/reducer";
import type { Action, AppState } from "@/lib/types";
import Countdown from "./Countdown";
import Calendar from "./Calendar";
import DayDialog from "./DayDialog";
import Notes from "./Notes";
import Medicines from "./Medicines";

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  // Gửi thao tác lên server lần lượt từng cái (trên Vercel các request song song có thể ghi đè nhau).
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setState(await res.json());
    } catch {
      setError("Không tải được dữ liệu. Kiểm tra server rồi tải lại trang.");
    }
  }, []);

  useEffect(() => {
    fetch("/api/data", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setState)
      .catch(() => setError("Không tải được dữ liệu. Kiểm tra server rồi tải lại trang."));
  }, []);

  // Cập nhật giao diện ngay, đồng thời gửi thao tác lên server để lưu.
  const dispatch = useCallback(
    (action: Action) => {
      setState((s) => (s ? reduce(s, action) : s));
      saveQueue.current = saveQueue.current
        .then(() =>
          fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          }),
        )
        .then((res) => {
          if (!res.ok) throw new Error();
          setError(null);
        })
        .catch(() => {
          setError("Lưu thất bại — dữ liệu đã được tải lại từ server.");
          load();
        });
    },
    [load],
  );

  if (!state) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-stone-500">
        {error ?? <span className="animate-pulse">Đang tải… 🧧</span>}
      </div>
    );
  }

  return (
    // Mobile/tablet: đúng 1 màn hình (đếm ngược + lịch), không cuộn. PC: thêm cột việc hôm nay & thuốc.
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col gap-3 overflow-hidden px-2.5 pb-[max(.625rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-5 sm:pt-4 lg:block lg:h-auto lg:overflow-visible lg:pb-8 lg:pt-5">
      <Countdown state={state} dispatch={dispatch} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 lg:mt-3">{error}</div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-4">
        <Calendar state={state} onPick={setPickedDay} />
        <div className="hidden space-y-4 lg:block">
          <Notes state={state} dispatch={dispatch} />
          <Medicines state={state} dispatch={dispatch} />
        </div>
      </div>

      {pickedDay && (
        <DayDialog date={pickedDay} state={state} dispatch={dispatch} onClose={() => setPickedDay(null)} />
      )}
    </div>
  );
}
