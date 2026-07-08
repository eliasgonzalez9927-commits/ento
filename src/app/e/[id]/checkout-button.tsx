"use client";

import { useState, useTransition } from "react";
import { createCheckoutPreference } from "./actions";

type CheckoutButtonProps = {
  eventTitle: string;
  eventId: string;
  tierId: string;
  tierName: string;
};

export function CheckoutButton({
  eventTitle,
  eventId,
  tierId,
  tierName,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCheckout() {
    setError(null);

    startTransition(async () => {
      const result = await createCheckoutPreference(tierId, eventId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      window.location.href = result.initPoint;
    });
  }

  return (
    <div className="space-y-2">
      <button
        aria-label={`Comprar ${tierName} para ${eventTitle}`}
        className="h-10 w-full rounded-xl border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={isPending}
        onClick={handleCheckout}
        type="button"
      >
        {isPending ? "Generando pago..." : "Comprar"}
      </button>
      {error ? (
        <p className="max-w-44 text-xs leading-5 text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
