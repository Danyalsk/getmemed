"use client";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const VALUE_FORMAT = "yyyy-MM-dd";

const toDate = (value: string): Date => parse(value, VALUE_FORMAT, new Date());

interface DateFieldProps {
  label: string;
  description?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  min: string;
  max: string;
  error?: FormFieldError | undefined;
}

export function DateField({ label, description, value, onChange, min, max, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  const selected = value ? toDate(value) : undefined;

  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            aria-invalid={error !== undefined}
            className="justify-between font-normal"
          >
            {selected ? format(selected, "d MMMM yyyy") : "Pick a date"}
            <CalendarIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            startMonth={toDate(min)}
            endMonth={toDate(max)}
            disabled={[{ before: toDate(min) }, { after: toDate(max) }]}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, VALUE_FORMAT));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
