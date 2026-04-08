# إيجاري (Ejari) — Plateforme de location courte durée en Tunisie

Plateforme complète de location immobilière courte durée pour la Tunisie. Alternative locale à Airbnb et Booking.com avec paiement en dinars tunisiens, facturation fiscale automatique et authentification par OTP.

---

## Stack technique

| Couche                | Technologie                                       |
| --------------------- | ------------------------------------------------- |
| Frontend              | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend               | Node.js, Express, TypeScript                      |
| Base de données       | PostgreSQL via Prisma ORM                         |
| Cache / Sessions      | Redis (ioredis)                                   |
| Temps réel            | Socket.IO (chat hôte ↔ voyageur)                  |
| Paiements             | Konnect (dinars tunisiens)                        |
| Infrastructure locale | Docker Compose                                    |

---

## Structure du projet

```
ejerni/
├── app/
│   ├── api/                  ← Backend Express
│   │   ├── prisma/
│   │   │   ├── schema.prisma ← Définition de la base de données
│   │   │   └── seed.ts       ← Données de test
│   │   └── src/
│   │       ├── lib/          ← Client Prisma (singleton)
│   │       ├── middleware/   ← Vérification JWT
│   │       ├── routes/       ← auth, properties, bookings, payments
│   │       ├── services/     ← OTP (Redis), Redis client
│   │       └── socket.ts     ← Chat temps réel Socket.IO
│   └── web/                  ← Frontend Next.js
│       └── src/
│           ├── app/          ← Pages (App Router)
│           ├── components/   ← Composants réutilisables
│           ├── lib/          ← API client, Auth context
│           └── types/        ← Types TypeScript partagés
└── docker-compose.yml        ← Postgres + Redis en local
```

---

## Lancer le projet en local

### Prérequis

- Node.js v18+
- Docker Desktop

### 1. Démarrer l'infrastructure

```bash
docker compose up -d
# Lance PostgreSQL sur :5432 et Redis sur :6379
```

### 2. Backend API

```bash
cd app/api
cp .env.example .env       # Remplir JWT_SECRET avec une longue chaîne aléatoire
npm install
npx prisma generate
npx prisma db push
npm run db:seed            # Crée 6 propriétés et 3 utilisateurs de test
npm run dev                # API sur http://localhost:4000
```

### 3. Frontend

```bash
cd app/web
cp .env.local.example .env.local
npm install
npm run dev                # Site sur http://localhost:3000
```

---

## Comptes de test

Tous les OTP s'affichent dans le terminal de l'API (pas de vrai SMS en dev).

| Rôle                      | Téléphone    |
| ------------------------- | ------------ |
| Hôte 1 — Ahmed Ben Ali    | +21698000001 |
| Hôte 2 — Fatma Trabelsi   | +21698000002 |
| Voyageur — Khaled Mansour | +21698000003 |

---

## Flux de réservation complet

1. Le voyageur cherche un logement sur `/search`
2. Il sélectionne des dates sur la page `/property/:id`
3. Il clique "Réserver" → redirigé vers `/login` s'il n'est pas connecté
4. Après connexion, la réservation est créée avec statut `PENDING`
5. Il est redirigé vers la page de paiement mock (dev) ou Konnect (prod)
6. Après paiement : statut → `CONFIRMED`, facture fiscale générée automatiquement
7. L'hôte voit la réservation dans son tableau de bord et peut chatter avec le voyageur

---

## API — Endpoints principaux

```
POST   /auth/request-otp        Demander un code OTP
POST   /auth/verify-otp         Vérifier le code et obtenir un JWT
GET    /auth/me                 Profil de l'utilisateur connecté
POST   /auth/become-host        Passer du rôle GUEST à HOST

GET    /properties              Recherche avec filtres et disponibilité par dates
GET    /properties/:id          Détail d'une propriété
POST   /properties              Créer une annonce (hôtes uniquement)

POST   /bookings                Créer une réservation (vérifie les conflits)
GET    /bookings                Liste des réservations (hôte ou voyageur)
GET    /bookings/stats          Statistiques du tableau de bord hôte
POST   /bookings/:id/confirm    Confirmer une réservation (hôte)
POST   /bookings/:id/cancel     Annuler une réservation

POST   /payments/initiate       Initier un paiement Konnect
POST   /payments/webhook        Webhook Konnect (confirmation automatique)
POST   /payments/dev-confirm    Simuler un paiement (développement uniquement)
GET    /payments/invoice/:id    Récupérer la facture d'une réservation
```

---

## Pages frontend

| URL                       | Description              |
| ------------------------- | ------------------------ |
| `/`                       | Page d'accueil           |
| `/search`                 | Recherche avec filtres   |
| `/property/:id`           | Détail et réservation    |
| `/login`                  | Connexion par OTP        |
| `/bookings`               | Mes réservations         |
| `/booking/:id`            | Détail + chat temps réel |
| `/booking/:id/mock-pay`   | Paiement simulé (dev)    |
| `/booking/:id/success`    | Confirmation de paiement |
| `/become-host`            | Devenir hôte             |
| `/dashboard`              | Tableau de bord hôte     |
| `/dashboard/property/new` | Créer une annonce        |

---

## Fonctionnalités clés

- **Authentification OTP** — Connexion par numéro de téléphone sans mot de passe, avec limitation de débit et protection brute force
- **Recherche par disponibilité** — Filtre les logements déjà réservés pour les dates sélectionnées (formule de chevauchement d'intervalles)
- **Protection anti-double réservation** — Vérification de conflit avant chaque insertion en base
- **Chat temps réel** — Socket.IO avec authentification JWT, salles par réservation
- **Facturation fiscale automatique** — Facture avec TVA 19% générée dès la confirmation du paiement
- **Mode développement** — Paiements simulables sans compte Konnect, OTP affiché dans le terminal

---

## Déploiement (production)

| Service     | Plateforme recommandée |
| ----------- | ---------------------- |
| Frontend    | Vercel                 |
| Backend API | Railway                |
| PostgreSQL  | Neon ou Railway        |
| Redis       | Upstash                |

Variables d'environnement à configurer en production :

- `DATABASE_URL` — chaîne de connexion PostgreSQL
- `JWT_SECRET` — chaîne aléatoire longue (`openssl rand -base64 64`)
- `REDIS_URL` — URL Redis avec authentification
- `KONNECT_API_KEY` — Clé API Konnect
- `KONNECT_WALLET_ID` — ID de portefeuille Konnect
- `KONNECT_WEBHOOK_SECRET` — Secret de signature webhook
- `FRONTEND_URL` — URL de production du frontend
- `API_URL` — URL de production de l'API

---

## Développé par

Projet construit étape par étape avec une architecture production-ready :
TypeScript strict, séparation routes/services, singleton Prisma, OTP Redis avec TTL automatique, validation des chevauchements de dates, transactions atomiques pour les paiements.
