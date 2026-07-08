"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTicketTier(formData: FormData) {
  const eventId = readRequiredString(formData, "event_id");
  const name = readRequiredString(formData, "name");
  const price = readNonNegativeNumber(formData, "price");
  const capacity = readPositiveInteger(formData, "capacity");

  if (!eventId || !name || price === null || !capacity) {
    redirect(buildEventPath(eventId, "invalid_tier"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    redirect("/dashboard");
  }

  const { error } = await supabase.from("ticket_tiers").insert({
    event_id: eventId,
    name,
    price,
    capacity,
  });

  if (error) {
    redirect(buildEventPath(eventId, "create_tier_failed"));
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  redirect(`/dashboard/events/${eventId}`);
}

function buildEventPath(eventId: string | null, error: string) {
  const path = eventId ? `/dashboard/events/${eventId}` : "/dashboard";
  return `${path}?error=${error}`;
}

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNonNegativeNumber(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function readPositiveInteger(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

