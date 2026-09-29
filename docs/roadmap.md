# Roadmap VYRO

Règle : **qualité > quantité**. Une phase n'est terminée que lorsque FrontEnd, BackEnd, base de
données, validation, gestion des erreurs, états UX, tests, responsive et sécurité sont vérifiés.

| #  | Phase                      | Statut      |
| -- | -------------------------- | ----------- |
| 1  | Foundation                 | ✅ Terminée |
| 2  | Authentification           | ✅ Terminée |
| 3  | Design System (complément) | ✅ Terminée |
| 4  | Dashboard                  | ✅ Terminée |
| 5  | Exercices                  | ✅ Terminée |
| 6  | Entraînements              | ⏭️ Suivante |
| 7  | Poids                      | À faire     |
| 8  | Activités                  | À faire     |
| 9  | Records                    | À faire     |
| 10 | Objectifs                  | À faire     |
| 11 | Calendrier                 | À faire     |
| 12 | Gamification               | À faire     |
| 13 | Challenges                 | À faire     |
| 14 | PWA & hors-ligne           | À faire     |
| 15 | Préparation intégrations   | À faire     |

## Phase 1 — Foundation ✅

- [x] Structure `FrontEnd/` + `BackEnd/` + `docs/`
- [x] MySQL 8.4 via `docker compose up -d`
- [x] NestJS 11 : `/api/v1`, Swagger `/api/docs`, validation de l'environnement, format d'erreur unique,
      validation globale, Helmet, CORS, health check, Dockerfile de production
- [x] Prisma 6 : `User`, `Profile`, `RefreshToken`, `Exercise`, migration initiale, seed idempotent (20 exercices)
- [x] React 19 + Vite 7 + Tailwind 4 + conventions shadcn/ui
- [x] Design tokens VYRO, thème clair/sombre/système, logo, typographies
- [x] Navigation responsive (sidebar desktop, bottom nav mobile), routes lazy pour les 10 sections
- [x] Couche API (`apiRequest`, `ApiError`, traduction des erreurs), TanStack Query
- [x] ESLint, Prettier, tests (Jest/Supertest, Vitest/Testing Library), CI GitHub Actions

## Phase 2 — Authentification ✅

- [x] Inscription, connexion, déconnexion — mots de passe hashés en Argon2id
- [x] Access token JWT (15 min) en mémoire + refresh token opaque en cookie `httpOnly`
      (30 j), rotation à chaque usage, détection de réutilisation (révocation de la famille)
- [x] Refresh transparent côté FrontEnd (une seule requête, même avec plusieurs onglets)
- [x] Protection CSRF des routes à cookie (en-tête `X-VYRO-Client`)
- [x] Guard global (`@Public`, `@Roles`, `@CurrentUser`), rate limiting des routes sensibles
- [x] Mot de passe oublié / réinitialisation (lien à usage unique, 1 h), changement de mot de passe
      (déconnecte les autres appareils), suppression définitive du compte
- [x] Onboarding en 3 étapes : pseudo, objectif, fréquence, activités, unités
- [x] Profil (consultation / modification), paramètres : compte, apparence synchronisée, unités
- [x] Tests : unitaires, e2e, intégration sur MySQL réel ; tests FrontEnd des parcours

Hors périmètre, prévu plus tard : photo de profil (upload), vérification de l'adresse email,
connexion via fournisseurs tiers, notifications.

## Phase 3 — Design System ✅

- [x] Composants : select natif, textarea, switch, onglets, tooltip, spinner, barre de
      progression, stepper numérique (saisie en séance), dialogue de confirmation
- [x] Données : stat cards (variation colorée selon le sens souhaité), sélecteur de période,
      `QueryContent` (chargement / erreur / vide / succès)
- [x] Graphiques : palette validée (daltonisme, clair et sombre), courbes/aires avec moyenne
      et objectif, barres, légende, vue tableau accessible, graduations rondes
- [x] Formats et unités fr-FR (kg/lb, km/mi, durées, allure, variations)
- [x] Animations discrètes (apparition, décalage en grille, « pop »), respect de `prefers-reduced-motion`
- [x] Page de référence vivante `/design-system` (dev uniquement) + `docs/design-system.md`
- [x] Appliqué : réglage gamification (Paramètres), chiffres du dashboard

## Phase 4 — Dashboard ✅

- [x] `GET /api/v1/dashboard` : l'API est la source de vérité de tout ce que le dashboard affiche
- [x] Chaque section a un statut `READY` / `EMPTY` / `UNAVAILABLE` : une fonctionnalité non
      encore livrée n'est jamais affichée avec des chiffres inventés
- [x] Fuseau horaire de l'utilisateur (`Profile.timezone`), synchronisé depuis l'appareil :
      « aujourd'hui » et la semaine lundi → dimanche sont calculés dans son fuseau
- [x] Accueil selon l'heure, semaine en cours (jour courant), objectif hebdomadaire, cap,
      « Premiers pas » calculés par l'API, carte « Bientôt » pour les sections à venir
- [x] Statut technique du serveur déplacé dans Paramètres › À propos
- [x] Tests unitaires, intégration (MySQL) et FrontEnd

Chaque phase suivante remplace le statut `UNAVAILABLE` de sa section par un vrai calcul :
activité de la semaine et série (Phase 6), poids (Phase 7), records (Phase 9).

## Phase 5 — Exercices ✅

- [x] API : recherche (insensible à la casse et aux accents), filtres groupe musculaire /
      équipement / difficulté / source (tous, catalogue, perso), pagination, détail
- [x] Exercices personnalisés : création, modification, suppression (douce, pour conserver
      l'historique des séances) ; le catalogue est en lecture seule ; les exercices des autres
      utilisateurs sont invisibles (404)
- [x] Catalogue de 40 exercices couvrant tous les groupes musculaires (seed idempotent)
- [x] Bibliothèque FrontEnd : recherche instantanée, filtres conservés dans l'URL,
      « Afficher plus », fiche détaillée (exécution, conseils, muscles, type de suivi)
- [x] Accessible depuis l'onglet Entraînements (qui reste actif dans la navigation)
- [x] Tests : intégration (MySQL) et FrontEnd

## Phase 6 — Entraînements (prochaine)

- Séances : création, modification, duplication, planification, exercices et séries
- Mode séance : série en cours, validation, repos chronométré, pause, notes, fin de séance
- Historique ; alimente le dashboard (activité de la semaine, série)
