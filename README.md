# Faire-part — Sarah Christy & Joël Bertin

Site de faire-part de mariage, mobile first, bilingue FR/EN (selon la langue de l'appareil).

- Hero : billet qui sort d'une enveloppe, piloté par le scroll (video scrubbing GSAP + Lenis)
- Compte à rebours, lieux avec ouverture GPS (Google Maps / Waze / Apple Maps)
- Formulaire → billet PDF solo ou couple (template + nom dans la bonne police + QR code)
- FAQ éditable, back-office protocole (liste des invités, tables, check-in)
- Animation spéciale le jour J

## Stack

| Couche | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, `proxy.ts`) |
| UI | shadcn/ui (base-nova, Base UI) + Tailwind v4 |
| Motion | GSAP 3 + ScrollTrigger, Lenis (piloté par le ticker GSAP) |
| i18n | Natif Next (`app/[lang]` + `next/root-params`), dictionnaires typés |
| Données | Neon Postgres + Drizzle ORM (driver HTTP serverless) |
| PDF | pdf-lib + fontkit, QR via `qrcode` |
| Hébergement | Vercel Hobby |

## Démarrage

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

```bash
pnpm dev
```

## Scripts

| Script | Rôle |
| --- | --- |
| `pnpm dev` / `build` / `start` | Cycle Next standard |
| `pnpm typecheck` | Génère les types de routes puis `tsc --noEmit` |
| `pnpm lint` | ESLint (config Next) |
| `pnpm test` | Vitest — logique pure (locale, matching de noms, phase du mariage) |
| `pnpm db:generate` / `db:migrate` / `db:studio` | Drizzle Kit |

## Documentation

- [`docs/BRAINSTORM.md`](docs/BRAINSTORM.md) — décisions, améliorations retenues, roadmap
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure du code, i18n, données, flux billet
- [`docs/VIDEO_SCRUB.md`](docs/VIDEO_SCRUB.md) — cahier des charges de la vidéo Canva + encodage

## Où modifier quoi

- Noms, date, lieux, vidéo : `src/config/wedding.ts`
- Textes : `src/i18n/dictionaries/fr.ts` (référence) et `en.ts`
- Nombre de tables : variable d'env `WEDDING_TABLE_COUNT`
