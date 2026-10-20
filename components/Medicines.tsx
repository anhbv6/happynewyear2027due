"use client";

import { useState } from "react";
import type { Action, AppState, Medicine } from "@/lib/types";
import MedForm from "./MedForm";

/** Danh sách thuốc chung — áp dụng cho mọi ngày trong lịch. */
export default function Medicines({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">💊 Danh sách thuốc</h2>
        {!adding && <button onClick={() => setAdding(true)} className="btn-ghost px-3 py-1.5 text-xs">+ Thêm</button>}
      </div>

      {adding && (
        <div className="mb-3">
          <MedForm
            onCancel={() => setAdding(false)}
            onAdd={(med) => {
              dispatch({ type: "med/add", med });
              setAdding(false);
            }}
          />
        </div>
      )}

      {state.medicines.length === 0 && !adding && (
        <p className="py-4 text-center text-sm text-stone-400">Chưa có thuốc nào.</p>
      )}

      <ul className="space-y-1.5">
        {state.medicines.map((m) =>
          editing === m.id ? (
            <EditMed key={m.id} med={m} onDone={() => setEditing(null)} dispatch={dispatch} />
          ) : (
            <li key={m.id} className="flex items-center gap-2 rounded-xl border border-stone-100 px-3 py-2">
              <p className="min-w-0 flex-1 text-sm font-medium">{m.name}</p>
              <button onClick={() => setEditing(m.id)} aria-label="Sửa" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">✎</button>
              <button
                onClick={() => confirm(`Xoá thuốc "${m.name}"? Lịch sử uống thuốc này cũng sẽ bị xoá.`) && dispatch({ type: "med/delete", id: m.id })}
                aria-label="Xoá"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
              >
                🗑
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function EditMed({ med, onDone, dispatch }: { med: Medicine; onDone: () => void; dispatch: (a: Action) => void }) {
  const [name, setName] = useState(med.name);
  const save = () => {
    if (name.trim() && name.trim() !== med.name) dispatch({ type: "med/update", med: { ...med, name: name.trim() } });
    onDone();
  };
  return (
    <li className="flex gap-2">
      <input
        className="input py-1.5"
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") onDone();
        }}
      />
      <button className="btn-primary shrink-0" disabled={!name.trim()} onClick={save}>Lưu</button>
    </li>
  );
}
