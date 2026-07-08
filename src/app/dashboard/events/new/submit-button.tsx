"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-12 w-full border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending ? "Creando evento..." : "Crear evento"}
    </button>
  );
}

