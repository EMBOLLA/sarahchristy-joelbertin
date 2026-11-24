# Architecture

## Arborescence

```
assets/                           # Lu au runtime (fonts OFL, templates PDF) — tracé via next.config
drizzle/                          # Migrations SQL versionnées
src/
├── proxy.ts                      # Négociation de langue (rewrite) — ex-middleware
├── app/
│   ├── [lang]/                   # Root layout : toutes les pages sont sous [lang]
│   │   ├── page.tsx              # Accueil (statique, FAQ en cache)
│   │   ├── opengraph-image.tsx   # Aperçu WhatsApp
│   │   ├── check/[code]/         # Fiche scannée à l'entrée (PPR + Suspense)
│   │   └── admin/
│   │       ├── login/            # Statique
│   │       └── (protected)/      # Billets, invités & tables, FAQ (PPR + Suspense)
│   └── api/
│       ├── tickets/[code]/pdf/   # Génération du billet
│       ├── calendar/[lang]/      # .ics prérendu
│       └── admin/export/         # CSV (auth)
├── config/wedding.ts             # Faits de l'événement (noms, date, lieux, programme, contact)
├── i18n/                         # Locales, dictionnaires typés (fr = référence)
├── lib/                          # Pur : aucun I/O, testé (Vitest)
│   ├── csv.ts                    # Import/export invités
│   ├── safe-redirect.ts          # Anti open-redirect post-login
│   └── wedding/                  # names, phase, maps, calendar, ticket-request (Zod partagé)
├── hooks/                        # useNow, usePrefersReducedMotion
├── components/
│   ├── typography.tsx            # ScriptHeading (initiale or), Gold, Ornament, Section
│   ├── sections/                 # hero, countdown, schedule, venue-card, faq, wedding-day
│   ├── rsvp/                     # Formulaire billet + billet mémorisé sur l'appareil
│   ├── admin/                    # Formulaires et UI du back-office
│   ├── motion/video-scrub.tsx
│   └── ui/                       # shadcn
└── server/                       # server-only
    ├── env.ts                    # Env Zod, un schéma par domaine, validation lazy
    ├── db/                       # schema.ts, client.ts (Neon HTTP en prod, pg en local)
    ├── auth/                     # session (jose), guard des pages
    ├── tickets/                  # service (matching, dédoublonnage, check-in), pdf, layout
    ├── guests/                   # service (import, tables, occupation)
    ├── faq/                      # service ('use cache' + tag)
    └── actions/                  # Server Actions : ticket (public), admin
```

Règles de dépendance : `app → components → lib/i18n/config`, `app → server → lib/config`. `lib/` ne dépend de rien d'applicatif. Les composants n'accèdent jamais à la DB directement : ils passent par `server/*/service.ts` (lecture) ou `server/actions` (écriture).

## Rendu (Next 16, Cache Components)

| Route | Rendu | Pourquoi |
| --- | --- | --- |
| `/fr`, `/en` | Statique | La FAQ est en `'use cache'` (tag `faq`), invalidée par `updateTag` à chaque édition |
| `/admin/login` | Statique | Lit `?next=` côté client, pas de `searchParams` serveur |
| `/admin/*`, `/check/[code]` | Shell statique + contenu en streaming | Lecture du cookie de session → derrière `<Suspense>` (obligatoire) |
| `/api/calendar/[lang]` | Prérendu | Aucune donnée de requête |
| `/api/tickets/[code]/pdf` | Dynamique | `Cache-Control: no-store` : la table peut changer |

Le build exige la DB **si** `DATABASE_URL` est défini (prérendu de la FAQ). Sans variable : FAQ vide, build OK (CI).

## Sécurité

- **Chaque Server Action admin** appelle `assertAdmin()` et valide ses arguments liés (`bind`) avec Zod : une action est un endpoint POST public, quelle que soit la page qui l'affiche.
- Pages admin : `requireAdminPage()` dans la zone Suspense, **avant** toute lecture de données.
- Session : JWT HS256 (jose), cookie `HttpOnly`, `SameSite=Lax`, `Secure` en prod, 7 jours. Mot de passe comparé en temps constant (hash SHA-256 des deux côtés).
- QR : identifiant aléatoire 128 bits (non devinable), jamais la clé primaire.
- Post-login : redirection limitée à `/(fr|en)/(admin|check)/…` (pas d'open redirect).
- `robots: noindex` sur tout le site (faire-part privé).
- Honeypot sur le formulaire public. Pas de rate-limit (voir BRAINSTORM).

## Données

| Table | Rôle |
| --- | --- |
| `guests` | Liste du protocole : nom, partenaire, clés de matching, type, table |
| `tickets` | Un billet par demande : `public_code` (QR), statut de matching, check-in |
| `faq_items` | FAQ bilingue, ordre, publication |

Contraintes en base : un billet `couple` a forcément un partenaire, un `solo` jamais ; table > 0.
Pas de transactions interactives (le driver Neon HTTP n'en a pas) : les opérations multi-étapes sont ordonnées pour rester cohérentes en cas d'échec partiel.

## Développement local

```bash
docker run -d --name wedding-pg -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=wedding -p 5432:5432 postgres:16
```

```bash
cp .env.example .env.local
```

```bash
pnpm db:migrate
```

```bash
pnpm dev
```

## Déploiement Vercel (Hobby)

1. Importer le repo sur Vercel.
2. Storage → **Neon** (Marketplace) → injecte `DATABASE_URL`.
3. Ajouter `ADMIN_PASSWORD`, `SESSION_SECRET`, `WEDDING_TABLE_COUNT`, `WEDDING_TABLE_CAPACITY`.
4. Appliquer les migrations sur la base Neon : `DATABASE_URL=<url neon> pnpm db:migrate` (depuis ton poste).
5. Déployer. Modifier le schéma ensuite : `pnpm db:generate` → commit du dossier `drizzle/` → `pnpm db:migrate`.
