import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { syncAuthUser } from "@/lib/auth/sync-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = normalizeNextPath(requestUrl.searchParams.get("next"));

  if (!code && (!tokenHash || !isEmailOtpType(type))) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash as string,
        type: type as EmailOtpType,
      });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_code", requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_code", requestUrl.origin),
    );
  }

  try {
    await syncAuthUser(user);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=user_sync_failed", requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}
