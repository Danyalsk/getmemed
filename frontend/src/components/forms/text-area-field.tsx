import { useId, type ComponentProps } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type TextAreaFieldProps = ComponentProps<"textarea"> & {
  label: string;
  description?: string;
  error?: FormFieldError | undefined;
};

export function TextAreaField({ label, description, error, ...props }: TextAreaFieldProps) {
  const inputId = useId();
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Textarea id={inputId} aria-invalid={error !== undefined} {...props} />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
