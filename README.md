# VYRO

> **Ton sport. Ton évolution.**

VYRO est une plateforme sportive personnelle : entraînements, activités, poids, objectifs, records,
statistiques et progression, réunis dans une PWA moderne, mobile-first et installable.

> **Statut : Phase 1 — Foundation terminée.** L'architecture, le design system, la navigation,
> l'API, la base de données et l'outillage sont en place. Les fonctionnalités métier
> (authentification, entraînements, poids…) arrivent phase par phase — voir [`docs/roadmap.md`](docs/roadmap.md).

---

## Architecture

```text
VYRO/
├── FrontEnd/            → React + Vite + TypeScript (PWA)        localhost:5173
├── BackEnd/             → NestJS + Prisma (API REST /api/v1)     localhost:3000
├── docs/                → Architecture, roadmap
├── docker/              → Scripts d'init MySQL (dev)
├── docker-compose.yml   → MySQL 8.4 local
├── .env.example
└── README.md
```

```text
FrontEnd (React) ──REST /api/v1──▶ BackEnd (NestJS) ──Prisma──▶ MySQL
```

Le FrontEnd et le BackEnd sont deux applications indépendantes (chacune son `package.json`,
ses dépendances et son déploiement). Détails : [`docs/architecture.md`](docs/architecture.md).

| Couche     | Technologies                                                                         |
| ---------- | ------------------------------------------------------------------------------------ |
| FrontEnd   | React 19, Vite 7, TypeScript, React Router 7, Tailwind CSS 4, shadcn/ui, TanStack Query 5 |
| BackEnd    | NestJS 11, TypeScript, Swagger/OpenAPI, class-validator, Helmet                      |
| Données    | MySQL 8.4, Prisma 6                                                                  |
| Qualité    | ESLint, Prettier, Jest + Supertest (API), Vitest + Testing Library (web), GitHub Actions |

Les bibliothèques prévues par la suite (React Hook Form + Zod, Recharts, Vite PWA Plugin, JWT)
seront ajoutées avec les phases qui les utilisent.

---

## Prérequis

- Node.js **22+** et npm 10+
- Docker + Docker Compose (pour MySQL en local)

## Installation

### 1. Base de données (MySQL)

```bash
cp .env.example .env        # optionnel : identifiants MySQL locaux
docker compose up -d
```

### 2. BackEnd

```bash
cd BackEnd
cp .env.example .env
npm install                 # génère aussi le client Prisma
npx prisma migrate dev      # applique les migrations
npm run prisma:seed         # catalogue d'exercices (idempotent)
npm run start:dev
```

- API : <http://localhost:3000/api/v1>
- Santé : <http://localhost:3000/api/v1/health>
- Swagger : <http://localhost:3000/api/docs>

### 3. FrontEnd

```bash
cd FrontEnd
cp .env.example .env.local
npm install
npm run dev
```

Application : <http://localhost:5173>

---

## Variables d'environnement

| Fichier                   | Variable             | Rôle                                                  |
| ------------------------- | -------------------- | ----------------------------------------------------- |
| `.env`                    | `MYSQL_*`            | Identifiants du conteneur MySQL local                 |
| `BackEnd/.env`            | `DATABASE_URL`       | Connexion MySQL (Prisma)                              |
|                           | `JWT_SECRET`, `JWT_REFRESH_SECRET` | ≥ 32 caractères, **obligatoires en production** |
|                           | `PORT`               | Port de l'API (3000)                                  |
|                           | `FRONTEND_URL`       | Origines CORS autorisées (séparées par des virgules)  |
|                           | `SWAGGER_ENABLED`    | Force l'activation de Swagger (désactivé en prod par défaut) |
| `FrontEnd/.env.local`     | `VITE_API_URL`       | URL de l'API, ex. `http://localhost:3000/api/v1`      |

Aucun fichier `.env` réel n'est versionné. L'API refuse de démarrer si sa configuration est invalide.

---

## Prisma

Toutes les commandes se lancent depuis `BackEnd/` :

| Commande                          | Effet                                           |
| --------------------------------- | ----------------------------------------------- |
| `npx prisma migrate dev --name x` | Crée et applique une migration (dev)            |
| `npm run prisma:deploy`           | Applique les migrations (production / CI)       |
| `npm run prisma:seed`             | Données de référence (exercices), idempotent    |
| `npm run prisma:studio`           | Explorateur de données                          |

Le seed ne crée **jamais** de données utilisateur : uniquement des données de référence partagées.

## Tests et qualité

```bash
# BackEnd
npm run lint && npm run typecheck
npm test            # tests unitaires
npm run test:e2e    # pipeline HTTP complet (base mockée, sans MySQL)

# FrontEnd
npm run lint
npm test
```

La CI GitHub Actions (`.github/workflows/ci.yml`) exécute lint, format, types, tests et build
pour les deux applications.

## Build

```bash
cd BackEnd && npm run build && npm run start:prod
cd FrontEnd && npm run build     # sortie statique dans FrontEnd/dist
```

---

## Déploiement

Le FrontEnd et le BackEnd se déploient séparément, sans dépendance à un fournisseur.

**FrontEnd** — site statique (Vercel, Netlify, Cloudflare Pages, Nginx…)

- Dossier racine : `FrontEnd`, commande `npm run build`, sortie `dist`
- Définir `VITE_API_URL` au build
- Configurer la réécriture SPA : toutes les routes → `index.html`

**BackEnd** — tout hébergeur Node.js ou conteneur (Railway, Render, Fly.io, VPS…)

- Image Docker fournie : `BackEnd/Dockerfile` (applique `prisma migrate deploy` au démarrage)
- Ou sans Docker : `npm ci && npm run build && npm run prisma:deploy && npm run start:prod`
- Variables : `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`
- Sonde de santé : `GET /api/v1/health` (503 si la base est indisponible)

**Base de données** — tout MySQL 8 compatible (managé ou VPS).

---

## Conventions

- Commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`…)
- Format d'erreur API unique : `{ statusCode, code, message, details? }` — voir `docs/architecture.md`
- Le BackEnd est la source de vérité (records, statistiques, XP, VYRO Score…)
