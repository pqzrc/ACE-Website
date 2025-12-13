import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
import os
from dotenv import load_dotenv

script_dir = Path(__file__).parent
env_path = script_dir / ".env"

if env_path.exists():
    print(f"Loading config from: {env_path}")
    load_dotenv(env_path)
else:
    load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = "ACE - Vizyon Dijital"

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "ace_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD")

DASHBOARD_URL = "https://ace.vizyondijital.fr/dashboard"


def load_email_template():
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    template_path = backend_dir / "email-templates" / "profile-update-required-email.html"
    
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def get_users_needing_update():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
    )
    cursor = conn.cursor()
    
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
    html_content = load_email_template()
    html_content = html_content.replace("{{firstName}}", first_name)
    html_content = html_content.replace("{{dashboardLink}}", DASHBOARD_URL)
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Action Requise - Mise a Jour de Votre Profil ACE"
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    
    html_part = MIMEText(html_content, "html", "utf-8")
    msg.attach(html_part)
    
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_PORT != 1025:
                server.starttls()
            if SMTP_USER and SMTP_PASS:
                server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending to {to_email}: {str(e)}")
        return False


def main():
    print("Starting profile update email campaign...\n")
    
    if not DB_PASS:
        print("Error: DB_PASSWORD must be set in .env")
        return
    
    print(f"SMTP Config: {SMTP_HOST}:{SMTP_PORT}")
    if SMTP_USER:
        print(f"Auth: {SMTP_USER}")
    else:
        print("No auth (MailHog mode)")
    print()
    
    print("Fetching users needing profile update...")
    users = get_users_needing_update()
    
    if not users:
        print("No users need profile update.")
        return
    
    print(f"Found {len(users)} user(s)\n")
    
    success_count = 0
    failed_count = 0
    
    for user_id, email, first_name, last_name, email_verified, phone_number in users:
        status = []
        if not email_verified:
            status.append("Email not verified")
        if not phone_number:
            status.append("Phone missing")
        
        status_str = " | ".join(status)
        print(f"Sending to {first_name} {last_name} ({email}) - {status_str}")
        
        if send_email(email, first_name, last_name):
            print("  Sent successfully")
            success_count += 1
        else:
            failed_count += 1
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Success: {success_count}")
    print(f"Failed: {failed_count}")
    print(f"Total: {len(users)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
