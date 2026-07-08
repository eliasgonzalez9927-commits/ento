"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type DynamicQRProps = {
  secretSeed: string;
};

const WINDOW_SECONDS = 30;

export function DynamicQR({ secretSeed }: DynamicQRProps) {
  const [token, setToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(WINDOW_SECONDS);

  useEffect(() => {
    function refreshToken() {
      const now = Date.now();
      const timeBlock = Math.floor(now / (WINDOW_SECONDS * 1000));
      const nextSecondsLeft =
        WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
      const currentToken = btoa(`${secretSeed}_${timeBlock}`);

      setToken(currentToken);
      setSecondsLeft(nextSecondsLeft);
    }

    refreshToken();
    const interval = window.setInterval(refreshToken, 1000);

    return () => window.clearInterval(interval);
  }, [secretSeed]);

  const progress = ((WINDOW_SECONDS - secondsLeft) / WINDOW_SECONDS) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm">
      <div className="rounded-2xl bg-white p-5">
        {token ? (
          <QRCodeSVG
            className="h-auto w-full"
            level="M"
            value={token}
            viewBox="0 0 256 256"
          />
        ) : (
          <div className="aspect-square w-full animate-pulse bg-zinc-100" />
        )}
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-zinc-300">
          El codigo se actualiza en {secondsLeft} segundos
        </p>
      </div>
    </div>
  );
}

