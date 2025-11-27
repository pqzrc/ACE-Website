# Guide de Démarrage Rapide - ACE Website

Ce guide vous permet de démarrer rapidement le site d'inscription ACE en quelques minutes.

## 🚀 Installation Express (5 minutes)

### 1. Prérequis

Assurez-vous d'avoir installé :
- **Docker** et **Docker Compose**
- **Git**

### 2. Cloner et Configurer

```bash
# Cloner le projet
git clone <repository-url>
cd ACE-Website

# Copier la configuration
cp .env.example .env
```

### 3. Configurer les Variables Essentielles

Éditez le fichier `.env` avec vos paramètres :

```bash
# Base de données (garder par défaut pour un test local)
DATABASE_URL=postgresql://aceuser:acepass@postgres:5432/acedb

# Sécurité (IMPORTANT : changer en production)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email SMTP (requis pour les inscriptions)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ACE 2025 <your-email@gmail.com>

# URLs
FRONTEND_URL=http://localhost:3000
CTFD_URL=http://localhost:8000

# Admin par défaut
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

### 4. Démarrer l'Application

```bash
# Démarrer tous les services
make start

# Attendre 30 secondes pour l'initialisation
# Vérifier que tout fonctionne
make health-check
```

### 5. Accéder à l'Application

- **Site web** : http://localhost:3000
- **API Backend** : http://localhost:5000
- **Nginx (proxy)** : http://localhost:8080

## ✅ Vérification du Fonctionnement

### Test Rapide

1. **Ouvrir** http://localhost:3000
2. **Cliquer** sur "S'inscrire"
3. **Créer** un compte de test
4. **Vérifier** que l'email de vérification est envoyé

### Créer un Administrateur

```bash
# Promouvoir votre compte en admin
make db-make-admin EMAIL=votre-email@example.com

# Ou utiliser l'admin par défaut configuré dans .env
```

### Accès Admin

1. **Se connecter** avec le compte admin
2. **Accéder** à l'interface admin via le menu
3. **Tester** les fonctionnalités :
   - Création d'équipes
   - Gestion des créneaux horaires
   - Export CSV

## 🔧 Commandes Utiles

```bash
# Gestion des services
make start          # Démarrer
make stop           # Arrêter
make restart        # Redémarrer
make status         # État des services

# Logs et debug
make logs           # Logs backend
make logs-all       # Tous les logs
make health-check   # Vérifier la santé

# Base de données
make db-stats       # Statistiques
make db-backup      # Sauvegarder
make db-shell       # Accès SQL direct
```

## 🚨 Résolution de Problèmes

### Services ne démarrent pas

```bash
# Vérifier l'état
make status

# Voir les erreurs
make logs-all

# Redémarrage complet
make fresh
```

### Emails non envoyés

1. **Vérifier** la configuration SMTP dans `.env`
2. **Tester** avec un service comme Gmail (app password requis)
3. **Voir les logs** : `make logs-backend`

### Base de données inaccessible

```bash
# Tester la connexion
make db-shell

# Si erreur, vérifier DATABASE_URL dans .env
# Redémarrer les services
make restart
```

### Port déjà utilisé

Si les ports 3000, 5000 ou 8080 sont occupés :

1. **Arrêter** les autres services sur ces ports
2. **Ou modifier** les ports dans `docker-compose.yml`

## 📱 Interface Utilisateur

### Inscription d'un Utilisateur

1. **Aller** sur http://localhost:3000
2. **Cliquer** "S'inscrire"
3. **Remplir** le formulaire (tous les champs requis)
4. **Vérifier** l'email reçu
5. **Cliquer** sur le lien de vérification

### Création d'Équipe

1. **Se connecter** avec un compte vérifié
2. **Aller** dans "Dashboard"
3. **Cliquer** "Créer une équipe"
4. **Choisir** un nom et un créneau horaire
5. **Inviter** des membres avec le code d'invitation

### Interface Admin

1. **Se connecter** avec un compte admin
2. **Accéder** aux onglets admin :
   - **Statistiques** : Vue d'ensemble
   - **Équipes** : Gestion complète des équipes
   - **Créneaux** : Gestion des horaires et salles
   - **Export** : Télécharger les données CSV

## 🔗 Intégration CTFd

Pour connecter avec la plateforme CTFd :

1. **Démarrer** le projet `ACE-ctf-platform`
2. **Vérifier** que `CTFD_URL` pointe vers CTFd
3. **Configurer** la synchronisation dans CTFd

## 📞 Support

En cas de problème :

1. **Consulter** les logs : `make logs-all`
2. **Vérifier** la configuration dans `.env`
3. **Tester** la connectivité : `make health-check`

---

**Auteur** : Rénald DESIRE  
**Projet** : ACE 2025 - Vizyon Dijital