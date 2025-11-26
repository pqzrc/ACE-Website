.PHONY: help start stop restart rebuild logs logs-all status clean db-reset db-shell db-backup db-list-users db-list-teams db-stats deploy pull push dev dev-stop dev-logs

# ACE Website - Makefile
# Usage: make <commande>

DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_DEV = docker compose -f docker-compose.dev.yml

help: ## Afficher l'aide
	@echo ""
	@echo "ACE Website - Commandes disponibles"
	@echo "===================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# --- Commandes de base ---

start: ## Démarrer tous les services (production)
	@echo "Démarrage du site ACE (production)..."
	$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "Services démarrés:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:5000"
	@echo "  MailHog:   http://localhost:8025"
	@echo ""
	@echo "Voir les logs: make logs"

dev: ## Démarrer l'environnement de développement avec hot-reload
	@echo "🚀 Démarrage de l'environnement de développement..."
	@$(DOCKER_COMPOSE_DEV) up -d --build
	@echo ""
	@echo "✅ Services démarrés (mode développement):"
	@echo "  🌐 Frontend:     http://localhost:3000 (hot-reload activé)"
	@echo "  🔧 Backend API:  http://localhost:5000 (hot-reload activé)"
	@echo "  📧 MailHog:      http://localhost:8025"
	@echo "  🏆 Classement:   http://localhost:3000/classement"
	@echo "  🗄️  PostgreSQL:   localhost:5433"
	@echo "  🔴 Redis:        localhost:6379"
	@echo ""
	@echo "📝 Commandes utiles:"
	@echo "  Voir les logs: make dev-logs"
	@echo "  Arrêter:       make dev-stop"
	@echo "  Migrations:    make dev-migrate"
	@echo ""

dev-stop: ## Arrêter l'environnement de développement
	@echo "🛑 Arrêt de l'environnement de développement..."
	@$(DOCKER_COMPOSE_DEV) down
	@echo "✅ Services arrêtés"

dev-logs: ## Voir les logs en mode développement
	@$(DOCKER_COMPOSE_DEV) logs -f

dev-logs-backend: ## Logs du backend (dev)
	@$(DOCKER_COMPOSE_DEV) logs -f backend

dev-logs-frontend: ## Logs du frontend (dev)
	@$(DOCKER_COMPOSE_DEV) logs -f frontend

dev-restart: dev-stop dev ## Redémarrer l'environnement de développement

dev-migrate: ## Exécuter les migrations en mode dev
	@echo "🔧 Exécution des migrations..."
	@$(DOCKER_COMPOSE_DEV) exec backend npm run migrate
	@echo "✅ Migrations terminées"

dev-db-shell: ## Shell PostgreSQL (dev)
	@$(DOCKER_COMPOSE_DEV) exec postgres psql -U aceuser -d acedb

dev-backend-shell: ## Shell dans le conteneur backend (dev)
	@$(DOCKER_COMPOSE_DEV) exec backend sh

dev-frontend-shell: ## Shell dans le conteneur frontend (dev)
	@$(DOCKER_COMPOSE_DEV) exec frontend sh

dev-status: ## État des services (dev)
	@$(DOCKER_COMPOSE_DEV) ps

dev-leaderboard: ## Afficher le classement (dev)
	@echo "🏆 Classement actuel (Dev):"
	@$(DOCKER_COMPOSE_DEV) exec postgres psql -U aceuser -d acedb -c "SELECT name, \"currentScore\", rank FROM teams ORDER BY \"currentScore\" DESC LIMIT 10;"

dev-clean: ## Nettoyer les volumes de dev (PERTE DE DONNÉES)
	@echo "⚠️  ATTENTION: Suppression des données de développement"
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(DOCKER_COMPOSE_DEV) down -v; \
		echo "✅ Nettoyage terminé"; \
	else \
		echo "Annulé"; \
	fi

stop: ## Arrêter tous les services
	$(DOCKER_COMPOSE) down
	@echo "Services arrêtés"

restart: ## Redémarrer tous les services
	$(DOCKER_COMPOSE) restart
	@echo "Services redémarrés"

restart-backend: ## Redémarrer le backend uniquement
	$(DOCKER_COMPOSE) restart backend
	@echo "Backend redémarré"

