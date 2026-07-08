"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { syncAuthUser } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_PATH = "/dashboard";

export async function signInWithGoogle() {
  const origin = await getOrigin();
  let target = "/login?error=oauth_failed";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          DASHBOARD_PATH,
        )}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (!error && data.url) {
      target = data.url;
    }
  } catch {
    target = "/login?error=server_config";
  }

  redirect(target);
}

export async function sendMagicLink(formData: FormData) {
  const email = readEmail(formData);
  const origin = await getOrigin();
  let target = "/login?error=magic_link_failed";

  if (!email) {
    redirect("/login?error=email_required");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          DASHBOARD_PATH,
        )}`,
        shouldCreateUser: true,
      },
    });

    target = error
      ? "/login?error=magic_link_failed"
      : `/login?sent=1&email=${encodeURIComponent(email)}`;
  } catch {
    target = "/login?error=server_config";
  }

  redirect(target);
}

export async function signInStaff(formData: FormData) {
  const email = readEmail(formData);
  const password = readString(formData, "password");
  let target = "/login/staff?error=invalid_credentials";

  if (!email || !password) {
    redirect("/login/staff?error=missing_credentials");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      target = "/login/staff?error=invalid_credentials";
    } else {
      await syncAuthUser(data.user);
      target = DASHBOARD_PATH;
    }
  } catch {
    target = "/login/staff?error=server_config";
  }

  redirect(target);
}

async function getOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (origin) {
    return origin;
  }

  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

function readEmail(formData: FormData) {
  const email = readString(formData, "email")?.toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

