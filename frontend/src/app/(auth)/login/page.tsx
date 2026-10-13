"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@contracts/auth";

import { PasswordField } from "@/components/forms/password-field";
import { PageTransition } from "@/components/page-transition";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS } from "../auth-styles";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const login = useMutation({
    mutationFn: api.login,
    onSuccess: saveSession,
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = handleSubmit((input) => login.mutate(input));

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Log in</h1>
          <p className="text-sm text-muted-foreground lg:text-base">Welcome back. Enter your details to continue.</p>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
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
              autoComplete="current-password"
              error={errors.password}
              {...register("password")}
            />
            <Button type="submit" className={AUTH_SUBMIT_CLASS} disabled={login.isPending}>
              {login.isPending && <LoaderCircleIcon className="animate-spin" />}
              Log in
            </Button>
          </FieldGroup>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
