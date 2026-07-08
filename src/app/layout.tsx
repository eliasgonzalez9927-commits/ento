import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ento",
  description: "Event ticketing and cashless wallet platform for nightlife.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
