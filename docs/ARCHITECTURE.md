# Architecture

## Arborescence

```
src/
├── proxy.ts                      # Négociation de langue (rewrite) — ex-middleware
├── app/
│   ├── globals.css               # Tokens shadcn + Tailwind v4
│   └── [lang]/                   # Root layout : TOUTES les pages sont sous [lang]
│       ├── layout.tsx            # <html lang>, polices, SmoothScrollProvider, Toaster
│       └── page.tsx              # Accueil (sections)
├── config/wedding.ts             # Faits de l'événement (noms, date, lieux, médias)
├── i18n/
│   ├── config.ts                 # LOCALES, resolveLocale() — pur, testé
│   ├── get-dictionary.ts         # getLocale()/getDictionary() via next/root-params
│   └── dictionaries/{fr,en}.ts   # fr = référence de type, en `satisfies Dictionary`
├── lib/
│   ├── gsap.ts                   # Point UNIQUE d'enregistrement des plugins GSAP
│   └── wedding/                  # Logique métier pure (pas de React, pas d'I/O)
│       ├── phase.ts              # before | day | after (fuseau du lieu), compte à rebours
│       ├── maps.ts               # Liens GPS universels
│       └── names.ts              # Normalisation pour le matching invités
├── hooks/use-prefers-reduced-motion.ts
├── components/
│   ├── ui/                       # shadcn (généré, ne pas éditer à la main sans raison)
│   ├── providers/smooth-scroll-provider.tsx
│   ├── motion/video-scrub.tsx
│   ├── sections/                 # hero, countdown, venue-card…
│   └── language-switcher.tsx
└── server/                       # server-only : jamais importable côté client
    ├── env.ts                    # Variables d'env validées par Zod (lazy)
    └── db/{schema,client}.ts     # Drizzle + Neon HTTP
```

Règle de dépendance : `components → lib, i18n, config` ; `server → lib, config`. `lib/` ne dépend de rien d'applicatif → testable en isolation (Vitest).

## i18n

1. Requête sur `/` → `proxy.ts` lit le cookie `NEXT_LOCALE`, sinon `Accept-Language` (langue de l'appareil), sinon `fr`.
2. **Rewrite** interne vers `/fr` ou `/en` : l'URL visible reste `/`.
3. `app/[lang]/layout.tsx` déclare `generateStaticParams` → les deux langues sont **prérendues statiquement**.
4. Les Server Components appellent `getDictionary()` sans argument (`next/root-params`).
5. Les Client Components reçoivent **uniquement la tranche** de dictionnaire dont ils ont besoin en props (pas tout le dictionnaire dans le bundle).
6. Le sélecteur de langue pose le cookie (prioritaire ensuite) et navigue vers `/{locale}`.

Ajouter une clé : l'ajouter dans `fr.ts` → TypeScript signale l'oubli dans `en.ts`.

## Motion : Lenis × GSAP

- Lenis tourne avec `autoRaf: false` et est avancé par `gsap.ticker` → **une seule boucle rAF**, pas de décalage entre scroll lissé et animations scrubbées.
- Chaque frame Lenis appelle `ScrollTrigger.update()`.
- `prefers-reduced-motion` : scroll natif, et le scrub vidéo n'est pas monté (`gsap.matchMedia`).
- Toujours importer depuis `@/lib/gsap`, et animer via `useGSAP` (nettoyage automatique au démontage — important avec l'`<Activity>` de Cache Components qui garde les routes montées en caché).

## Données

| Table | Rôle |
| --- | --- |
| `guests` | Liste du protocole : nom, `match_key`, solo/couple, n° de table |
| `tickets` | Un billet par soumission : `public_code` (QR), statut de matching, check-in |
| `faq_items` | FAQ bilingue, ordonnée, publiable |

Contraintes en base (pas seulement en Zod) : un billet `couple` a forcément `partner_name`, un `solo` jamais ; n° de table > 0.

## Flux billet (à implémenter)

```
Formulaire (Client) ──Server Action──▶ Zod ──▶ nameMatchKey()
                                              │
                         guests.match_key ? ──┴──▶ matched / unlisted
                                              │
                         INSERT tickets (public_code aléatoire)
                                              │
               Route Handler /api/tickets/{publicCode}/pdf
                 pdf-lib : template solo|couple (server-only, pas dans /public)
                 + fontkit : police du faire-part embarquée
                 + QR → https://site/check/{publicCode}
```

Vérifier la **licence de la police** : elle doit autoriser l'embarquement PDF.

## Back-office

Auth minimale et suffisante pour ce contexte : un mot de passe partagé (`ADMIN_PASSWORD`), comparaison à temps constant, session dans un cookie `HttpOnly; Secure; SameSite=Lax` signé avec `jose` (`SESSION_SECRET`). Vérification **dans chaque Server Action / Route Handler admin** — `proxy.ts` ne sert que de filtre de confort, jamais de seule barrière.

## Déploiement Vercel (Hobby)

1. Importer le repo sur Vercel.
2. Storage → Neon (Marketplace) → injecte `DATABASE_URL`.
3. Ajouter `ADMIN_PASSWORD`, `SESSION_SECRET`, `WEDDING_TABLE_COUNT`.
4. Migrations : `pnpm db:generate` en local, commit du dossier `drizzle/`, puis `pnpm db:migrate` contre la base de prod.

Limites Hobby à garder en tête : usage non commercial (ok pour un mariage familial), fonctions limitées en durée — la génération PDF pdf-lib prend quelques centaines de ms, sans souci.
