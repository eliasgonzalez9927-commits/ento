# Ento

Plataforma de gestion de eventos, ticketing hibrido y billetera cashless para vida nocturna, venues y shows under.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Vercel para frontend
- Railway para jobs, webhooks y servicios asincronos

## Desarrollo local

```powershell
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La service role key no debe usarse en componentes cliente.

## Base de datos

El esquema inicial esta en:

```text
supabase/migrations/0001_initial_schema.sql
```

Incluye tablas para usuarios, eventos, tickets con seed TOTP, ledger cashless y tracking de promotores.

## Verificacion

```powershell
npm run lint
npm run build
```
