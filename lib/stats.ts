import { addDays, parseKey, toKey } from "./date";
import { WORKOUTS, type AppState } from "./types";


export type MonthStat = { label: string; gym: number; doses: number; fullMedDays: number };

export type Stats = {
  daysCounted: number;
  gymDays: number;
  longestGymStreak: number;
  totalDoses: number;
  fullMedDays: number;
  perMed: { name: string; taken: number }[];
  workouts: { name: string; count: number }[];
  notesDone: number;
  notesTotal: number;
  months: MonthStat[];
};

/** Thống kê từ ngày bắt đầu count (hoặc ngày đầu tiên có dữ liệu) đến `untilKey`. */
export function computeStats(state: AppState, untilKey = toKey(new Date())): Stats {
  const loggedKeys = Object.keys(state.days).sort();
  const startKey = state.startedAt ? toKey(new Date(state.startedAt)) : loggedKeys[0] ?? untilKey;
  const firstKey = loggedKeys[0] && loggedKeys[0] < startKey ? loggedKeys[0] : startKey;

  let gymDays = 0, streak = 0, longestGymStreak = 0, totalDoses = 0, fullMedDays = 0, daysCounted = 0;
  const perMed = new Map(state.medicines.map((m) => [m.id, 0]));
  const months = new Map<string, MonthStat>();
  const workouts = new Map<string, number>(WORKOUTS.map((w) => [w, 0]));

  for (let k = firstKey; k <= untilKey; k = addDays(k, 1)) {
    daysCounted++;
    const log = state.days[k];
    const { y, m } = parseKey(k);
    const mk = `${y}-${m}`;
    if (!months.has(mk)) months.set(mk, { label: `Tháng ${m + 1}/${y}`, gym: 0, doses: 0, fullMedDays: 0 });
    const ms = months.get(mk)!;

    if (log?.gym) {
      gymDays++; ms.gym++; streak++;
      log.workouts?.forEach((w) => workouts.set(w, (workouts.get(w) ?? 0) + 1));
      longestGymStreak = Math.max(longestGymStreak, streak);
    } else streak = 0;

    const taken = (log?.meds ?? []).filter((id) => perMed.has(id));
    totalDoses += taken.length; ms.doses += taken.length;
    taken.forEach((id) => perMed.set(id, perMed.get(id)! + 1));

    const active = state.medicines;
    if (active.length > 0 && active.every((m) => taken.includes(m.id))) {
      fullMedDays++; ms.fullMedDays++;
    }
  }

  return {
    daysCounted,
    gymDays,
    longestGymStreak,
    totalDoses,
    fullMedDays,
    perMed: state.medicines.map((m) => ({ name: m.name, taken: perMed.get(m.id) ?? 0 })),
    workouts: [...workouts].map(([name, count]) => ({ name, count })),
    notesDone: state.notes.filter((n) => n.done).length,
    notesTotal: state.notes.length,
    months: [...months.values()],
  };
}
