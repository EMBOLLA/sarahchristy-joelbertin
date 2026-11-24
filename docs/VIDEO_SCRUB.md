# Vidéo du hero (enveloppe → billet)

Le composant `src/components/motion/video-scrub.tsx` lie `video.currentTime` à la position de scroll. Testé en headless avec une vidéo factice : la progression est linéaire et fluide.

## Cahier des charges pour l'export Canva

| Paramètre | Valeur | Raison |
| --- | --- | --- |
| Format | **Portrait 1080×1920** (9:16) | Mobile first ; `object-cover` recadre sur desktop |
| Durée | **3 à 5 s** | Au-delà, fichier lourd et scroll trop long |
| Images/s | 30 | 24 suffit si le fichier est trop lourd |
| Son | Aucun | Lecture muette obligatoire (autoplay/iOS) |
| Fond | Uni, proche du `--background` du site | Transition invisible avec la suite de la page |
| Dernière image | Le billet bien lisible, centré, plein cadre | C'est l'état final du hero |
| Zone basse | ~15 % libre | Le texte « faites défiler » s'affiche en bas |

## Encodage obligatoire (après export Canva)

Canva exporte un MP4 avec une image clé toutes les ~2 s. En scrub, le navigateur doit décoder depuis la dernière image clé à chaque seek → saccades, surtout sur iPhone. Il faut **une image clé par frame** :

```bash
ffmpeg -i canva-export.mp4 -an -vf "scale=1080:-2" -c:v libx264 -preset slow -crf 26 -g 1 -pix_fmt yuv420p -movflags +faststart public/media/hero.mp4
```

Image de poster (première frame, affichée pendant le chargement) :

```bash
ffmpeg -i public/media/hero.mp4 -frames:v 1 -q:v 3 public/media/hero-poster.webp
```

Viser **< 4 Mo**. Si c'est plus lourd : monter `-crf` (28–30) ou réduire à 720 px de large.

Puis dans `src/config/wedding.ts` :

```ts
media: { heroVideo: "/media/hero.mp4", heroPoster: "/media/hero-poster.webp" },
```

## Choix techniques du composant

- **Chargement intégral en Blob** avant de scrubber : Safari iOS ne seek proprement que dans un média entièrement bufferisé.
- `muted playsInline preload="auto"` : requis par iOS.
- `scrub: 0.5` : léger lissage qui masque les micro-saccades de décodage.
- `pin: true` sur `scrollLength` (250 % de la hauteur d'écran par défaut).
- `prefers-reduced-motion` : pas d'animation, le poster reste affiché.

## Plan B si ce n'est toujours pas fluide sur iPhone ancien

Séquence d'images (WebP, ~60–90 frames) dessinées dans un `<canvas>` : fluidité parfaite, mais plus de requêtes et plus de poids. À n'envisager que si le test sur un vrai iPhone est décevant.
