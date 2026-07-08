import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,location,city,event_date,capacity,is_public,status")
    .eq("owner_id", user.id)
    .order("event_date", { ascending: true });
  const organizerEvents = events ?? [];

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              Mis Eventos
            </h1>
            <p className="mt-3 text-sm text-muted">
              Gestiona tu calendario, aforo y visibilidad publica.
            </p>
          </div>
          <Link
            className="flex h-11 items-center justify-center border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black"
            href="/dashboard/events/new"
          >
            Crear Evento
          </Link>
        </header>

        {error ? (
          <div className="mt-8 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            No pudimos cargar tus eventos. Intenta nuevamente.
          </div>
        ) : null}

        {!error && organizerEvents.length === 0 ? (
          <div className="mt-8 border border-line bg-surface px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Primer paso
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Todavia no creaste eventos
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Crea tu primer evento para activar ticketing, links de RRPP,
              control de puerta y cashless.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black"
              href="/dashboard/events/new"
            >
              Crear tu primer evento
            </Link>
          </div>
        ) : null}

        {!error && organizerEvents.length > 0 ? (
          <div className="mt-8 overflow-hidden border border-line bg-surface shadow-sm">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.7fr_0.8fr] border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted md:grid">
              <span>Evento</span>
              <span>Fecha</span>
              <span>Ciudad</span>
              <span>Aforo</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-line">
              {organizerEvents.map((event) => (
                <article
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1.5fr_1fr_1fr_0.7fr_0.8fr] md:items-center"
                  key={event.id}
                >
                  <div>
                    <Link
                      className="font-semibold transition hover:text-accent"
                      href={`/dashboard/events/${event.id}`}
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {event.location ?? "Ubicacion pendiente"}
                    </p>
                  </div>
                  <p className="text-sm">{formatEventDate(event.event_date)}</p>
                  <p className="text-sm text-muted">
                    {event.city ?? "Sin ciudad"}
                  </p>
                  <p className="text-sm text-muted">{event.capacity}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-line px-2 py-1 text-xs font-medium text-muted">
                      {event.is_public ? "Publico" : "Privado"}
                    </span>
                    <span className="border border-line px-2 py-1 text-xs font-medium text-muted">
                      {event.status ?? "published"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
