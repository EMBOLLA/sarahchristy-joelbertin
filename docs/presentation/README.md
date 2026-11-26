# Document de présentation (pour les mariés)

`presentation.pdf` présente les fonctionnalités du site avec des captures d'écran.
Les noms visibles sur les captures sont fictifs.

## Régénérer le PDF

Prérequis : XeLaTeX (TeX Live : `texlive-xetex`, `texlive-latex-extra`, `texlive-lang-french`).

```bash
cd docs/presentation && xelatex presentation.tex && xelatex presentation.tex
```

- Polices : `fonts/` (liens vers `assets/fonts` du site + graisses EB Garamond propres au document, licence OFL).
- Captures : `images/` (JPEG, téléphone 390 px de large, échelle ×2).
