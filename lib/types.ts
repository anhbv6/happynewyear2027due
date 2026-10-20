export type Note = {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD — ngày của việc này
  done: boolean;
  createdAt: string;
  doneAt: string | null;
};

/** Một loại thuốc trong danh sách chung, áp dụng cho mọi ngày. */
export type Medicine = {
  id: string;
  name: string;
};

export const WORKOUTS = ["Ngực", "Xô", "Vai", "Chân", "Cardio"] as const;

/** Thuốc tạo sẵn (id cố định để chỉ thêm một lần). */
export const DEFAULT_MEDICINES: Medicine[] = [
  { id: "default-bio-c", name: "Blackmores Bio C 1000mg" },
  { id: "default-zinc", name: "Thorne Zinc 15mg" },
  { id: "default-magnesium", name: "Doctor's Best High Absorption Magnesium Lysinate Glycinate 200mg" },
];

export type DayLog = {
  gym: boolean;
  workouts?: string[]; // nhóm cơ đã tập, chỉ có ý nghĩa khi gym = true
  meds: string[]; // id các thuốc đã uống trong ngày
};

export type AppState = {
  version: 1;
  startedAt: string | null;
  defaultsSeeded?: boolean;
  notes: Note[];
  medicines: Medicine[];
  days: Record<string, DayLog>;
  email: { sentAt: string | null; lastError: string | null };
};

export type Action =
  | { type: "start"; at: string }
  | { type: "start/reset" }
  | { type: "note/add"; note: Note }
  | { type: "note/toggle"; id: string; at: string }
  | { type: "note/edit"; id: string; text: string }
  | { type: "note/delete"; id: string }
  | { type: "med/add"; med: Medicine }
  | { type: "med/update"; med: Medicine }
  | { type: "med/delete"; id: string }
  | { type: "day/set"; date: string; log: DayLog };

export const emptyState = (): AppState => ({
  version: 1,
  startedAt: null,
  defaultsSeeded: true,
  notes: [],
  medicines: [...DEFAULT_MEDICINES],
  days: {},
  email: { sentAt: null, lastError: null },
});
