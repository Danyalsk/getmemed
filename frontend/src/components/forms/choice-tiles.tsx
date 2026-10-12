import { cn } from "cn";

import { FieldLegend, FieldSet } from "@/components/ui/field";

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint?: string;
  /** Background shown when selected. */
  colorClass: string;
}

interface ChoiceTilesProps<T extends string> {
  legend: string;
  name: string;
  choices: readonly Choice<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

/** Radio group rendered as chunky tiles. Native radios keep keyboard and screen reader support. */
export function ChoiceTiles<T extends string>({
  legend,
  name,
  choices,
  value,
  onChange,
}: ChoiceTilesProps<T>) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className={cn(
              "flex cursor-pointer flex-col gap-0.5 rounded-lg border-2 border-ink bg-card p-3 transition-[transform,box-shadow]",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
              value === choice.value ? cn(choice.colorClass, "shadow-brutal") : "hover:bg-muted",
            )}
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              className="sr-only"
            />
            <span className="font-heading text-base">{choice.label}</span>
            {choice.hint && <span className="text-xs font-medium">{choice.hint}</span>}
          </label>
        ))}
      </div>
    </FieldSet>
  );
}
