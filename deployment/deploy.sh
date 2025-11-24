#!/bin/bash

# ============================================
# Script de Déploiement ACE Website
# VPS Ubuntu avec Apache + Docker
# ============================================

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Déploiement ACE Website - Production${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================
# 1. Vérifications préalables
# ============================================
echo -e "${YELLOW}[1/7] Vérifications préalables...${NC}"

if [ ! -f "/etc/apache2/apache2.conf" ]; then
    echo -e "${RED}❌ Apache n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prérequis OK${NC}"

# ============================================
# 2. Configuration des chemins
# ============================================
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${YELLOW}[2/7] Répertoire projet : $PROJECT_DIR${NC}"

# ============================================
# 3. Activer les modules Apache
# ============================================
echo -e "${YELLOW}[3/7] Configuration Apache...${NC}"

sudo a2enmod proxy proxy_http proxy_wstunnel ssl rewrite headers

# ============================================
# 4. Installer les VirtualHosts Apache
# ============================================
echo -e "${YELLOW}[4/7] Installation VirtualHosts Apache...${NC}"

sudo cp "$SCRIPT_DIR/apache/ace.vizyondijital.fr.conf" /etc/apache2/sites-available/
sudo cp "$SCRIPT_DIR/apache/api.vizyondijital.fr.conf" /etc/apache2/sites-available/

echo -e "${GREEN}✅ VirtualHosts copiés${NC}"
echo -e "${YELLOW}Note: Les sites seront activés après l'installation SSL${NC}"

# ============================================
# 5. Vérifier le fichier .env
# ============================================
echo -e "${YELLOW}[5/7] Vérification du fichier .env...${NC}"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${BLUE}Création du .env à partir du template .env.production...${NC}"

    if [ -f "$PROJECT_DIR/.env.production" ]; then
        cp "$PROJECT_DIR/.env.production" "$PROJECT_DIR/.env"
        echo -e "${GREEN}✅ Fichier .env créé${NC}"
        echo -e "${RED}⚠️  IMPORTANT: Éditez $PROJECT_DIR/.env et remplacez tous les CHANGEME${NC}"
        echo -e "${YELLOW}Voulez-vous éditer maintenant? (y/n)${NC}"
        read -r EDIT_ENV
        if [[ "$EDIT_ENV" == "y" ]]; then
            nano "$PROJECT_DIR/.env"
        else
            echo -e "${RED}N'oubliez pas d'éditer le .env avant de continuer!${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Template .env.production non trouvé${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe${NC}"

    # Vérifier s'il reste des CHANGEME
    if grep -q "CHANGEME" "$PROJECT_DIR/.env"; then
        echo -e "${RED}⚠️  Le fichier .env contient encore des CHANGEME${NC}"
        echo -e "${YELLOW}Voulez-vous l'éditer maintenant? (y/n)${NC}"
        read -r EDIT_ENV
        if [[ "$EDIT_ENV" == "y" ]]; then
            nano "$PROJECT_DIR/.env"
        fi
    fi
fi

# ============================================
# 6. Installer les certificats SSL
# ============================================
echo -e "${YELLOW}[6/7] Installation certificats SSL...${NC}"

if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installation de Certbot...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-apache
fi

echo -e "${BLUE}Obtention des certificats SSL...${NC}"

# ACE Website
if [ ! -d "/etc/letsencrypt/live/ace.vizyondijital.fr" ]; then
    echo -e "${BLUE}Certificat pour ace.vizyondijital.fr${NC}"
    sudo certbot certonly --standalone -d ace.vizyondijital.fr
else
    echo -e "${GREEN}✅ Certificat ace.vizyondijital.fr déjà existant${NC}"
fi

# API
if [ ! -d "/etc/letsencrypt/live/api.vizyondijital.fr" ]; then
    echo -e "${BLUE}Certificat pour api.vizyondijital.fr${NC}"
    sudo certbot certonly --standalone -d api.vizyondijital.fr
else
    echo -e "${GREEN}✅ Certificat api.vizyondijital.fr déjà existant${NC}"
fi

# Activer les sites Apache
sudo a2ensite ace.vizyondijital.fr.conf
sudo a2ensite api.vizyondijital.fr.conf

# Tester la config Apache
sudo apache2ctl configtest

# Redémarrer Apache
sudo systemctl restart apache2

echo -e "${GREEN}✅ Certificats SSL installés et Apache configuré${NC}"

# ============================================
# 7. Démarrer Docker
# ============================================
echo -e "${YELLOW}[7/7] Démarrage des services Docker...${NC}"

cd "$PROJECT_DIR"

# Arrêter les anciens conteneurs
docker compose down 2>/dev/null || true

# Build et démarrer
docker compose up -d --build

echo -e "${BLUE}Attente du démarrage de PostgreSQL...${NC}"
sleep 15

# Vérifier les logs
docker compose logs backend | tail -20

echo -e "${GREEN}✅ Services Docker démarrés${NC}"

# ============================================
# Résumé
# ============================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ Déploiement ACE Website terminé !${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}URLs d'accès :${NC}"
echo -e "  • Site principal : ${GREEN}https://ace.vizyondijital.fr${NC}"
echo -e "  • API Backend    : ${GREEN}https://api.vizyondijital.fr${NC}"
echo ""
echo -e "${YELLOW}Prochaines étapes :${NC}"
echo "1. Testez : curl https://api.vizyondijital.fr/api/health"
echo "2. Vérifiez les logs : docker compose logs -f backend"
echo "3. Déployez ACE-CTF-Platform ensuite"
echo ""
echo -e "${BLUE}Ports utilisés :${NC}"
echo "  • Nginx  : 8080 (interne Docker)"
echo "  • Backend: 5000"
echo "  • Frontend: 3000"
echo ""
echo -e "${RED}⚠️  Sauvegardez le fichier .env en lieu sûr !${NC}"
echo ""
