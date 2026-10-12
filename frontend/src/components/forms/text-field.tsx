import { useId, type ComponentProps } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  description?: string;
  error?: FormFieldError | undefined;
};

export function TextField({ label, description, error, ...props }: TextFieldProps) {
  const inputId = useId();
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input id={inputId} aria-invalid={error !== undefined} {...props} />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
