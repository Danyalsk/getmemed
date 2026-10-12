"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signupSchema, type SignupInput } from "@contracts/auth";
import type { Role } from "@contracts/common";

import { ChoiceTiles, type Choice } from "@/components/forms/choice-tiles";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { api, errorMessage } from "@/lib/api";
import { saveSession } from "@/lib/session";

const ROLE_CHOICES: readonly Choice<Role>[] = [
  { value: "creator", label: "Creator", hint: "I post memes & clips", colorClass: "bg-wl-green" },
  { value: "brand", label: "Brand", hint: "I run campaigns", colorClass: "bg-wl-purple" },
];

export default function SignupPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { role: "creator" } });

  const onSubmit = handleSubmit(async (input) => {
    try {
      saveSession(await api.signup(input));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Join Meme&apos;d</CardTitle>
        <CardDescription>Launch campaigns or get paid for your posts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="role"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <ChoiceTiles
                    legend="I am a"
                    name={field.name}
                    choices={ROLE_CHOICES}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            <TextField label="Name" autoComplete="name" error={errors.name} {...register("name")} />
            <TextField label="Email" type="email" autoComplete="email" error={errors.email} {...register("email")} />
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password}
              {...register("password")}
            />
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-bold underline underline-offset-4">
                Log in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
