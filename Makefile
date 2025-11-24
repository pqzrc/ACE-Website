.PHONY: help start stop restart rebuild logs logs-all status clean db-reset db-shell db-backup deploy pull push

# ACE Website - Makefile
# Usage: make <commande>

DOCKER_COMPOSE = docker compose

help: ## Afficher l'aide
	@echo ""
	@echo "ACE Website - Commandes disponibles"
	@echo "===================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# --- Commandes de base ---

start: ## Démarrer tous les services
	@echo "Démarrage du site ACE..."
	$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "Services démarrés:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:5000"
	@echo "  MailHog:   http://localhost:8025"
	@echo ""
	@echo "Voir les logs: make logs"

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
