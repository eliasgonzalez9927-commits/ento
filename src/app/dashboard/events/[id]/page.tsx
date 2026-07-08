import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTicketTier } from "./actions";
import { SubmitButton } from "./submit-button";

export const dynamic = "force-dynamic";

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_tier: "Completa nombre, precio y capacidad con valores validos.",
  create_tier_failed: "No pudimos crear el tipo de entrada. Intenta nuevamente.",
};

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: event, error: eventError }, { data: tiers, error: tiersError }] =
    await Promise.all([
      supabase
        .from("events")
        .select(
          "id,title,description,location,city,event_date,capacity,is_public,status",
        )
        .eq("id", id)
        .eq("owner_id", user.id)
        .single(),
      supabase
        .from("ticket_tiers")
        .select("id,name,price,capacity,created_at")
        .eq("event_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (eventError || !event) {
    notFound();
  }

  const ticketTiers = tiers ?? [];
  const error = query.error ? errorMessages[query.error] : null;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <Link
          className="text-sm font-medium text-muted transition hover:text-foreground"
          href="/dashboard"
        >
          Volver a Mis Eventos
        </Link>

        <header className="mt-6 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Evento
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {event.description ?? "Sin descripcion cargada."}
            </p>
          </div>

          <div className="grid gap-3 border border-line bg-surface p-4 text-sm">
            <Detail label="Fecha" value={formatEventDate(event.event_date)} />
            <Detail label="Ciudad" value={event.city ?? "Sin ciudad"} />
            <Detail
              label="Ubicacion"
              value={event.location ?? "Ubicacion pendiente"}
            />
            <Detail label="Capacidad" value={String(event.capacity)} />
            <Detail
              label="Visibilidad"
              value={event.is_public ? "Publico" : "Privado"}
            />
          </div>
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                  Ticketing
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Tipos de entradas
                </h2>
              </div>
            </div>

            {tiersError ? (
              <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
                No pudimos cargar los tipos de entradas.
              </div>
            ) : null}

            {!tiersError && ticketTiers.length === 0 ? (
              <div className="mt-5 border border-line bg-surface px-6 py-10 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                  Sin lotes
                </p>
                <h3 className="mt-3 text-xl font-semibold">
                  Crea tu primer tipo de entrada
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                  Agrega preventas, generales, VIP o RSVP gratuito para empezar
                  a vender.
                </p>
              </div>
            ) : null}

            {!tiersError && ticketTiers.length > 0 ? (
              <div className="mt-5 overflow-hidden border border-line bg-surface">
                <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr] border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  <span>Nombre</span>
                  <span>Precio</span>
                  <span>Capacidad</span>
                </div>
                <div className="divide-y divide-line">
                  {ticketTiers.map((tier) => (
                    <article
                      className="grid grid-cols-[1.2fr_0.7fr_0.7fr] items-center px-4 py-4 text-sm"
                      key={tier.id}
                    >
                      <h3 className="font-semibold">{tier.name}</h3>
                      <p className="text-muted">{formatPrice(tier.price)}</p>
                      <p className="text-muted">{tier.capacity}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">Agregar tipo</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Define nombre, precio y stock disponible para este lote.
            </p>

            <form action={createTicketTier} className="mt-5 space-y-4">
              <input name="event_id" type="hidden" value={event.id} />

              {error ? (
                <div className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="name">
                  Nombre
                </label>
                <input
                  className="h-11 w-full border border-line bg-background px-3 text-sm outline-none transition focus:border-accent"
                  id="name"
                  name="name"
                  placeholder="Preventa 1"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <label className="block text-sm font-medium" htmlFor="price">
                    Precio
                  </label>
                  <input
                    className="h-11 w-full border border-line bg-background px-3 text-sm outline-none transition focus:border-accent"
                    id="price"
                    min="0"
                    name="price"
                    placeholder="0"
                    step="0.01"
                    type="number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium"
                    htmlFor="capacity"
                  >
                    Capacidad
                  </label>
                  <input
                    className="h-11 w-full border border-line bg-background px-3 text-sm outline-none transition focus:border-accent"
                    id="capacity"
                    min="1"
                    name="capacity"
                    placeholder="100"
                    type="number"
                    required
                  />
                </div>
              </div>

              <SubmitButton />
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
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

