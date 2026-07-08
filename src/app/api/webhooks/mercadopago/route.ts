import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type MercadoPagoWebhookBody = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

type MercadoPagoPayment = {
  id?: number;
  status?: string;
  transaction_amount?: number;
  metadata?: {
    event_id?: string;
    tier_id?: string;
    tier_name?: string;
  };
};

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await readWebhookBody(request);
    const paymentId = extractPaymentId(url, body);
    const type = extractNotificationType(url, body);

    if (!paymentId || !isPaymentNotification(type)) {
      return ok();
    }

    const payment = await fetchMercadoPagoPayment(paymentId);

    if (payment.status !== "approved") {
      return ok();
    }

    const eventId = payment.metadata?.event_id;
    const tierId = payment.metadata?.tier_id;
    const tierName = payment.metadata?.tier_name;
    const price = Number(payment.transaction_amount);

    if (!eventId || !tierId || !tierName || !Number.isFinite(price)) {
      console.error("Mercado Pago webhook missing ticket metadata", {
        paymentId,
        metadata: payment.metadata,
      });
      return ok();
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("tickets").insert({
      event_id: eventId,
      user_id: null,
      tier_name: tierName,
      price,
      secret_seed: generateSecretSeed(),
      status: "active",
    });

    if (error) {
      console.error("Failed to insert ticket from Mercado Pago webhook", {
        paymentId,
        error,
      });
    }
  } catch (error) {
    console.error("Mercado Pago webhook failed", error);
  }

  return ok();
}

async function readWebhookBody(request: Request): Promise<MercadoPagoWebhookBody> {
  try {
    return (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return {};
  }
}

function extractPaymentId(url: URL, body: MercadoPagoWebhookBody) {
  const id =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    body.data?.id ??
    body.id;

  return id ? String(id) : null;
}

function extractNotificationType(url: URL, body: MercadoPagoWebhookBody) {
  return (
    url.searchParams.get("type") ??
    url.searchParams.get("topic") ??
    url.searchParams.get("action") ??
    body.type ??
    body.topic ??
    body.action ??
    null
  );
}

function isPaymentNotification(type: string | null) {
  return type === "payment" || type === "payment.created";
}

async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Missing MP_ACCESS_TOKEN environment variable.");
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Mercado Pago payment lookup failed: ${response.status}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

function generateSecretSeed() {
  return randomUUID().replace(/-/g, "");
}

function ok() {
  return new Response("OK", { status: 200 });
}
