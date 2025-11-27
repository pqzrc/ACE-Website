# ACE 2025 - Site d'Inscription

Plateforme web d'inscription pour l'événement ACE (Antilles Cyber Escape) 2025 - Un escape game cybersécurité organisé pour l'Université des Antilles.

## 🎯 Fonctionnalités

- **Inscription utilisateur** avec vérification email
- **Gestion d'équipes** (création, rejoindre, gestion des membres)
- **Interface administrateur** complète
- **Export CSV personnalisable** des données
- **Gestion des créneaux horaires** et salles
- **Synchronisation avec CTFd** pour le scoring
- **Notifications personnalisées** et interface moderne

## 🚀 Démarrage Rapide

### Prérequis

- Docker et Docker Compose
- Git

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd ACE-Website
   ```

2. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos paramètres
   ```

3. **Démarrer les services**
   ```bash
   make start
   ```

4. **Accéder à l'application**
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:5000
   - Nginx : http://localhost:8080

## 📋 Commandes Principales

```bash
make help          # Afficher toutes les commandes
make start         # Démarrer tous les services
make stop          # Arrêter tous les services
make logs          # Voir les logs
make status        # État des services
make db-shell      # Accès base de données
make health-check  # Vérifier la santé du système
```

## 🏗️ Architecture

```
ACE-Website/
├── frontend/          # Application Next.js
├── backend/           # API Node.js/Express
├── nginx/            # Configuration reverse proxy
├── email-templates/  # Templates d'emails
└── deployment/       # Scripts de déploiement
```

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
# Base de données
DATABASE_URL=postgresql://aceuser:acepass@postgres:5432/acedb

# JWT & Sécurité
JWT_SECRET=your-secret-key

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# URLs
FRONTEND_URL=http://localhost:3000
CTFD_URL=http://localhost:8000

# Admin par défaut
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

## 👥 Gestion des Utilisateurs

### Créer un Admin

```bash
make db-make-admin EMAIL=admin@example.com
```

### Statistiques

```bash
make db-stats          # Statistiques complètes
make leaderboard       # Classement des équipes
```

## 📊 Base de Données

### Backup & Restore

```bash
make db-backup                           # Créer un backup
make db-restore FILE=backup.sql          # Restaurer un backup
make db-reset                           # Réinitialiser (⚠️ perte de données)
```

### Requêtes Utiles

```bash
make db-list-users     # Lister tous les utilisateurs
make db-list-teams     # Lister toutes les équipes
make db-count-users    # Compter les utilisateurs
```

## 🔗 Intégration CTFd

Ce site s'intègre avec la plateforme CTFd pour synchroniser :
- Les équipes et leurs membres
- Les scores en temps réel
- L'authentification unique

Voir le projet `ACE-ctf-platform` pour la configuration CTFd.

## 🚀 Déploiement

### Production

1. **Préparer l'environnement**
   ```bash
   # Configurer .env pour la production
   # Vérifier docker-compose.yml
   ```

2. **Déployer**
   ```bash
   make deploy        # Pull + rebuild
   # ou
   make pull         # Pull des changements Git
   make rebuild      # Reconstruction complète
   ```

3. **Monitoring**
   ```bash
   make health-check  # Vérifier la santé
   make stats        # Statistiques conteneurs
   ```

## 🛠️ Développement

### Structure du Code

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS
- **Backend** : Node.js, Express, TypeScript, Sequelize
- **Base de données** : PostgreSQL
- **Cache** : Redis
- **Email** : Nodemailer avec templates HTML

### API Endpoints

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/teams/my-team` - Équipe de l'utilisateur
- `POST /api/admin/export/csv` - Export CSV personnalisé
- `GET /api/timeslots` - Créneaux horaires disponibles

## 📝 Troubleshooting

### Problèmes Courants

**Services ne démarrent pas**
```bash
make status        # Vérifier l'état
make logs         # Voir les erreurs
make fresh        # Redémarrage complet
```

**Base de données inaccessible**
```bash
make db-shell     # Tester la connexion
# Vérifier DATABASE_URL dans .env
```

**Emails non envoyés**
```bash
# Vérifier la configuration SMTP dans .env
make logs-backend  # Voir les logs d'email
```

## 📄 Licence

Projet développé pour Vizyon Dijital - ACE 2025

## 👨‍💻 Auteur

**Rénald DESIRE** - Développeur principal

---

Pour plus d'informations, consultez le [Guide de Démarrage Rapide](QUICKSTART.md) ou les [Scripts de Déploiement](deployment/DEPLOY.md).