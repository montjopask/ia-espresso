# IA Espresso

Les nouvelles de l’IA générative (texte, images, vidéos), le temps d’une tasse. Un cru chaque matin.

Le site est entièrement statique : chaque page est fabriquée à l’avance, en HTML complet, puis servie par GitHub Pages.

## Comment un cru arrive en ligne

1. Le digest IA du matin est rédigé, puis versé dans `src/content/crus/AAAA-MM-JJ.md`.
2. L’arrivée du fichier sur la branche `main` déclenche l’action « Publier le site ».
3. L’action vérifie les crus (`scripts/verifier-crus.mjs`), construit le site, indexe la recherche, puis publie. Si un cru est mal formé, rien n’est publié et le site reste sur la version de la veille.

## Format d’un cru

```markdown
---
date: 2026-10-12
titre: "Le vendeur invisible"
mot: "Coulisses"            # un seul mot, jamais deux fois le même
themes: ["entreprise", "creativite"]
chapeau: |
  **Phrase d’attaque.** Suite du chapô.
---

## Premier sujet

Score 87/100

**Phrase de tête en gras.** Corps du paragraphe…

Pour en savoir plus → [Titre du lien](https://…)

## Autres sujets pertinents

### Sous-titre

## Questions pour la nuit

Phrase de contexte.

**La question ?**
```

Thèmes possibles : `modeles`, `agents`, `creativite`, `raisonnement`, `code`, `memoire`, `recherche`, `infrastructure`, `entreprise`, `ethique`.

## Travailler en local

```bash
npm ci
npm run dev        # aperçu pendant l’écriture
npm run build      # vérification, construction et index de recherche
```

Les polices sont servies par le site lui-même (Fraunces et Encode Sans, licence OFL). Les fichiers de `og-fonts/` servent à fabriquer les images de partage.