restart-frontend: ## Redémarrer le frontend uniquement
	$(DOCKER_COMPOSE) restart frontend
	@echo "Frontend redémarré"

# --- Build & Rebuild ---

rebuild: ## Rebuild complet et redémarrage
	@echo "Reconstruction et redémarrage..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "Rebuild terminé"

rebuild-backend: ## Rebuild le backend uniquement
	$(DOCKER_COMPOSE) up -d --build backend
	@echo "Backend reconstruit"

rebuild-frontend: ## Rebuild le frontend uniquement
	$(DOCKER_COMPOSE) up -d --build frontend
	@echo "Frontend reconstruit"

# --- Logs ---

logs: logs-backend ## Logs du backend (par défaut)

logs-backend: ## Logs du backend en temps réel
	$(DOCKER_COMPOSE) logs -f --tail=100 backend

logs-frontend: ## Logs du frontend en temps réel
	$(DOCKER_COMPOSE) logs -f --tail=100 frontend

logs-db: ## Logs de la base de données
	$(DOCKER_COMPOSE) logs -f --tail=100 postgres

logs-all: ## Tous les logs en temps réel
	$(DOCKER_COMPOSE) logs -f --tail=50

logs-errors: ## Afficher seulement les erreurs
	$(DOCKER_COMPOSE) logs --tail=500 | grep -i error

# --- Base de données ---

db-shell: ## Ouvrir un shell PostgreSQL
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb

db-reset: ## Réinitialiser la base (PERTE DE DONNÉES)
	@echo "ATTENTION: Réinitialisation de la base de données"
	@echo "Cette action va SUPPRIMER toutes les données."
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Arrêt du backend..."; \
		$(DOCKER_COMPOSE) stop backend; \
		echo "Suppression de la base..."; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "DROP DATABASE IF EXISTS acedb;"; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "CREATE DATABASE acedb;"; \
		echo "Redémarrage du backend..."; \
		$(DOCKER_COMPOSE) start backend; \
		sleep 5; \
		echo "Base réinitialisée - Admin créé automatiquement"; \
	else \
		echo "Annulé"; \
	fi

db-backup: ## Backup de la base de données
	@echo "Création d'un backup..."
	@mkdir -p ./backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	$(DOCKER_COMPOSE) exec -T postgres pg_dump -U aceuser acedb > ./backups/acedb_$$TIMESTAMP.sql; \
	echo "Backup créé: ./backups/acedb_$$TIMESTAMP.sql"

db-restore: ## Restaurer un backup (spécifier FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "Erreur: spécifiez FILE=backup.sql"; \
		echo "Exemple: make db-restore FILE=./backups/acedb_20250101_120000.sql"; \
		exit 1; \
	fi
	@echo "ATTENTION: Restauration du backup $(FILE)"
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Arrêt du backend..."; \
		$(DOCKER_COMPOSE) stop backend; \
		echo "Suppression de la base..."; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "DROP DATABASE IF EXISTS acedb;"; \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d postgres -c "CREATE DATABASE acedb;"; \
		echo "Restauration du backup..."; \
		cat $(FILE) | $(DOCKER_COMPOSE) exec -T postgres psql -U aceuser -d acedb; \
		echo "Redémarrage du backend..."; \
		$(DOCKER_COMPOSE) start backend; \
		echo "Backup restauré"; \
	else \
		echo "Annulé"; \
	fi

db-list-tables: ## Lister les tables
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "\dt"

db-count-users: ## Compter les utilisateurs
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total_users FROM users;"

db-count-teams: ## Compter les équipes
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total_teams FROM teams;"

db-list-users: ## Lister tous les utilisateurs (id, email, username, nom)
	@echo "Liste complète des utilisateurs:"
	@echo "================================"
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT id, email, username, \"firstName\", \"lastName\", \"emailVerified\", \"isAdmin\", \"createdAt\" FROM users ORDER BY \"createdAt\" DESC;"

