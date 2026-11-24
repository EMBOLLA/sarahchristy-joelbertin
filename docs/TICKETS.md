# Billets : flux, templates PDF, protocole

## Flux complet

```
Invité ── formulaire (solo | couple) ──▶ Server Action submitTicketRequest
                                          │ Zod (codes d'erreur → dictionnaire)
                                          │ honeypot anti-bot
                                          ▼
                              requestTicket()  (src/server/tickets/service.ts)
                                          │ 1. billet existant ? (même type, un des noms en commun) → réutilisé
                                          │ 2. invité sur la liste ? (nom OU partenaire) → matched / unlisted
                                          │ 3. INSERT avec public_code aléatoire 128 bits
                                          ▼
              GET /api/tickets/{code}/pdf ──▶ PDF (template + noms + table + QR + marque)
                                          │
              QR ──▶ /check/{code} ──▶ fiche live (protocole connecté) ou « billet valide » (public)
```

- **Re-téléchargement** : refaire le formulaire avec le même nom renvoie le même billet ; l'appareil mémorise aussi le dernier billet (bandeau « Vous avez déjà un billet »).
- **Couple inscrit deux fois** (chacun remplit, noms inversés) : un seul billet.
- **Protocole qui ajoute un invité après coup** : les billets « hors liste » correspondants passent « sur la liste » automatiquement (une seule requête `UPDATE … FROM`).

## Marque protocole sur le billet

| Marque | Sens |
| --- | --- |
| ◆ losange plein, or | Sur la liste au moment du téléchargement |
| ◇ losange vide | Hors liste au moment du téléchargement |

La marque est **indicative** (photo du moment du téléchargement). La vérité est la fiche obtenue en scannant le QR : statut, table et entrée sont lus en direct.

## Fournir tes templates

1. Exporter depuis Canva/Illustrator **en PDF**, une page :
   - `assets/tickets/ticket-solo.pdf`
   - `assets/tickets/ticket-couple.pdf`
2. Laisser vides les zones : nom(s), « valable pour… », table, QR (≈ 100 × 100 pt), marque, référence.
3. Ajuster les coordonnées dans `src/server/tickets/pdf-layout.ts` (points PDF, origine **en bas à gauche**).
4. Vérifier : `pnpm dev`, générer un billet, ouvrir `/api/tickets/{code}/pdf?inline=1`.

Tant qu'un template est absent, un billet de secours terracotta/or est dessiné entièrement par le code (`drawFallbackDesign`).

### Police

Les noms sont écrits en **Pinyon Script** (`assets/fonts/`, licence OFL : intégration PDF autorisée). Pour utiliser la police de ton template, remplace le fichier TTF et le chemin dans `embedFonts()`. **Vérifie la licence** : beaucoup de polices « gratuites pour usage personnel » interdisent l'intégration.

## Le jour J, à l'entrée

1. Se connecter une fois sur le téléphone : `/admin/login` (session 7 jours).
2. Scanner le QR avec l'**appareil photo natif** → la fiche s'ouvre.
   - Cadre **vert** : pas encore entré → « Valider l'entrée ».
   - Cadre **orange** : hors liste → décision du protocole.
   - Cadre **rouge** : **déjà entré** (billet partagé / doublon) → vérifier l'identité.
3. Sans réseau : la référence imprimée (`Réf. xxxxxxxx`) permet de retrouver le billet plus tard dans l'export CSV.

## Limite connue (assumée)

Le formulaire est ouvert : connaître le nom d'un invité suffit pour re-télécharger son billet. Le contrôle se fait à la porte (check-in unique, alerte « déjà entré »). Si ça devient un problème : ajouter un code d'invitation par foyer.
