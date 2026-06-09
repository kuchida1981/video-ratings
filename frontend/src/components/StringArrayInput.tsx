import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function StringArrayInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed)) { setDraft(""); return; }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-wrap gap-1 border rounded px-2 py-1 min-h-9 items-center">
      {value.map((v, i) => (
        <span key={i} className="flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs">
          {v}
          <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-20 text-sm bg-transparent outline-none"
        value={draft}
        placeholder={value.length === 0 ? "値を入力してEnter" : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
        }}
        onBlur={add}
      />
    </div>
  );
}
