import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ColumnDef } from "@/types";

interface ColumnGroup<T> {
  label: string;
  columns: ColumnDef<T>[];
}

interface ColumnConfigPopoverProps<T> {
  groups: ColumnGroup<T>[];
  visibleIds: string[];
  onToggle: (id: string) => void;
}

function Checkbox({ checked, disabled, onCheckedChange }: {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(v) => onCheckedChange?.(v === true)}
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
    >
      <CheckboxPrimitive.Indicator>
        <Check size={10} className="text-primary-foreground" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function ColumnConfigPopover<T>({ groups, visibleIds, onToggle }: ColumnConfigPopoverProps<T>) {
  const visibleGroups = groups.filter((g) => g.columns.length > 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 size={14} />
          列を設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>表示列の設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{group.label}</p>
              <div className="space-y-2">
                {group.columns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={visibleIds.includes(col.id)}
                      disabled={col.required}
                      onCheckedChange={() => onToggle(col.id)}
                    />
                    <span className="text-sm">{col.label}</span>
                    {col.required && (
                      <span className="text-xs text-muted-foreground">（必須）</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
