"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, passwordRecoverySchema } from "@/features/auth/schemas/auth.schema";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signInAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard";
  const values = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!values.success) {
    return { error: values.error.errors[0]?.message ?? "Invalid login details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(values.data);

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

export async function resetPasswordAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const values = passwordRecoverySchema.safeParse({
    email: formData.get("email")
  });

  if (!values.success) {
    return { error: values.error.errors[0]?.message ?? "Invalid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(values.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password recovery email sent." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
