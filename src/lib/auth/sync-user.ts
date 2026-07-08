import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncAuthUser(user: User) {
  if (!user.email) {
    throw new Error("Cannot sync an auth user without an email.");
  }

  const fullName =
    stringMetadata(user.user_metadata.full_name) ??
    stringMetadata(user.user_metadata.name);

  const supabase = createAdminClient();
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: "user",
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to sync public user: ${error.message}`);
  }
}

function stringMetadata(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

