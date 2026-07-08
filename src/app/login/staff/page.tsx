import Link from "next/link";
import { signInStaff } from "../actions";

type StaffLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "Credenciales incorrectas.",
  missing_credentials: "Completa email y contrasena para continuar.",
  server_config: "La autenticacion interna todavia no esta configurada.",
};

export default async function StaffLoginPage({
  searchParams,
}: StaffLoginPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1117] px-6 py-10 text-white">
      <section className="w-full max-w-md border border-white/12 bg-[#111827] p-6 shadow-sm">
        <div className="border-b border-white/12 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Staff
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Acceso operativo
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Entrada para owners, RRPP, cajeros, porteros y administradores de la
            plataforma.
          </p>
        </div>

        <form action={signInStaff} className="mt-6 space-y-4">
          {error ? (
            <div className="border border-red-400/60 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="h-12 w-full border border-white/12 bg-[#0d1117] px-3 text-sm text-white outline-none transition focus:border-teal-300"
              id="email"
              name="email"
              placeholder="staff@venue.com"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="password">
              Contrasena
            </label>
            <input
              className="h-12 w-full border border-white/12 bg-[#0d1117] px-3 text-sm text-white outline-none transition focus:border-teal-300"
              id="password"
              name="password"
              placeholder="********"
              type="password"
              required
            />
          </div>

          <button
            className="h-12 w-full border border-teal-300 bg-teal-300 px-4 text-sm font-semibold text-black transition hover:bg-white"
            type="submit"
          >
            Ingresar
          </button>
        </form>

        <footer className="mt-6 border-t border-white/12 pt-5 text-sm text-slate-400">
          Usuarios generales:{" "}
          <Link className="font-medium text-white" href="/login">
            volver a login
          </Link>
        </footer>
      </section>
    </main>
  );
}
