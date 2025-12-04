import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
import os
from dotenv import load_dotenv

# Charger les variables d'environnement du dossier scripts en priorité
script_dir = Path(__file__).parent
env_path = script_dir / ".env"

if env_path.exists():
    print(f"📄 Chargement de la configuration depuis: {env_path}")
    load_dotenv(env_path)
else:
    print("📄 Chargement de la configuration depuis .env par défaut")
    load_dotenv()

# Configuration SMTP
# MailHog (test local): SMTP_HOST=localhost, SMTP_PORT=1025, pas d'authentification
# Gmail (production): SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, avec authentification
SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = "ACE - Vizyon Dijital"

# Configuration base de données
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "ace_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD")

# URL du dashboard
DASHBOARD_URL = "https://ace.vizyondijital.fr/dashboard"


def load_email_template():
    """Charge le template HTML de l'email"""
    # Le template est dans backend/email-templates, pas dans scripts/email-templates
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent  # Remonter au dossier backend
    template_path = (
        backend_dir / "email-templates" / "profile-update-required-email.html"
    )

    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def get_users_needing_update():
    """
    Récupère les utilisateurs qui ont besoin de mettre à jour leur profil
    (email non vérifié OU numéro de téléphone manquant)
    """
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
    )

    cursor = conn.cursor()

    # Sélectionner les utilisateurs avec email non vérifié OU sans numéro de téléphone
    query = """
        SELECT id, email, "firstName", "lastName", "emailVerified", "phoneNumber"
        FROM users
        WHERE "emailVerified" = false OR "phoneNumber" IS NULL OR "phoneNumber" = ''
        ORDER BY "createdAt" ASC
    """

    cursor.execute(query)
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return users


def send_email(to_email, first_name, last_name):
    """Envoie l'email de mise à jour de profil à un utilisateur"""

    # Charger et personnaliser le template
    html_content = load_email_template()
    html_content = html_content.replace("{{firstName}}", first_name)
    html_content = html_content.replace("{{dashboardLink}}", DASHBOARD_URL)

    # Créer le message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Action Requise - Mise à Jour de Votre Profil ACE"
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email

    # Ajouter le contenu HTML
    html_part = MIMEText(html_content, "html", "utf-8")
    msg.attach(html_part)

    # Envoyer l'email
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            # STARTTLS uniquement pour les serveurs de production (pas MailHog)
            if SMTP_PORT != 1025:
                server.starttls()

            # MailHog ne nécessite pas d'authentification
            if SMTP_USER and SMTP_PASS:
                server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi à {to_email}: {str(e)}")
        return False


def main():
    """Fonction principale"""
    print("🚀 Démarrage de l'envoi des emails de mise à jour de profil...\n")

    # Vérifier la configuration de base
    if not DB_PASS:
        print("❌ Erreur: DB_PASSWORD doit être défini dans .env")
        return

    print(f"📧 Configuration SMTP: {SMTP_HOST}:{SMTP_PORT}")
    if SMTP_USER:
        print(f"   Authentification: {SMTP_USER}")
    else:
        print("   Mode sans authentification (MailHog)")
    print()

    # Récupérer les utilisateurs
    print("📊 Récupération des utilisateurs nécessitant une mise à jour...")
    users = get_users_needing_update()

    if not users:
        print("✅ Aucun utilisateur ne nécessite de mise à jour.")
        return

    print(f"📧 {len(users)} utilisateur(s) trouvé(s)\n")

    # Envoyer les emails
    success_count = 0
    failed_count = 0

    for user_id, email, first_name, last_name, email_verified, phone_number in users:
        status = []
        if not email_verified:
            status.append("Email non vérifié")
        if not phone_number:
            status.append("Téléphone manquant")

        status_str = " | ".join(status)
        print(f"📤 Envoi à {first_name} {last_name} ({email}) - {status_str}")

        if send_email(email, first_name, last_name):
            print(f"   ✅ Envoyé avec succès")
            success_count += 1
        else:
            failed_count += 1

        print()

    # Résumé
    print("=" * 60)
    print(f"📊 RÉSUMÉ")
    print("=" * 60)
    print(f"✅ Emails envoyés avec succès: {success_count}")
    print(f"❌ Échecs: {failed_count}")
    print(f"📧 Total: {len(users)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
