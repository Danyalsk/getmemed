"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = Omit<ComponentProps<"input">, "type"> & {
  label: string;
  description?: string;
  error?: FormFieldError | undefined;
};

/** Password input with a show/hide toggle. Spread `register(name)` into it. */
export function PasswordField({ label, description, error, ...props }: PasswordFieldProps) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <Input id={inputId} type={visible ? "text" : "password"} aria-invalid={error !== undefined} className="pr-10" {...props} />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
