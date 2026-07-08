import Link from "next/link";
import { createEvent } from "../actions";
import { SubmitButton } from "./submit-button";

type NewEventPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Revisa los campos obligatorios antes de crear el evento.",
  create_failed:
    "No pudimos crear el evento. Verifica tu sesion y la configuracion de Supabase.",
};

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-3xl">
        <header className="border-b border-line pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            Crear Evento
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Nuevo evento
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Define la informacion base para publicar el evento, controlar aforo
            y habilitar venta de entradas.
          </p>
        </header>

        <form action={createEvent} className="mt-8 space-y-6">
          {error ? (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium" htmlFor="title">
                Titulo
              </label>
              <input
                className="h-12 w-full border border-line bg-surface px-3 text-sm outline-none transition focus:border-accent"
                id="title"
                name="title"
                placeholder="Viernes Club Night"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                className="block text-sm font-medium"
                htmlFor="description"
              >
                Descripcion
              </label>
              <textarea
                className="min-h-28 w-full resize-y border border-line bg-surface px-3 py-3 text-sm outline-none transition focus:border-accent"
                id="description"
                name="description"
                placeholder="Lineup, horarios, beneficios y condiciones de ingreso."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="location">
                Ubicacion
              </label>
              <input
                className="h-12 w-full border border-line bg-surface px-3 text-sm outline-none transition focus:border-accent"
                id="location"
                name="location"
                placeholder="Club, venue o direccion"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="city">
                Ciudad
              </label>
              <input
                className="h-12 w-full border border-line bg-surface px-3 text-sm outline-none transition focus:border-accent"
                id="city"
                name="city"
                placeholder="Buenos Aires"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                htmlFor="event_date"
              >
                Fecha y hora
              </label>
              <input
                className="h-12 w-full border border-line bg-surface px-3 text-sm outline-none transition focus:border-accent"
                id="event_date"
                name="event_date"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="capacity">
                Capacidad
              </label>
              <input
                className="h-12 w-full border border-line bg-surface px-3 text-sm outline-none transition focus:border-accent"
                id="capacity"
                min="1"
                name="capacity"
                placeholder="500"
                type="number"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-3 border border-line bg-surface p-4">
            <input
              className="mt-1 h-4 w-4 accent-accent"
              defaultChecked
              name="is_public"
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold">Evento publico</span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                Aparece en la cartelera y puede filtrarse por ciudad. Si lo
                desactivas, solo se accede por link.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <Link
              className="flex h-12 items-center justify-center border border-line px-4 text-sm font-semibold transition hover:border-foreground"
              href="/dashboard"
            >
              Cancelar
            </Link>
            <SubmitButton />
          </div>
        </form>
      </section>
    </main>
  );
}

