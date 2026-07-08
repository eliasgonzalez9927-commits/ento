"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = readRequiredString(formData, "title");
  const description = readOptionalString(formData, "description");
  const location = readOptionalString(formData, "location");
  const city = readOptionalString(formData, "city");
  const eventDate = readDateTime(formData, "event_date");
  const capacity = readPositiveInteger(formData, "capacity");
  const isPublic = formData.get("is_public") === "on";

  if (!title || !eventDate || !capacity) {
    redirect("/dashboard/events/new?error=invalid_form");
  }

  const { error } = await supabase.from("events").insert({
    owner_id: user.id,
    title,
    description,
    location,
    city,
    event_date: eventDate,
    capacity,
    is_public: isPublic,
    status: "published",
  });

  if (error) {
    redirect("/dashboard/events/new?error=create_failed");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readDateTime(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);

  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readPositiveInteger(formData: FormData, key: string) {
  const value = readRequiredString(formData, key);
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

