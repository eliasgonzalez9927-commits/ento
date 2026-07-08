export default function Home() {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Ento
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-5xl">
              Ticketing, cashless y control de acceso para eventos nocturnos.
            </h1>
          </div>
          <div className="hidden border border-line bg-surface px-4 py-3 text-sm font-medium sm:block">
            Supabase {hasSupabaseEnv ? "configurado" : "pendiente"}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Directorio", "Eventos publicos por ciudad y privados por link."],
            ["Ticketing", "Lotes online, puerta fisica y tracking RRPP."],
            ["Cashless", "Ledger por evento para cargas, consumos y saldos."],
          ].map(([title, description]) => (
            <article
              className="border border-line bg-surface p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold">Base lista para construir</h2>
            <div className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
              {[
                "Next.js App Router",
                "React + TypeScript",
                "Tailwind CSS 4",
                "Supabase SSR/browser clients",
                "PostgreSQL migration inicial",
                "Variables de entorno versionadas",
              ].map((item) => (
                <div className="border border-line px-3 py-2" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside
            className="border border-line bg-foreground p-6 text-background"
            aria-label="Estado de conexion"
          >
            <p className="text-sm uppercase tracking-[0.18em] opacity-70">
              Conexion
            </p>
            <p className="mt-4 text-2xl font-semibold">
              {hasSupabaseEnv
                ? "Credenciales detectadas"
                : "Agrega tus credenciales de Supabase"}
            </p>
            <p className="mt-4 text-sm leading-6 opacity-75">
              Copia `.env.example` a `.env.local` y completa la URL del proyecto
              y la anon key para habilitar Auth, consultas y sesiones SSR.
            </p>
          </aside>
        </section>
      </section>
    </main>
  );
}
