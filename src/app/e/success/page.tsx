import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DynamicQR } from "@/app/components/DynamicQR";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    preference_id?: string;
  }>;
};

type TicketViewModel = {
  id: string;
  tierName: string;
  secretSeed: string;
  price: number;
  createdAt: string | null;
  event: {
    title: string;
    eventDate: string;
    location: string | null;
    city: string | null;
  } | null;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const ticket = await findRecentTicket();

  return (
    <main className="min-h-screen bg-[#07080b] px-4 py-8 text-white sm:px-6 lg:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-200">
            Pago aprobado
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-6xl">
            Entrada Confirmada!
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
            Tu ticket esta listo. Presenta este QR dinamico en puerta; cambia
            cada 30 segundos para evitar capturas de pantalla.
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm">
            <Detail label="Evento" value={ticket?.event?.title ?? "Procesando"} />
            <Detail
              label="Fecha"
              value={
                ticket?.event
                  ? formatEventDate(ticket.event.eventDate)
                  : "A confirmar"
              }
            />
            <Detail
              label="Ubicacion"
              value={formatLocation(ticket?.event?.location, ticket?.event?.city)}
            />
            <Detail label="Entrada" value={ticket?.tierName ?? "Pendiente"} />
            <Detail
              label="Pago"
              value={params.payment_id ? `#${params.payment_id}` : "Confirmado"}
            />
          </div>

          {!ticket ? (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Estamos terminando de emitir tu entrada. Si el QR no aparece,
              actualiza esta pagina en unos segundos.
            </div>
          ) : null}

          <Link
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:border-teal-200 hover:text-teal-200"
            href="/"
          >
            Volver a Ento
          </Link>
        </div>

        <aside className="self-start rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm shadow-teal-500/10 lg:sticky lg:top-8">
          {ticket ? (
            <>
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">
                  QR dinamico
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{ticket.tierName}</h2>
              </div>
              <DynamicQR secretSeed={ticket.secretSeed} />
              <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
                Ticket {ticket.id}
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
              <p className="text-xl font-semibold">Generando QR</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                El webhook de Mercado Pago esta creando tu ticket.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

async function findRecentTicket(): Promise<TicketViewModel | null> {
  try {
    const supabase = createAdminClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("id,event_id,tier_name,price,secret_seed,created_at")
      .eq("status", "active")
      .gte("created_at", fiveMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !ticket) {
      if (error) {
        console.error("Failed to fetch recent ticket", error);
      }

      return null;
    }

    const event = ticket.event_id
      ? await findEventForTicket(ticket.event_id)
      : null;

    return {
      id: ticket.id,
      tierName: ticket.tier_name ?? "Entrada",
      secretSeed: ticket.secret_seed,
      price: ticket.price,
      createdAt: ticket.created_at,
      event,
    };
  } catch (error) {
    console.error("Success page ticket lookup failed", error);
    return null;
  }
}

async function findEventForTicket(eventId: string) {
  const supabase = createAdminClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("title,event_date,location,city")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !event) {
    if (error) {
      console.error("Failed to fetch ticket event", error);
    }

    return null;
  }

  return {
    title: event.title,
    eventDate: event.event_date,
    location: event.location,
    city: event.city,
  };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-zinc-400">{label}</span>
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

function formatLocation(location?: string | null, city?: string | null) {
  if (location && city) {
    return `${location}, ${city}`;
  }

  return location ?? city ?? "A confirmar";
}

