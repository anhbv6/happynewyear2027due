"use client";

import { useState } from "react";
import { FIELD_SM } from "@/lib/ui";
import { formatKey, toKey, uid } from "@/lib/date";
import type { Action, AppState, Note } from "@/lib/types";

/** Khối "Việc hôm nay" ở trang chính. */
export default function Notes({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const [today] = useState(() => toKey(new Date()));
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="mb-3 flex items-baseline justify-between gap-2 text-base font-bold sm:text-lg">
        📝 Việc hôm nay
        <span className="text-xs font-normal text-stone-400">{formatKey(today, true)}</span>
      </h2>
      <NoteList date={today} state={state} dispatch={dispatch} />
    </section>
  );
}

/** Danh sách việc của một ngày + ô thêm việc. */
export function NoteList({
  date,
  state,
  dispatch,
  compact,
}: {
  date: string;
  state: AppState;
  dispatch: (a: Action) => void;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const list = state.notes.filter((n) => n.date === date);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const note: Note = { id: uid(), text: text.trim(), date, done: false, createdAt: new Date().toISOString(), doneAt: null };
    dispatch({ type: "note/add", note });
    setText("");
  };

  return (
    <div>
      {list.length > 0 && (
        <ul className={compact ? "mb-1.5 space-y-0" : "mb-2.5 space-y-1.5"}>
          {list.map((n) => (
            <NoteItem key={n.id} note={n} dispatch={dispatch} compact={compact} />
          ))}
        </ul>
      )}
      <form onSubmit={add} className={`flex ${compact ? "gap-1.5" : "gap-2"}`}>
        <input
          className={compact ? FIELD_SM : "input"}
          placeholder="Ghi lại việc đã làm…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className={`btn-primary shrink-0 ${compact ? "h-8 px-3 py-0 text-xs" : "px-4"}`} disabled={!text.trim()} aria-label="Thêm việc">+</button>
      </form>
    </div>
  );
}

function NoteItem({ note, dispatch, compact }: { note: Note; dispatch: (a: Action) => void; compact?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  const save = () => {
    if (draft.trim() && draft.trim() !== note.text) dispatch({ type: "note/edit", id: note.id, text: draft });
    setEditing(false);
  };

  return (
    <li
      className={`group flex items-center ${compact ? "gap-2" : "gap-2.5"} transition ${
        compact ? "py-0.5" : `rounded-xl border px-3 py-2 ${note.done ? "border-emerald-100 bg-emerald-50/50" : "border-stone-100 bg-white"}`
      }`}
    >
      <button
        onClick={() => dispatch({ type: "note/toggle", id: note.id, at: new Date().toISOString() })}
        aria-label={note.done ? "Bỏ hoàn thành" : "Đánh dấu hoàn thành"}
        className={`flex ${compact ? "h-4 w-4 rounded text-[9px]" : "h-6 w-6 rounded-md text-xs"} shrink-0 items-center justify-center border-2 font-bold transition ${
          note.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 text-transparent hover:border-emerald-400"
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            className={compact ? FIELD_SM : "input py-1.5"}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") { setDraft(note.text); setEditing(false); }
            }}
          />
        ) : (
          <p className={`break-words ${compact ? "text-[13px]" : "text-sm"} ${note.done ? "text-stone-400 line-through" : "text-stone-800"}`}>{note.text}</p>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 gap-0.5 transition lg:opacity-0 lg:group-hover:opacity-100">
          <button onClick={() => { setDraft(note.text); setEditing(true); }} aria-label="Sửa" className="rounded-lg p-1 text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-700">✎</button>
          <button
            onClick={() => confirm("Xoá việc này?") && dispatch({ type: "note/delete", id: note.id })}
            aria-label="Xoá"
            className="rounded-lg p-1 text-xs text-stone-400 hover:bg-red-50 hover:text-red-600"
          >
            🗑
          </button>
        </div>
      )}
    </li>
  );
}
