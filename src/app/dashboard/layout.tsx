import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="border-b border-line px-6 py-5">
          <Link className="block" href="/dashboard">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Ento
            </p>
            <p className="mt-2 text-xl font-semibold">Organizador</p>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-5 text-sm font-medium">
          <Link
            className="border border-transparent px-3 py-2 text-muted transition hover:border-line hover:bg-background hover:text-foreground"
            href="/dashboard"
          >
            Mis Eventos
          </Link>
          <Link
            className="border border-transparent px-3 py-2 text-muted transition hover:border-line hover:bg-background hover:text-foreground"
            href="/dashboard/events/new"
          >
            Crear Evento
          </Link>
        </nav>

        <div className="border-t border-line p-4">
          <p className="mb-3 truncate text-xs text-muted">{user.email}</p>
          <form action={signOut}>
            <button
              className="h-10 w-full border border-line bg-background px-3 text-sm font-semibold transition hover:border-foreground"
              type="submit"
            >
              Cerrar Sesion
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link className="text-lg font-semibold" href="/dashboard">
              Ento
            </Link>
            <form action={signOut}>
              <button
                className="h-9 border border-line px-3 text-sm font-semibold"
                type="submit"
              >
                Cerrar Sesion
              </button>
            </form>
          </div>
          <nav className="mt-4 grid grid-cols-2 gap-2 text-sm font-medium">
            <Link className="border border-line px-3 py-2" href="/dashboard">
              Mis Eventos
            </Link>
            <Link
              className="border border-line px-3 py-2"
              href="/dashboard/events/new"
            >
              Crear Evento
            </Link>
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}

