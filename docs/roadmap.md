# Roadmap VYRO

Règle : **qualité > quantité**. Une phase n'est terminée que lorsque FrontEnd, BackEnd, base de
données, validation, gestion des erreurs, états UX, tests, responsive et sécurité sont vérifiés.

| #  | Phase                      | Statut      |
| -- | -------------------------- | ----------- |
| 1  | Foundation                 | ✅ Terminée |
| 2  | Authentification           | ✅ Terminée |
| 3  | Design System (complément) | ⏭️ Suivante |
| 4  | Dashboard                  | À faire     |
| 5  | Exercices                  | À faire     |
| 6  | Entraînements              | À faire     |
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

## Phase 3 — Design System (prochaine)

- Compléter les composants partagés (select, textarea, tabs, sheet, tooltip, stat cards…)
- États de chargement et animations homogènes, documentation des composants
