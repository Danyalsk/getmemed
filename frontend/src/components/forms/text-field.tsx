import type { ComponentProps } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  error?: FormFieldError | undefined;
};

/** Labelled input wired for react-hook-form: spread `register(name)` into it. */
export function TextField({ label, error, id, name, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input id={inputId} name={name} aria-invalid={error !== undefined} {...props} />
      <FieldError errors={[error]} />
    </Field>
  );
}
