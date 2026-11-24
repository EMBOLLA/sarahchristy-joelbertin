# Brainstorm & décisions

## Décisions actées

| Sujet | Décision | Pourquoi |
| --- | --- | --- |
| Backend | **Next.js seul** (Route Handlers + Server Actions), pas de NestJS | Nest sur Vercel Hobby = une fonction serverless monolithique : cold start 1–3 s, 2 projets, CORS, 2 déploiements. Pour ~6 endpoints, coût sans bénéfice. La logique métier vit dans `src/server/` (services purs) → extractible vers Nest plus tard si le besoin apparaît. |
| Base de données | **Neon** + Drizzle | Supabase Free met le projet en pause après 7 jours d'inactivité — risque réel entre deux vagues d'envoi. Neon se réveille seul (<1 s). Driver HTTP = pas de pool TCP à épuiser. |
| Accès au billet | **Formulaire ouvert**, recoupé avec la liste du protocole | Choix du protocole. Chaque billet porte un QR + une marque (`matched` / `unlisted` / `manual`) et le n° de table quand il est attribué. |
| i18n | Natif Next, sans next-intl | Deux langues, pas de pluriels complexes (Intl.PluralRules suffit). Pages statiques, zéro dépendance, typage strict (une clé manquante en EN = erreur de compilation). |
| URL | `/` réécrit vers `/fr` ou `/en` (pas de redirection) | Lien propre à partager sur WhatsApp ; choix explicite mémorisé en cookie, prioritaire sur la langue de l'appareil. |

## Point de vigilance : le QR code doit pointer vers un état *vivant*

Le PDF est téléchargé **avant** l'attribution des tables. Si on grave le n° de table dans le PDF, il sera faux/absent pour la majorité des invités.

→ Le QR encode uniquement une URL `/{origin}/check/{publicCode}` (id opaque, 128 bits). À l'entrée, le protocole scanne et voit **en temps réel** : nom, solo/couple, statut sur la liste, table, déjà entré ou non. Le PDF affiche la table *si* elle est connue au moment du téléchargement (bonus), mais la source de vérité reste le scan.

Bonus anti-fraude : le check-in marque `checked_in_at` → un billet scanné deux fois est signalé.

## Point de vigilance : le matching par nom est fragile

"Jean-Pierre MBÉKI" vs "jean pierre mbeki" vs "Mbeki Jean-Pierre". Implémenté : normalisation (accents, casse, ponctuation) + clé insensible à l'ordre des mots (`src/lib/wedding/names.ts`, testé).

Ce que ça ne couvre pas : fautes de frappe, surnoms. Options si besoin :
1. `pg_trgm` (similarité trigramme) pour proposer des correspondances au protocole dans le back-office — recommandé.
2. Demander un téléphone en second identifiant.

Le statut `manual` existe pour que le protocole corrige à la main.

## Améliorations proposées

### Priorité haute (impact fort, coût faible)
- **QR code + page de scan protocole** (`/admin/scan`) — voir ci-dessus. C'est *ton* outil le jour J.
- **Image Open Graph** (`opengraph-image.tsx`) : le faire-part sera partagé sur WhatsApp, l'aperçu est la première impression.
- **Ajouter au calendrier** : fichier `.ics` (Route Handler) + lien Google Calendar.
- **Programme de la journée** (timeline cérémonie → vin d'honneur → dîner) ; le jour J, l'étape en cours est mise en avant.
- **Dress code** et **contact protocole** (bouton WhatsApp `wa.me`) dans la FAQ.
- **Re-téléchargement du billet** : retrouver son billet via le même nom (évite les doublons quand quelqu'un a perdu son PDF).

### Priorité moyenne
- **Anti-spam formulaire** : honeypot + limite par IP (Vercel n'offre pas de rate-limit gratuit natif ; une table `rate_limits` en Postgres suffit à ce volume).
- **Export CSV** de la liste des invités / billets depuis le back-office.
- **Capacité par table** : `WEDDING_TABLE_COUNT` × places → alerte quand une table est pleine.
- **Mode aperçu jour J** : `?preview=day` (back-office uniquement) pour tester l'animation sans attendre la date.

### Plus tard / optionnel
- Galerie photo post-mariage (upload invités → Vercel Blob, quota gratuit limité : à surveiller).
- PWA (billet consultable hors ligne dans la salle — réseau souvent mauvais).
- Mot / livre d'or.

## Sur la vidéo Canva

Je ne peux pas produire la vidéo dans Canva moi-même : c'est à toi de l'exporter. Le cahier des charges précis (format, durée, encodage obligatoire pour un scrub fluide sur iPhone) est dans [`VIDEO_SCRUB.md`](VIDEO_SCRUB.md). Le composant est déjà en place et testé avec une vidéo factice.

## Roadmap

1. ✅ Scaffold : Next 16, shadcn, Lenis + GSAP, i18n, schéma DB
2. ✅ Thème : terracotta / blanc cassé / or, Pinyon Script (titres, initiales or) + EB Garamond, angles droits
3. ✅ Formulaire billet → matching liste → PDF (QR + marque + table) → re-téléchargement
4. ✅ Back-office : login, billets (filtres, check-in, rattachement), invités (ajout, import CSV, tables, occupation), FAQ, export CSV
5. ✅ Fiche de scan à l'entrée (vert / orange / rouge « déjà entré »)
6. ✅ FAQ publique en cache, programme (étape en cours le jour J), dress code, contact WhatsApp, `.ics` + Google Agenda, aperçu Open Graph, bandeau + confettis le jour J (`?preview=day` pour tester)
7. ⏳ Vidéo hero (export Canva → encodage → `WEDDING.media.heroVideo`)
8. ⏳ Vraies infos (`src/config/wedding.ts`), templates PDF + police (`docs/TICKETS.md`)
9. ⏳ Passe de mise en forme (avec la vidéo)
10. ⏳ Déploiement Vercel + Neon

## Reste ouvert

- **Rate-limit** du formulaire : honeypot seulement. Si du spam apparaît → table `rate_limits` en Postgres (pas besoin d'Upstash à ce volume).
- **Matching approximatif** (fautes de frappe) : `pg_trgm` pour suggérer des correspondances dans le back-office.
- **Brute-force du mot de passe admin** : pas de limitation de tentatives. Mot de passe long obligatoire (≥ 12) ; ajouter un délai progressif si le lien fuit.
