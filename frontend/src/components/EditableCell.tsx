import { useState, useEffect, useRef } from "react";
import type { CustomFieldDefinition } from "@/types";

export function formatCustomValue(value: unknown, fieldType: CustomFieldDefinition["field_type"]): string {
  if (value === null || value === undefined) return "—";
  if (fieldType === "boolean") return value ? "✓" : "—";
  if (fieldType === "date" && typeof value === "string") return value.slice(0, 10);
  return String(value);
}

export interface EditableCellProps {
  entityId: number;
  fieldName: string;
  fieldType: CustomFieldDefinition["field_type"];
  initialValue: unknown;
  onUpdate?: (entityId: number, fieldName: string, value: unknown) => Promise<void>;
}

function getInitialStateValue(val: unknown, type: CustomFieldDefinition["field_type"]) {
  if (type === "boolean") {
    return !!val;
  }
  if (val === null || val === undefined) {
    return "";
  }
  if (type === "date" && typeof val === "string") {
    return val.slice(0, 10);
  }
  return String(val);
}

export function EditableCell({
  entityId,
  fieldName,
  fieldType,
  initialValue,
  onUpdate,
}: EditableCellProps) {
  const [value, setValue] = useState<string | boolean>(() =>
    getInitialStateValue(initialValue, fieldType)
  );
  const [isError, setIsError] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;
  const lastSavedRef = useRef<string | boolean>(getInitialStateValue(initialValue, fieldType));

  useEffect(() => {
    const v = getInitialStateValue(initialValue, fieldType);
    setValue(v);
    lastSavedRef.current = v;
    setIsError(false);
  }, [initialValue, fieldType]);

  const save = (submitValue: unknown, displayValue: string | boolean) => {
    if (!onUpdate) return;
    onUpdate(entityId, fieldName, submitValue)
      .then(() => {
        setIsError(false);
        lastSavedRef.current = displayValue;
      })
      .catch(() => {
        setIsError(true);
        setValue(lastSavedRef.current);
      });
  };

  const handleBlur = () => {
    if (fieldType === "boolean") return;
    const trimmed = (valueRef.current as string).trim();
    if (trimmed !== valueRef.current) {
      setValue(trimmed);
    }
    let submitValue: unknown = trimmed;
    if (trimmed === "") {
      submitValue = null;
    } else if (fieldType === "number") {
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        setIsError(true);
        setValue(lastSavedRef.current);
        return;
      }
      submitValue = num;
    }
    if (trimmed !== lastSavedRef.current) {
      save(submitValue, trimmed);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsError(false);
    if (fieldType === "boolean") {
      const nextVal = e.target.checked;
      setValue(nextVal);
      save(nextVal, nextVal);
    } else {
      setValue(e.target.value);
    }
  };

  const baseInputClass = "w-full bg-transparent border rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
  const inputClass = isError ? `${baseInputClass} ring-2 ring-destructive` : baseInputClass;

  if (fieldType === "boolean") {
    return (
      <input
        type="checkbox"
        checked={value as boolean}
        onChange={handleChange}
        className={isError ? "h-4 w-4 ring-2 ring-destructive" : "h-4 w-4"}
      />
    );
  }

  return (
    <input
      type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
      value={value as string}
      onChange={handleChange}
      onBlur={handleBlur}
      className={inputClass}
    />
  );
}
