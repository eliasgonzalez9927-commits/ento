import Link from "next/link";
import { sendMagicLink, signInWithGoogle } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    email?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  email_required: "Ingresa un correo valido para recibir el acceso.",
  invalid_code: "El codigo de acceso expiro o no es valido.",
  magic_link_failed: "No pudimos enviar el codigo. Intenta nuevamente.",
  oauth_failed: "No pudimos iniciar sesion con Google.",
  server_config: "La autenticacion todavia no esta configurada.",
  user_sync_failed: "No pudimos preparar tu perfil. Intenta nuevamente.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;
  const sent = params.sent === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md border border-line bg-surface p-6 shadow-sm">
        <div className="border-b border-line pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            Ento
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Accede a tus entradas
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Entra con Google o recibe un codigo seguro por correo para gestionar
            tickets, saldo cashless y eventos.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {error ? (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {sent ? (
            <div className="border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-900/70 dark:bg-teal-950/40 dark:text-teal-100">
              Te enviamos el acceso a {params.email ?? "tu correo"}. Revisa tu
              inbox para continuar.
            </div>
          ) : null}

          <form action={signInWithGoogle}>
            <button
              className="h-12 w-full border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black"
              type="submit"
            >
              Continuar con Google
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
            <span className="h-px flex-1 bg-line" />
            o
            <span className="h-px flex-1 bg-line" />
          </div>

          <form action={sendMagicLink} className="space-y-3">
            <label className="block text-sm font-medium" htmlFor="email">
              Correo electronico
            </label>
            <input
              className="h-12 w-full border border-line bg-background px-3 text-sm outline-none transition focus:border-accent"
              id="email"
              name="email"
              placeholder="tu@email.com"
              type="email"
              required
            />
            <button
              className="h-12 w-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-accent hover:text-accent"
              type="submit"
            >
              Enviar codigo de acceso
            </button>
          </form>
        </div>

        <footer className="mt-6 border-t border-line pt-5 text-sm text-muted">
          Acceso interno:{" "}
          <Link className="font-medium text-foreground" href="/login/staff">
            Login staff
          </Link>
        </footer>
      </section>
    </main>
  );
}

