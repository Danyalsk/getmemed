"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2Icon, LoaderCircleIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { signupSchema } from "@contracts/auth";
import type { Role } from "@contracts/common";

import { ChoiceTiles, type Choice } from "@/components/forms/choice-tiles";
import { PasswordField } from "@/components/forms/password-field";
import { PageTransition } from "@/components/page-transition";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS } from "../auth-styles";

const ROLE_CHOICES: readonly Choice<Role>[] = [
  { value: "creator", label: "Creator", hint: "Post content and earn", icon: UserRoundIcon },
  { value: "brand", label: "Brand", hint: "Run paid campaigns", icon: Building2Icon },
];

const signupFormSchema = signupSchema
  .extend({ confirmPassword: z.string().min(1, "Confirm your password") })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { role: "creator" },
  });
  const role = useWatch({ control, name: "role" });

  const signup = useMutation({
    mutationFn: api.signup,
    onSuccess: saveSession,
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = handleSubmit((values) => signup.mutate(signupSchema.parse(values)));

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Get set up in under a minute.</p>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <ChoiceTiles
                  legend="I'm joining as"
                  name={field.name}
                  choices={ROLE_CHOICES}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <TextField
              className={AUTH_INPUT_CLASS}
              label={role === "brand" ? "Brand name" : "Full name"}
              autoComplete={role === "brand" ? "organization" : "name"}
              placeholder={role === "brand" ? "Company or brand name" : "Your name"}
              error={errors.name}
              {...register("name")}
            />
            <TextField
              className={AUTH_INPUT_CLASS}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email}
              {...register("email")}
            />
            <PasswordField
              className={AUTH_INPUT_CLASS}
              label="Password"
              autoComplete="new-password"
              description="At least 8 characters."
              error={errors.password}
              {...register("password")}
            />
            <PasswordField
              className={AUTH_INPUT_CLASS}
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <Button type="submit" className={AUTH_SUBMIT_CLASS} disabled={signup.isPending}>
              {signup.isPending && <LoaderCircleIcon className="animate-spin" />}
              Create account
            </Button>
          </FieldGroup>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
