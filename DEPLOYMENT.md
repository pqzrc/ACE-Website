# Guide de Déploiement

## Prérequis

- Docker et Docker Compose
- Node.js 20+ (pour le développement local)
- Compte SMTP pour l'envoi d'emails (Gmail, SendGrid, etc.)
- Instance CTFd avec API token (optionnel)

## Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd ACE-website
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d

# CTFd Integration
CTFD_API_URL=https://votre-ctfd-instance.com
CTFD_API_TOKEN=votre-token-ctfd

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=ACE Escape Game <noreply@ace-escapegame.com>

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@ace-escapegame.com
ADMIN_PASSWORD=MotDePasseSecurise123!
```

### 3. Configuration SMTP (Gmail)

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `SMTP_PASS`

## Démarrage

### Développement

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Accès aux services

- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- MailHog (dev) : http://localhost:8025
- PostgreSQL : localhost:5433
- Redis : localhost:6379

## Utilisation

### Premier démarrage

1. Attendez que tous les services soient démarrés (30-60 secondes)
2. Un compte admin est automatiquement créé avec les credentials du `.env`
3. Connectez-vous avec les identifiants admin

### Inscription des participants

1. Les participants s'inscrivent via http://localhost:3000/register
2. Ils reçoivent un email de vérification
3. Après vérification, ils peuvent créer ou rejoindre une équipe

### Gestion des équipes

**Création d'équipe :**
- Le créateur devient capitaine
- Un code d'invitation unique est généré (6 caractères)
- L'équipe peut accueillir 3 à 5 membres

**Rejoindre une équipe :**
- Utiliser le code d'invitation partagé par le capitaine

### Configuration CTFd

1. Créez un token API dans votre instance CTFd
2. Ajoutez l'URL et le token dans `.env`
3. Redémarrez le backend : `docker compose restart backend`

## Commandes utiles

### Services

```bash
# Voir les logs
docker compose logs -f backend
docker compose logs -f frontend

# Redémarrer un service
docker compose restart backend

# Arrêter tous les services
docker compose down
```

### Base de données

```bash
# Accéder à PostgreSQL
docker compose exec postgres psql -U aceuser -d acedb

# Backup
docker compose exec postgres pg_dump -U aceuser acedb > backup.sql

# Restore
docker compose exec -T postgres psql -U aceuser acedb < backup.sql

# Réinitialiser (supprime toutes les données)
docker compose down -v
docker compose up -d
```

### Redis

```bash
# Accéder à Redis CLI
docker compose exec redis redis-cli

# Vider le cache
docker compose exec redis redis-cli FLUSHALL
```

## Dépannage

### Le backend ne démarre pas

1. Vérifiez les logs : `docker compose logs backend`
2. Vérifiez que PostgreSQL est démarré : `docker compose ps`
3. Attendez quelques secondes (PostgreSQL met du temps à démarrer)

### Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les credentials dans `docker compose.yml`
3. Recréez le container : `docker compose up -d --force-recreate backend`

### Les emails ne sont pas envoyés

1. Vérifiez les credentials SMTP dans `.env`
2. Pour Gmail, utilisez un mot de passe d'application
3. En développement, utilisez MailHog (déjà configuré)

### Port déjà utilisé

Si un port est déjà utilisé :

```bash
# Identifier le processus
sudo lsof -i :3000

# Tuer le processus
sudo kill -9 <PID>

# Ou changer le port dans docker compose.yml
```



