"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useTransition } from "react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { CheckCircle2, Loader2, ScanLine, XCircle } from "lucide-react";
import { validateTicket } from "./actions";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
  },
);

type ScanState =
  | {
      status: "idle";
    }
  | {
      status: "success";
      tierName: string;
      ticketId: string;
    }
  | {
      status: "error";
      message: string;
    };

export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [locked, setLocked] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const token = detectedCodes[0]?.rawValue;

      if (!token || locked || scanState.status !== "idle") {
        return;
      }

      setLocked(true);
      setCameraError(null);

      startTransition(async () => {
        const result = await validateTicket(token);

        if (result.success) {
          setScanState({
            status: "success",
            tierName: result.ticket.tierName,
            ticketId: result.ticket.id,
          });
        } else {
          setScanState({
            status: "error",
            message: result.error,
          });
        }
      });
    },
    [locked, scanState.status],
  );

  function resetScanner() {
    setScanState({ status: "idle" });
    setLocked(false);
    setCameraError(null);
  }

  const scannerPaused = locked || scanState.status !== "idle";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {scanState.status === "idle" ? (
          <>
            <header className="z-10 border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Ento Access
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold">
                    Escanear entrada
                  </h1>
                </div>
                <ScanLine className="h-8 w-8 text-teal-300" />
              </div>
            </header>

            <div className="relative flex flex-1 items-center justify-center bg-zinc-950">
              <Scanner
                allowMultiple={false}
                components={{
                  finder: true,
                  torch: true,
                }}
                constraints={{
                  facingMode: "environment",
                }}
                onError={(error) => {
                  console.error("Scanner camera error", error);
                  setCameraError("No pudimos abrir la camara");
                }}
                onScan={handleScan}
                paused={scannerPaused}
                scanDelay={500}
                styles={{
                  container: {
                    width: "100%",
                    height: "100%",
                  },
                  video: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  },
                }}
              />

              <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-[32px] border-2 border-white/80 shadow-[0_0_40px_rgba(45,212,191,0.35)]" style={{ aspectRatio: "1 / 1" }} />

              {isPending ? (
                <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-16 w-16 animate-spin text-teal-300" />
                    <p className="text-2xl font-semibold">Validando...</p>
                  </div>
                </div>
              ) : null}

              {cameraError ? (
                <div className="absolute inset-x-5 bottom-28 rounded-2xl border border-red-500/50 bg-red-950/80 p-4 text-center text-xl font-semibold text-red-100">
                  {cameraError}
                </div>
              ) : null}
            </div>

            <footer className="z-10 border-t border-white/10 bg-black px-5 py-5">
              <p className="text-center text-sm leading-6 text-zinc-400">
                Apunta la camara al QR dinamico. La validacion se ejecuta al
                primer escaneo.
              </p>
            </footer>
          </>
        ) : (
          <ResultScreen scanState={scanState} onReset={resetScanner} />
        )}
      </section>
    </main>
  );
}

function ResultScreen({
  scanState,
  onReset,
}: {
  scanState: Exclude<ScanState, { status: "idle" }>;
  onReset: () => void;
}) {
  const isSuccess = scanState.status === "success";

  return (
    <div
      className={`flex min-h-screen flex-col px-6 py-8 ${
        isSuccess ? "bg-[#00d66f] text-black" : "bg-[#ff1f3d] text-white"
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {isSuccess ? (
          <CheckCircle2 className="h-36 w-36" strokeWidth={2.4} />
        ) : (
          <XCircle className="h-36 w-36" strokeWidth={2.4} />
        )}

        <p className="mt-8 text-7xl font-black uppercase tracking-normal">
          {isSuccess ? "OK" : "ERROR"}
        </p>

        {isSuccess ? (
          <>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Entrada valida
            </h1>
            <p className="mt-4 text-3xl font-bold">{scanState.tierName}</p>
            <p className="mt-4 text-base font-semibold opacity-70">
              Ticket {scanState.ticketId}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Acceso rechazado
            </h1>
            <p className="mt-5 max-w-sm text-4xl font-black leading-tight">
              {scanState.message}
            </p>
          </>
        )}
      </div>

      <button
        className={`h-20 w-full rounded-2xl text-2xl font-black shadow-sm ${
          isSuccess
            ? "bg-black text-white"
            : "bg-white text-black"
        }`}
        onClick={onReset}
        type="button"
      >
        Escanear siguiente
      </button>
    </div>
  );
}

