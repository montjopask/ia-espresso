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
mot: "Coulisses"            # un ou deux mots, jamais deux fois le même
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

## Mot du jour et contrôle visuel

Le mot du jour tient en un ou deux mots, sans longueur imposée. Le composant `Mot.astro` mesure sa largeur à la construction (`src/lib/mot.ts`, table des signes de Fraunces italique) et la feuille de style en déduit la taille de la lettre, plafonnée selon l’emplacement : le mot tient sur sa ligne, sans lettre rejetée à la ligne. Dans les grands formats (la une, l’en-tête d’un cru, l’édition spéciale), un mot composé long se coupe en deux lignes à son trait d’union, et deux mots à leur espace.

`npm run build` puis `npm run controle-visuel` charge l’accueil, les archives et chaque cru à une douzaine de largeurs d’écran, de 320 à 2 560 px, et signale tout mot qui passe à la ligne ou déborde, et toute page qui défile en largeur. L’option `-- --captures <dossier>` enregistre aussi des captures de la une et du dernier cru, sur téléphone et sur grand écran.

## Éditions spéciales

Une édition spéciale consacre tout un numéro à un seul sujet. Elle vit dans `src/content/speciales/AAAA-MM-JJ.md`, avec le même en-tête qu’un cru ; son mot du jour ne doit avoir servi à aucun cru, quotidien ou spécial. Elle ne remplace pas le cru du jour : l’accueil la présente dans un encadré à part pendant dix jours, les archives et les thèmes la rangent avec les autres, et son adresse porte la mention `speciale` (`/crus/AAAA-MM-JJ-speciale-mot/`).

## Travailler en local

```bash
npm ci
npm run dev        # aperçu pendant l’écriture
npm run build      # vérification, construction et index de recherche
```

Les polices sont servies par le site lui-même (Fraunces et Encode Sans, licence OFL). Les fichiers de `og-fonts/` servent à fabriquer les images de partage.
