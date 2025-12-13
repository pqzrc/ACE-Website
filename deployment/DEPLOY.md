# Comment Déployer ACE Website sur VPS

Guide simple pour déployer ACE Website en production sur un serveur Ubuntu avec Apache.

## Prérequis

- Un VPS Ubuntu 20.04+
- Accès SSH au serveur
- Les domaines `ace.vizyondijital.fr` et `api.vizyondijital.fr` pointent vers votre IP VPS

## Étapes de Déploiement

### 1. Installer les logiciels nécessaires

Connectez-vous en SSH à votre VPS et exécutez :

```bash
sudo apt update
sudo apt install -y apache2 docker.io docker compose-plugin git
```

### 2. Cloner le projet

```bash
git clone <votre-repo-github> /opt/ace-website
cd /opt/ace-website
```

### 3. Configurer les secrets

```bash
# Copier le template
cp .env.production .env

# Éditer le fichier
nano .env
```

Remplacez tous les `CHANGEME` par vos vraies valeurs. Consultez `ENV-GUIDE.md` pour plus de détails.

**Important** : Notez bien le `JWT_SECRET` et `WEBHOOK_SECRET`, ils devront être identiques dans ACE-CTF-Platform.

### 4. Lancer le déploiement automatique

```bash
cd deployment
sudo ./deploy.sh
```

Le script va :
- Configurer Apache
- Installer les certificats SSL
- Démarrer les services Docker

### 5. Vérifier que tout fonctionne

```bash
# Tester l'API
curl https://api.vizyondijital.fr/api/health

# Devrait afficher : {"status":"ok"}
```

Ouvrez votre navigateur sur `https://ace.vizyondijital.fr` - vous devriez voir la page d'accueil.

## Prochaine Étape

Déployez maintenant ACE-CTF-Platform en suivant son guide `deployment/DEPLOY.md`.

