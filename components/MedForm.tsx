"use client";

import { useState } from "react";
import { FIELD_SM } from "@/lib/ui";
import { uid } from "@/lib/date";
import type { Medicine } from "@/lib/types";

/** Form thêm thuốc vào danh sách chung: chỉ cần tên. */
export default function MedForm({
  onAdd,
  onCancel,
  compact,
}: {
  onAdd: (m: Medicine) => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: uid(), name: name.trim() });
    setName("");
  };

  return (
    <form onSubmit={submit} className="flex gap-1.5">
      <input
        className={compact ? FIELD_SM : "input"}
        placeholder="Tên thuốc"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button type="submit" className={`btn-primary shrink-0 ${compact ? "h-8 px-3 py-0 text-xs" : ""}`} disabled={!name.trim()}>
        Thêm
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className={`btn-ghost shrink-0 ${compact ? "h-8 px-2.5 py-0 text-xs" : ""}`}>
          Huỷ
        </button>
      )}
    </form>
  );
}
