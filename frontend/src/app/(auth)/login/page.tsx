"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@contracts/auth";

import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to your brand or creator account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <TextField label="Email" type="email" autoComplete="email" error={errors.email} {...register("email")} />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password}
              {...register("password")}
            />
            <Button type="submit" size="lg" disabled={login.isPending}>
              {login.isPending ? "Logging in…" : "Log in"}
            </Button>
            <p className="text-center text-sm">
              New here?{" "}
              <Link href="/signup" className="font-bold underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
