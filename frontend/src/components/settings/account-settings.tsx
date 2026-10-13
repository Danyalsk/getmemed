"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { changePasswordSchema, updateProfileSchema, type AuthResponse, type UpdateProfileInput } from "@contracts/auth";

import { Panel } from "@/components/analytics/panel";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { saveSession, useSession } from "@/lib/session";

const passwordFormSchema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, "Confirm your new password") })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function ProfileForm({ session }: { session: AuthResponse }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: session.user.name },
  });

  const update = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (user) => {
      saveSession({ ...session, user });
      reset({ name: user.name });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Panel title="Profile" description="How brands and creators see you on Meme'd.">
      <form onSubmit={handleSubmit((input) => update.mutate(input))} noValidate>
        <FieldGroup>
          <TextField
            label={session.user.role === "brand" ? "Brand name" : "Full name"}
            autoComplete="name"
            error={errors.name}
            {...register("name")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Email</span>
              <Input value={session.user.email} readOnly disabled aria-label="Email" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Account type</span>
              <Input value={session.user.role === "brand" ? "Brand" : "Creator"} readOnly disabled aria-label="Account type" />
            </div>
          </div>
          <Button type="submit" className="self-start" disabled={!isDirty || update.isPending}>
            {update.isPending && <LoaderCircleIcon className="animate-spin" />}
            Save changes
          </Button>
        </FieldGroup>
      </form>
    </Panel>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordFormSchema) });

  const change = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      reset();
      toast.success("Password changed");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = handleSubmit((values) => change.mutate(changePasswordSchema.parse(values)));

  return (
    <Panel title="Password" description="Use at least 8 characters. You'll stay logged in on this device.">
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword}
            {...register("currentPassword")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField label="New password" autoComplete="new-password" error={errors.newPassword} {...register("newPassword")} />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </div>
          <Button type="submit" className="self-start" disabled={change.isPending}>
            {change.isPending && <LoaderCircleIcon className="animate-spin" />}
            Change password
          </Button>
        </FieldGroup>
      </form>
    </Panel>
  );
}

export function AccountSettings() {
  const session = useSession();

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and password." />
      {session && (
        <div className="flex max-w-3xl flex-col gap-5">
          <ProfileForm session={session} />
          <PasswordForm />
        </div>
      )}
    </>
  );
}
