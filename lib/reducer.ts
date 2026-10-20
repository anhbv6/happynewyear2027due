import type { Action, AppState } from "./types";

/** Reducer thuần, dùng chung cho client (cập nhật tức thì) và server (lưu file). */
export function reduce(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "start":
      return s.startedAt ? s : { ...s, startedAt: a.at };
    case "start/reset":
      return { ...s, startedAt: null };
    case "note/add":
      if (!a.note.text.trim()) return s;
      return { ...s, notes: [a.note, ...s.notes] };
    case "note/toggle":
      return {
        ...s,
        notes: s.notes.map((n) =>
          n.id === a.id ? { ...n, done: !n.done, doneAt: n.done ? null : a.at } : n,
        ),
      };
    case "note/edit":
      if (!a.text.trim()) return s;
      return { ...s, notes: s.notes.map((n) => (n.id === a.id ? { ...n, text: a.text.trim() } : n)) };
    case "note/delete":
      return { ...s, notes: s.notes.filter((n) => n.id !== a.id) };
    case "med/add":
      if (!a.med.name.trim()) return s;
      return { ...s, medicines: [...s.medicines, a.med] };
    case "med/update":
      return { ...s, medicines: s.medicines.map((m) => (m.id === a.med.id ? a.med : m)) };
    case "med/delete": {
      const days: AppState["days"] = {};
      for (const [k, v] of Object.entries(s.days)) {
        days[k] = { ...v, meds: v.meds.filter((id) => id !== a.id) };
      }
      return { ...s, medicines: s.medicines.filter((m) => m.id !== a.id), days };
    }
    case "day/set": {
      const days = { ...s.days };
      if (!a.log.gym && a.log.meds.length === 0) delete days[a.date];
      else days[a.date] = a.log;
      return { ...s, days };
    }
    default:
      return s;
  }
}
