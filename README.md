# ACE Escape Game 2025 - Site d'Inscription

Site web pour gérer les inscriptions et le suivi de l'ACE 2025.

## Fonctionnalités

### Participants
- Inscription avec validation email
- Profil enrichi (Username, Affiliation)
- Création d'équipes (3-5 personnes)
- Code d'invitation pour rejoindre une équipe
- Dashboard avec informations d'équipe, score et classement

### Administrateurs
- Statistiques en temps réel
- Gestion des 4+ salles simultanées
- Attribution des équipes aux salles
- Démarrage/arrêt des sessions par salle
- Export CSV des inscriptions
- Synchronisation avec CTFd

## Stack Technique

**Frontend**
- Next.js 16.0.3 (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL avec Sequelize ORM
- Redis pour le cache
- JWT pour l'authentification

**Infrastructure**
- Docker Compose
- Nginx (reverse proxy)

## Démarrage Rapide

### Prérequis
- Docker et Docker Compose
- Node.js 20+ (optionnel pour dev local)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd ACE-website

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# Démarrer avec Docker
npm run dev

# Appliquer les migrations de base de données (si nécessaire)
docker compose exec backend npx sequelize-cli db:migrate
```

### Accès

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Compte Admin

Défini dans `.env`:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

## Structure du Projet

```
ACE-website/
├── backend/           # API Express + PostgreSQL
│   ├── src/
│   │   ├── config/    # Configuration (DB, Redis, env)
│   │   ├── models/    # Modèles Sequelize
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/  # Email, CTFd, Auth
│   │   └── middleware/
│   └── Dockerfile
├── frontend/          # Next.js Application
│   ├── app/           # Pages (App Router)
│   ├── components/    # Composants réutilisables
│   ├── lib/           # Utilities et types
│   └── Dockerfile
├── nginx/             # Configuration Nginx
└── docker-compose.yml
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-email` - Vérification email
- `GET /api/auth/profile` - Profil utilisateur

### Équipes
- `POST /api/teams/create` - Créer équipe
- `POST /api/teams/join` - Rejoindre équipe
- `GET /api/teams/my-team` - Mon équipe

### Admin
- `GET /api/admin/stats` - Statistiques
- `GET /api/admin/teams` - Liste équipes
- `GET /api/admin/export/csv` - Export CSV
- `POST /api/admin/rooms/assign` - Assigner salles
- `POST /api/admin/sessions/start` - Démarrer session

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Guide de démarrage rapide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement

## Auteur

Rénald DESIRE - Vizyon Dijital
