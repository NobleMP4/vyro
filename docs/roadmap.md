# Roadmap VYRO

Règle : **qualité > quantité**. Une phase n'est terminée que lorsque FrontEnd, BackEnd, base de
données, validation, gestion des erreurs, états UX, tests, responsive et sécurité sont vérifiés.

| #  | Phase                      | Statut      |
| -- | -------------------------- | ----------- |
| 1  | Foundation                 | ✅ Terminée |
| 2  | Authentification           | ⏭️ Suivante |
| 3  | Design System (complément) | À faire     |
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

## Phase 2 — Authentification (prochaine)

- Inscription, connexion, déconnexion (hash Argon2/bcrypt)
- Access token JWT court + refresh token en cookie `httpOnly`, rotation et détection de réutilisation
- Guards NestJS, décorateur `@CurrentUser`, routes publiques explicites
- Rate limiting (`@nestjs/throttler`) sur les routes d'auth
- Mot de passe oublié / changement de mot de passe, suppression du compte
- FrontEnd : pages d'auth (React Hook Form + Zod), routes protégées, refresh transparent
- Onboarding court (pseudo, unités, objectif principal)
