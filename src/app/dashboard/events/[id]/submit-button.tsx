"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-11 border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Agregando..." : "Agregar tipo"}
    </button>
  );
}

