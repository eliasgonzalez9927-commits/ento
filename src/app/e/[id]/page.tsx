import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutButton } from "./checkout-button";

export const dynamic = "force-dynamic";

type PublicEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event, error: eventError }, { data: tiers }] =
    await Promise.all([
      supabase
        .from("events")
        .select(
          "id,title,description,location,city,event_date,capacity,is_public,status",
        )
        .eq("id", id)
        .single(),
      supabase
        .from("ticket_tiers")
        .select("id,name,price,capacity")
        .eq("event_id", id)
        .order("price", { ascending: true }),
    ]);

  if (eventError || !event) {
    notFound();
  }

  const ticketTiers = tiers ?? [];

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-32 text-foreground sm:px-6 lg:px-10 lg:pb-12">
      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="border-b border-line bg-foreground px-6 py-16 text-background sm:px-10 sm:py-20">
              <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-70">
                Ento presenta
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
                {event.title}
              </h1>
              <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
                <HeroFact label="Fecha" value={formatEventDate(event.event_date)} />
                <HeroFact
                  label="Ubicacion"
                  value={event.location ?? "Ubicacion a confirmar"}
                />
                <HeroFact label="Ciudad" value={event.city ?? "Sin ciudad"} />
              </div>
            </div>

            <div className="grid gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_240px]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                  Descripcion
                </p>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-8 text-muted">
                  {event.description ??
                    "El organizador todavia no cargo una descripcion para este evento."}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-background p-4">
                <p className="text-sm font-semibold">Estado del evento</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Detail label="Aforo" value={`${event.capacity} personas`} />
                  <Detail
                    label="Acceso"
                    value={event.is_public ? "Publico" : "Por link"}
                  />
                  <Detail label="Estado" value={event.status ?? "Publicado"} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Info de compra
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Elegi tu entrada y conserva el QR dinamico en tu cuenta.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              En el siguiente paso conectaremos esta seleccion con la pasarela de
              pagos. Por ahora, los botones confirman la seleccion para dejar
              preparada la experiencia de checkout.
            </p>
          </section>
        </div>

        <aside className="sticky bottom-4 z-20 self-start rounded-2xl border border-line bg-surface p-5 shadow-sm lg:top-8">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                Entradas
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Checkout</h2>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
              {ticketTiers.length} lotes
            </span>
          </div>

          {ticketTiers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-lg font-semibold">Entradas proximamente</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                El organizador todavia no publico tipos de entrada para este
                evento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {ticketTiers.map((tier) => (
                <article
                  className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
                  key={tier.id}
                >
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {tier.capacity} disponibles
                    </p>
                    <p className="mt-3 text-xl font-semibold">
                      {formatPrice(tier.price)}
                    </p>
                  </div>
                  <CheckoutButton
                    eventId={event.id}
                    eventTitle={event.title}
                    tierId={tier.id}
                    tierName={tier.name}
                  />
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.16em] opacity-60">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  if (value === 0) {
    return "Gratis";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}
