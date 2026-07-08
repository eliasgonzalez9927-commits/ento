"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type ValidationResult =
  | {
      success: true;
      ticket: {
        id: string;
        tierName: string;
        status: string;
        createdAt: string | null;
      };
    }
  | {
      success: false;
      error: string;
    };

const WINDOW_MS = 30_000;

export async function validateTicket(
  scannedToken: string,
): Promise<ValidationResult> {
  const decoded = decodeToken(scannedToken);

  if (!decoded) {
    return {
      success: false,
      error: "Codigo invalido",
    };
  }

  const { secretSeed, timeBlock } = decoded;
  const currentTimeBlock = Math.floor(Date.now() / WINDOW_MS);

  if (Math.abs(currentTimeBlock - timeBlock) > 1) {
    return {
      success: false,
      error: "Codigo expirado",
    };
  }

  const supabase = createAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id,tier_name,status,created_at")
    .eq("secret_seed", secretSeed)
    .maybeSingle();

  if (error) {
    console.error("Ticket validation lookup failed", error);
    return {
      success: false,
      error: "No pudimos validar",
    };
  }

  if (!ticket) {
    return {
      success: false,
      error: "Entrada falsa",
    };
  }

  if (ticket.status === "used") {
    return {
      success: false,
      error: "Entrada ya utilizada",
    };
  }

  if (ticket.status !== "active") {
    return {
      success: false,
      error: "Entrada inactiva",
    };
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "used",
      scanned_at: new Date().toISOString(),
    })
    .eq("id", ticket.id)
    .eq("status", "active")
    .select("id,tier_name,status,created_at")
    .single();

  if (updateError || !updatedTicket) {
    console.error("Ticket validation update failed", updateError);
    return {
      success: false,
      error: "No pudimos marcar la entrada",
    };
  }

  return {
    success: true,
    ticket: {
      id: updatedTicket.id,
      tierName: updatedTicket.tier_name ?? "Entrada",
      status: updatedTicket.status ?? "used",
      createdAt: updatedTicket.created_at,
    },
  };
}

function decodeToken(scannedToken: string) {
  try {
    const decoded = Buffer.from(scannedToken, "base64").toString("utf-8");
    const separatorIndex = decoded.lastIndexOf("_");

    if (separatorIndex === -1) {
      return null;
    }

    const secretSeed = decoded.slice(0, separatorIndex);
    const timeBlock = Number(decoded.slice(separatorIndex + 1));

    if (
      secretSeed.length !== 32 ||
      !/^[a-zA-Z0-9]+$/.test(secretSeed) ||
      !Number.isInteger(timeBlock)
    ) {
      return null;
    }

    return {
      secretSeed,
      timeBlock,
    };
  } catch {
    return null;
  }
}