db-list-users-simple: ## Lister les utilisateurs (format simple)
	@echo "Utilisateurs (email | username | nom):"
	@echo "======================================"
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT email, username, CONCAT(\"firstName\", ' ', \"lastName\") as nom FROM users ORDER BY \"createdAt\" DESC;"

db-list-teams: ## Lister toutes les équipes avec membres
	@echo "Liste des équipes:"
	@echo "=================="
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT t.id, t.name, t.\"currentScore\", t.rank, COUNT(u.id) as membres FROM teams t LEFT JOIN users u ON u.\"teamId\" = t.id GROUP BY t.id ORDER BY t.\"currentScore\" DESC;"

db-search-user: ## Rechercher un utilisateur (EMAIL=email@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "Erreur: spécifiez EMAIL=email@example.com"; \
		echo "Exemple: make db-search-user EMAIL=test@example.com"; \
		exit 1; \
	fi
	@echo "Recherche de l'utilisateur: $(EMAIL)"
	@echo "===================================="
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT * FROM users WHERE email ILIKE '%$(EMAIL)%';"

db-user-details: ## Détails d'un utilisateur (EMAIL=email@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "Erreur: spécifiez EMAIL=email@example.com"; \
		echo "Exemple: make db-user-details EMAIL=test@example.com"; \
		exit 1; \
	fi
	@echo "Détails de l'utilisateur: $(EMAIL)"
	@echo "=================================="
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT u.*, t.name as team_name FROM users u LEFT JOIN teams t ON u.\"teamId\" = t.id WHERE u.email = '$(EMAIL)';"

db-stats: ## Statistiques complètes de la base
	@echo "Statistiques de la base de données"
	@echo "==================================="
	@echo ""
	@echo "Utilisateurs:"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total, COUNT(CASE WHEN \"emailVerified\" = true THEN 1 END) as verified, COUNT(CASE WHEN \"isAdmin\" = true THEN 1 END) as admins, COUNT(CASE WHEN \"teamId\" IS NOT NULL THEN 1 END) as in_teams FROM users;" -t
	@echo ""
	@echo "Équipes:"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total_teams, AVG(member_count) as avg_members FROM (SELECT COUNT(u.id) as member_count FROM teams t LEFT JOIN users u ON u.\"teamId\" = t.id GROUP BY t.id) as team_stats;" -t
	@echo ""
	@echo "Inscriptions récentes (dernières 24h):"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as new_users FROM users WHERE \"createdAt\" \u003e NOW() - INTERVAL '24 hours';" -t

db-delete-user: ## Supprimer un utilisateur (EMAIL=email@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "Erreur: spécifiez EMAIL=email@example.com"; \
		echo "Exemple: make db-delete-user EMAIL=test@example.com"; \
		exit 1; \
	fi
	@echo "ATTENTION: Suppression de l'utilisateur $(EMAIL)"
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "DELETE FROM users WHERE email = '$(EMAIL)';"; \
		echo "Utilisateur supprimé"; \
	else \
		echo "Annulé"; \
	fi

db-make-admin: ## Rendre un utilisateur admin (EMAIL=email@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "Erreur: spécifiez EMAIL=email@example.com"; \
		echo "Exemple: make db-make-admin EMAIL=admin@example.com"; \
		exit 1; \
	fi
	@echo "Promotion de $(EMAIL) en admin"
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "UPDATE users SET \"isAdmin\" = true WHERE email = '$(EMAIL)';"
	@echo "Utilisateur promu admin"

db-verify-email: ## Vérifier manuellement un email (EMAIL=email@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "Erreur: spécifiez EMAIL=email@example.com"; \
		echo "Exemple: make db-verify-email EMAIL=test@example.com"; \
		exit 1; \
	fi
	@echo "Vérification manuelle de l'email: $(EMAIL)"
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "UPDATE users SET \"emailVerified\" = true, \"verificationToken\" = NULL, \"verificationTokenExpiry\" = NULL WHERE email = '$(EMAIL)';"
	@echo "Email vérifié"

# --- Nettoyage ---

clean: ## Supprimer conteneurs et volumes (PERTE DE DONNÉES)
	@echo "ATTENTION: Suppression de TOUTES les données"
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(DOCKER_COMPOSE) down -v --remove-orphans; \
		docker volume rm -f ace-website_postgres_data ace-website_redis_data 2>/dev/null || true; \
		echo "Nettoyage terminé"; \
	else \
		echo "Annulé"; \
	fi

clean-logs: ## Nettoyer les logs Docker
	docker container prune -f
	@echo "Logs nettoyés"

fresh: ## Fresh start complet (PERTE TOTALE)
	@echo "ATTENTION: Fresh start - Suppression TOTALE des données"
	@read -p "Confirmer (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Arrêt des conteneurs..."; \
		$(DOCKER_COMPOSE) down -v --remove-orphans 2>/dev/null || true; \
		echo "Suppression des volumes..."; \
		docker volume rm -f ace-website_postgres_data ace-website_redis_data 2>/dev/null || true; \
		sleep 2; \
		echo "Reconstruction sans cache..."; \
		$(DOCKER_COMPOSE) build --no-cache; \
		echo "Démarrage..."; \
		$(DOCKER_COMPOSE) up -d; \
		echo ""; \
		echo "Fresh start terminé"; \
		echo "  Frontend: http://localhost:3000"; \
		echo "  Backend:  http://localhost:5000"; \
		echo ""; \
		echo "Attendez 30 secondes pour l'initialisation"; \
	else \
		echo "Annulé"; \
	fi

# --- Debug & Info ---

status: ## État des services
	@echo "État des services:"
	@$(DOCKER_COMPOSE) ps

test: ## Tester l'accès aux services
	@echo "Test des services..."
	@curl -s http://localhost:5000/health > /dev/null && echo "  Backend: OK" || echo "  Backend: FAIL"
	@curl -s http://localhost:3000 > /dev/null && echo "  Frontend: OK" || echo "  Frontend: FAIL"
	@curl -s http://localhost:8025 > /dev/null && echo "  MailHog: OK" || echo "  MailHog: FAIL"

shell-backend: ## Shell dans le conteneur backend
	$(DOCKER_COMPOSE) exec backend /bin/sh

shell-frontend: ## Shell dans le conteneur frontend
	$(DOCKER_COMPOSE) exec frontend /bin/sh

shell-db: ## Shell PostgreSQL (alias de db-shell)
	$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb

# --- Déploiement & Git ---

pull: ## Pull les derniers changements et rebuild
	@echo "Pull des changements depuis Git..."
	git pull origin deploy
	@echo "Rebuild des services..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "Mise à jour terminée"

push: ## Push les changements vers Git
	git push origin deploy
	@echo "Push terminé"

git-status: ## Afficher le statut Git
	@git status

deploy: pull ## Déployer la dernière version (alias de pull)

# --- Commandes CTFd ---

ctfd-logs: ## Voir les logs CTFd
	@cd ../ACE-ctf-platform && docker compose logs -f --tail=100 ctfd

ctfd-restart: ## Redémarrer CTFd
	@cd ../ACE-ctf-platform && docker compose restart ctfd
	@echo "CTFd redémarré"

ctfd-status: ## État de CTFd
	@cd ../ACE-ctf-platform && docker compose ps

# --- Stats & Monitoring ---

stats: ## Statistiques d'utilisation des conteneurs
	docker stats --no-stream

disk: ## Espace disque utilisé
	@echo "Espace disque Docker:"
	@docker system df
	@echo ""
	@echo "Volumes:"
	@docker volume ls

leaderboard: ## Afficher le classement actuel
	@echo "Classement actuel (Top 10):"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT name, \"currentScore\", rank FROM teams ORDER BY \"currentScore\" DESC LIMIT 10;"

# --- Maintenance ---

update-deps: ## Mettre à jour les dépendances npm
	@echo "Mise à jour des dépendances backend..."
	$(DOCKER_COMPOSE) exec backend npm update
	@echo "Mise à jour des dépendances frontend..."
	$(DOCKER_COMPOSE) exec frontend npm update
	@echo "Dépendances mises à jour"

health-check: ## Vérifier la santé du système
	@echo "Health check complet"
	@echo "==================="
	@echo ""
	@echo "Services Docker:"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "Tests de connexion:"
	@curl -s http://localhost:5000/health > /dev/null && echo "  Backend: OK" || echo "  Backend: FAIL"
	@curl -s http://localhost:3000 > /dev/null && echo "  Frontend: OK" || echo "  Frontend: FAIL"
	@echo ""
	@echo "Base de données:"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total_users FROM users;" -t | xargs -I {} echo "  Utilisateurs: {}"
	@$(DOCKER_COMPOSE) exec postgres psql -U aceuser -d acedb -c "SELECT COUNT(*) as total_teams FROM teams;" -t | xargs -I {} echo "  Équipes: {}"

.DEFAULT_GOAL := help
