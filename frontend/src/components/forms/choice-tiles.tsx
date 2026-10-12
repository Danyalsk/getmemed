import type { LucideIcon } from "lucide-react";

import { cn } from "cn";

import { FieldLegend, FieldSet } from "@/components/ui/field";

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: LucideIcon;
}

interface ChoiceTilesProps<T extends string> {
  legend: string;
  name: string;
  choices: readonly Choice<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Radio group rendered as tiles. Native radios keep keyboard and screen reader support. */
export function ChoiceTiles<T extends string>({ legend, name, choices, value, onChange }: ChoiceTilesProps<T>) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <div className="grid grid-cols-2 gap-3">
        {choices.map(({ value: choiceValue, label, hint, icon: Icon }) => {
          const selected = value === choiceValue;
          return (
            <label
              key={choiceValue}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring",
                selected ? "border-wl-lime bg-wl-lime/10" : "hover:bg-muted/60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={choiceValue}
                checked={selected}
                onChange={() => onChange(choiceValue)}
                className="sr-only"
              />
              <Icon className={cn("mt-0.5 size-4 shrink-0", selected ? "text-wl-lime" : "text-muted-foreground")} />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </FieldSet>
  );
}
