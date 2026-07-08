"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

type CheckoutPreferenceResult =
  | {
      ok: true;
      initPoint: string;
    }
  | {
      ok: false;
      error: string;
    };

const BACK_URLS = {
  success: "http://localhost:3000/e/success",
  failure: "http://localhost:3000/e/failure",
  pending: "http://localhost:3000/e/pending",
};

export async function createCheckoutPreference(
  tierId: string,
  eventId: string,
): Promise<CheckoutPreferenceResult> {
  try {
    if (!tierId || !eventId) {
      return {
        ok: false,
        error: "No pudimos identificar la entrada seleccionada.",
      };
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return {
        ok: false,
        error: "Mercado Pago todavia no esta configurado.",
      };
    }

    const supabase = await createClient();
    const [{ data: event, error: eventError }, { data: tier, error: tierError }] =
      await Promise.all([
        supabase
          .from("events")
          .select("id,title")
          .eq("id", eventId)
          .single(),
        supabase
          .from("ticket_tiers")
          .select("id,event_id,name,price")
          .eq("id", tierId)
          .eq("event_id", eventId)
          .single(),
      ]);

    if (eventError || tierError || !event || !tier) {
      return {
        ok: false,
        error: "La entrada seleccionada no esta disponible.",
      };
    }

    const unitPrice = Number(tier.price);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return {
        ok: false,
        error: "El precio de esta entrada no es valido.",
      };
    }

    const mercadoPago = new MercadoPagoConfig({
      accessToken,
    });
    const preference = new Preference(mercadoPago);
    const response = await preference.create({
      body: {
        items: [
          {
            id: tier.id,
            title: `${event.title} - ${tier.name}`,
            quantity: 1,
            unit_price: unitPrice,
            currency_id: "ARS",
          },
        ],
        back_urls: BACK_URLS,
        auto_return: "approved",
        external_reference: `${event.id}:${tier.id}`,
        metadata: {
          event_id: eventId,
          tier_id: tierId,
          tier_name: tier.name,
        },
      },
    });

    if (!response.init_point) {
      return {
        ok: false,
        error: "Mercado Pago no devolvio una URL de checkout.",
      };
    }

    return {
      ok: true,
      initPoint: response.init_point,
    };
  } catch (error) {
    console.error("createCheckoutPreference failed", error);

    return {
      ok: false,
      error: "No pudimos iniciar el checkout. Intenta nuevamente.",
    };
  }
}
