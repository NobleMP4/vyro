# Design system VYRO

Référence vivante : lance le FrontEnd puis ouvre **<http://localhost:5173/design-system>**
(connecté, en développement uniquement — la page n'existe pas dans le build de production).
Elle montre chaque token et composant, en clair et en sombre.

## Principes

- **Sobre et sportif** : surfaces neutres, un seul accent (bleu VYRO), espaces généreux.
- **Mobile d'abord** : cibles tactiles ≥ 44 px (48–56 px pendant une séance), texte ≥ 16 px
  dans les champs (pas de zoom iOS), safe areas.
- **Toujours un état** : chargement (squelette), vide (explication + action), erreur
  (message clair + « Réessayer »), succès (toast pour les actions importantes).
- **Animations discrètes**, désactivées avec `prefers-reduced-motion`.
- **Accessibilité** : contrastes AA, focus visible, rôles ARIA natifs (Radix), l'information
  n'est jamais portée par la couleur seule.

## Tokens (`FrontEnd/src/index.css`)

| Rôle | Token | Usage |
| --- | --- | --- |
| Fond | `background` | Fond de page |
| Surface | `card`, `muted` | Cartes, zones secondaires |
| Texte | `foreground`, `muted-foreground` | Texte principal / secondaire |
| Accent | `primary` (+ `primary-foreground`) | Actions principales, élément actif |
| Accent texte | `brand` | Liens, icônes d'accent (lisible sur le fond) |
| États | `success`, `warning`, `destructive`, `info` | Réservés aux états, jamais aux séries |
| Graphiques | `chart-1` … `chart-8`, `chart-grid` | Voir « Graphiques » |

Chaque token a une valeur claire et une valeur sombre ; on n'écrit jamais de couleur en dur
dans un composant. Rayons : `rounded-md` (champs), `rounded-lg`, `rounded-xl` (cartes),
`rounded-full` (boutons, badges).

**Typographie** : Space Grotesk pour les titres, Inter pour le reste. Les grands chiffres
(stat cards) utilisent Inter en chiffres proportionnels ; `tabular` est réservé aux colonnes
et aux chronomètres.

## Composants

| Catégorie | Composants (`src/components/…`) |
| --- | --- |
| Actions | `ui/button` (default, secondary, outline, ghost, destructive, link · sm, default, lg, icon) |
| Formulaires | `ui/input`, `ui/password-input`, `ui/select` (natif), `ui/textarea`, `ui/switch`, `ui/segmented-control`, `ui/number-stepper`, `ui/form-field` (label + aide + erreur) |
| Mise en page | `ui/card`, `ui/tabs`, `layout/PageHeader` |
| Données | `data/StatCard`, `data/PeriodSelector`, `ui/progress`, `ui/badge` |
| Graphiques | `charts/ChartFrame`, `charts/TimeSeriesChart`, `charts/BarSeriesChart` |
| Retours | `ui/alert`, `ui/toaster` (toasts), `ui/skeleton`, `ui/spinner`, `feedback/EmptyState`, `feedback/ErrorState`, `feedback/QueryContent`, `feedback/ComingSoon` |
| Fenêtres | `ui/dialog` (feuille en bas sur mobile), `feedback/ConfirmDialog` (actions irréversibles), `ui/tooltip` (indice desktop uniquement) |

Règles d'usage :

- **Écran de données** → `QueryContent` gère chargement / erreur / vide / succès.
- **Choix parmi 2–6 options** → `SegmentedControl` ; plus d'options → `Select` natif
  (sélecteur du système sur mobile).
- **Saisie pendant l'effort** (charge, répétitions) → `NumberStepper` : ± géants, virgule
  française acceptée, valeur hors limites corrigée à la sortie du champ.
- **Suppression / action irréversible** → `ConfirmDialog` (rôle `alertdialog`).
- **Tooltip** : jamais pour une information indispensable (pas de survol au doigt).

## Formats et unités (`src/lib/format.ts`)

L'API stocke tout en métrique (kg, km, secondes) ; la conversion se fait uniquement à
l'affichage et à la saisie. Locale fr-FR : `78,1 kg`, `3 h 42`, `12:34`, `5:12 /km`,
`−0,3` (vrai signe moins), `12,9 k`. Périodes partagées (`src/lib/period.ts`) :
7 j · 30 j · 3 m · 6 m · 1 an · Tout.

## Graphiques

Recharts, habillé par les composants `charts/*`. Règles (validées avec un outil de
vérification des palettes, daltonisme compris) :

- **Palette catégorielle fixe**, ordre imposé, jamais recyclée : 1 bleu VYRO, 2 orange,
  3 aqua, 4 jaune, 5 magenta, 6 vert, 7 violet, 8 rouge. Une couleur suit l'entité (ex. « Course »
  garde sa couleur), jamais son rang. En clair, les slots 3 à 5 sont sous 3:1 sur blanc : les
  libellés ou le tableau sont alors obligatoires.
- **Marques fines** : lignes 2 px, points ≥ 8 px avec anneau de la couleur de surface, barres
  ≤ 24 px aux extrémités arrondies, aires à ~10 % d'opacité, grille horizontale 1 px discrète.
- **Un seul axe Y**, graduations rondes (`niceDomain`), barres partant de zéro.
- **Légende** dès 2 séries ; **tableau** toujours disponible (bouton « Tableau »).
- **Infobulle** : valeur d'abord, puis libellé, repérée par un trait de la couleur de la série ;
  réticule vertical sur les courbes.
- Une série dérivée (moyenne mobile) est en **pointillés**.
