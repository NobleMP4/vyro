# Architecture VYRO

## Vue d'ensemble

```text
┌──────────────────────────┐     REST /api/v1      ┌──────────────────────────┐   Prisma   ┌─────────┐
│ FrontEnd                 │ ────────────────────▶ │ BackEnd                  │ ─────────▶ │  MySQL  │
│ React + Vite (PWA)       │                       │ NestJS                   │            │   8.4   │
└──────────────────────────┘                       └──────────────────────────┘            └─────────┘
```

Principe : **React → NestJS → Prisma → MySQL**, rien de plus tant que ce n'est pas nécessaire
(pas de microservices, pas de bus d'événements, pas de monorepo partagé).

---

## BackEnd (`BackEnd/`)

```text
src/
├── main.ts              → bootstrap
├── app.module.ts        → modules racine
├── app.setup.ts         → pipeline HTTP commun (préfixe, versioning, pipes, filtres, CORS, Swagger)
├── config/              → validation des variables d'environnement
├── common/
│   ├── errors/          → ErrorCode, AppException
│   ├── filters/         → AllExceptionsFilter (format d'erreur unique)
│   ├── pipes/           → ValidationPipe globale
│   └── dto/             → DTO transverses (ErrorResponseDto)
├── prisma/              → PrismaService (global)
└── health/              → GET /api/v1/health
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
test/                    → tests e2e
```

Chaque domaine métier sera un module Nest autonome, ajouté dans sa phase :
`auth`, `users`, `exercises`, `workouts`, `activities`, `weight`, `goals`, `records`,
`statistics`, `challenges`, `notifications`, `integrations`.

Structure d'un module :

```text
workouts/
├── workouts.module.ts
├── workouts.controller.ts   → HTTP uniquement (routes, DTO, Swagger)
├── workouts.service.ts      → logique métier
├── dto/                     → DTO validés par class-validator
└── *.spec.ts                → tests
```

### Conventions API

- Préfixe + version : `/api/v1/...` (versioning URI Nest, version par défaut `1`)
- Documentation Swagger : `/api/docs` (JSON : `/api/docs-json`), désactivée en production sauf `SWAGGER_ENABLED=true`
- Validation globale : `whitelist` + `forbidNonWhitelisted` — tout champ inconnu est refusé
- Sécurité : Helmet, CORS limité à `FRONTEND_URL`, secrets JWT obligatoires en production

### Format d'erreur

Toutes les erreurs ont la même forme :

```json
{
  "statusCode": 400,
  "code": "VALIDATION_FAILED",
  "message": "Les données envoyées sont invalides.",
  "details": [{ "field": "email", "errors": ["email must be an email"] }],
  "path": "/api/v1/auth/register",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

- Les services lèvent `new AppException(status, 'INVALID_WEIGHT', 'Le poids fourni est invalide.')`.
- Les erreurs Prisma connues sont traduites (`P2002` → 409 `CONFLICT`, `P2025` → 404 `NOT_FOUND`).
- Toute autre erreur devient 500 `INTERNAL_ERROR` : la stack est journalisée, jamais renvoyée.
- Les codes sont stables : le FrontEnd les traduit en messages (`FrontEnd/src/lib/error-messages.ts`).

### Modèle de données (Phase 1)

| Modèle         | Rôle                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `User`         | Compte (email unique, hash du mot de passe, rôle, soft delete)              |
| `Profile`      | Nom affiché, unités (kg/lb, km/mi, cm/ft), thème, préférences               |
| `RefreshToken` | Hash SHA-256 du token, famille de rotation, expiration, révocation          |
| `Exercise`     | Catalogue partagé (`ownerId = null`, clé `slug`) ou exercice personnel      |

Les autres entités (`Workout`, `WorkoutExercise`, `WorkoutSet`, `Activity`, `WeightEntry`, `Goal`,
`PersonalRecord`, `Challenge`, `UserChallenge`, `Notification`, `Integration`, `HealthData`)
seront ajoutées avec leur phase, chacune par une migration dédiée.

Règles prévues pour les données importées (Apple Health, Health Connect) :
`source` + `externalId` avec contrainte d'unicité `(userId, source, externalId)`,
afin que l'import soit **idempotent**.

---

## FrontEnd (`FrontEnd/`)

```text
src/
├── main.tsx / App.tsx   → montage + providers (TanStack Query, thème, routeur)
├── router/              → routes (lazy), chemins centralisés
├── layouts/             → AppLayout (sidebar desktop, bottom nav mobile)
├── pages/               → une page par section (code-splittée)
├── components/
│   ├── ui/              → primitives shadcn/ui (Button, Card, Badge, Skeleton…)
│   ├── brand/           → logo
│   ├── navigation/      → Sidebar, BottomNav, MobileTopBar
│   ├── feedback/        → EmptyState, ErrorState, PageLoader, ComingSoon
│   └── layout/          → PageHeader
├── services/            → appels API par domaine (ex. health.service.ts)
├── hooks/               → hooks TanStack Query et utilitaires
├── lib/                 → api-client, erreurs, query client, env, utils
├── stores/              → état client (thème)
└── types/               → types partagés avec l'API
```

Flux de données :

```text
Composant → hook (useQuery/useMutation) → service → apiRequest() → fetch(VITE_API_URL + path)
```

- Aucun composant n'appelle `fetch` directement ; l'URL de l'API ne vient que de `VITE_API_URL`.
- `apiRequest` lève une `ApiError { status, code, message, details }` ; les erreurs réseau et
  timeouts ont leurs propres codes (`NETWORK_ERROR`, `TIMEOUT`).
- TanStack Query ne réessaie pas les erreurs 4xx.
- Chaque écran gère ses états : chargement (skeleton), vide, erreur (avec « Réessayer »), succès.

### Design system

- Tokens CSS dans `src/index.css` (clair / sombre), exposés à Tailwind via `@theme`.
- Accent de marque **Volt** (`--primary`) utilisé avec parcimonie ; `--brand` pour le texte d'accent.
- Typographies : Inter (texte), Space Grotesk (titres, logo) — auto-hébergées pour le hors-ligne.
- Thème clair / sombre / système, appliqué avant le premier rendu (pas de flash).
- Mobile-first : bottom navigation avec grandes cibles tactiles et safe areas, sidebar à partir de `lg`.
- Animations discrètes, désactivées si `prefers-reduced-motion`.

---

## Intégrations santé (préparation)

Une PWA ne peut pas accéder à HealthKit ni à Health Connect. Architecture cible :

```text
VYRO (React) → Capacitor → iOS natif → HealthKit → Apple Health
                         → Android natif → Health Connect
```

Le code métier dépendra d'une abstraction, jamais d'une API native :

```ts
interface HealthProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  syncWorkouts(): Promise<void>;
  syncWeight(): Promise<void>;
  getStatus(): Promise<IntegrationStatus>;
}
```

Aucune intégration ne sera simulée dans la PWA : l'écran Intégrations indiquera « Non connecté »
tant que l'application native n'existe pas.
