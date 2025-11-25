# ACE Website - Production Environment
# ============================================
# IMPORTANT: Remplacez les valeurs CHANGEME avant le déploiement

# Environment Mode
NODE_ENV=production

# Frontend API URL (utilisé par Next.js côté client)
NEXT_PUBLIC_API_URL=https://api.vizyondijital.fr/api


# CTFd URL (utilisé pour le SSO)
NEXT_PUBLIC_CTFD_URL=https://ctfd.vizyondijital.fr

# Database
# Database
DATABASE_URL=postgresql://aceuser:acepass@postgres:5432/acedb

# Redis
REDIS_URL=redis://redis:6379

# JWT Authentication (DOIT être identique à CTFd pour SSO)
JWT_SECRET=59816f7afaa130727285419dbf6f3f6744d0a82c45aa08494e3e6efca34e049d
JWT_EXPIRES_IN=7d

# Email - Production SMTP
# Option 1: Gmail
#SMTP_HOST=smtp.gmail.com
#SMTP_PORT=587
#SMTP_USER=CHANGEME_your-email@gmail.com
#SMTP_PASS=CHANGEME_your-app-password
#SMTP_FROM=ACE 2025 <noreply@vizyondijital.fr>

# Option 2: SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=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
SMTP_FROM=ACE 2025 <noreply@vizyondijital.fr>




# Option 2: SendGrid
#SMTP_HOST=smtp-relay.brevo.com
#SMTP_PORT=587
#SMTP_USER=apikey
#SMTP_PASS=xsmtpsib-372d3f9451dccb8b99d8a0567139183614f84b79088af75e26b0145c4debb3c9-4dH7ay6isQN1Q0Hn
#SMTP_FROM=ACE 2025 <noreply@vizyondijital.fr>

# Frontend URL (Production)
#FRONTEND_URL=https://ace.vizyondijital.fr
FRONTEND_URL=https://ace.vizyondijital.fr

# Admin Configuration
ADMIN_EMAIL=admin@vizyondijital.fr
ADMIN_PASSWORD=QLRWKT55


# CTFd Webhook Configuration
CTFD_WEBHOOK_URL=http://ace-ctf-platform-ctfd-1:8000/api/registration-sync/webhook
WEBHOOK_SECRET=e50c1f1e95cc341a8f0d7108c36fbcb2



# hCaptcha Configuration (Production - obtenez vos clés sur hcaptcha.com)
HCAPTCHA_SECRET=ES_674ff485e31a4703a4da212e2a3eb321
NEXT_PUBLIC_HCAPTCHA_SITEKEY=8e564f50-c330-4f74-a7c0-330cde02c3ea


JWT_SECRET=7c0e4303f65bab15ff6f4561eff2125de50bf413a950ffa6ac4a6428ef9b7c91
WEBHOOK_SECRET=3d68b4b6206b4812acfd8cd774c88201
DB_PASSWORD=txb/vwdcbkgeZiNvshFl82b6Yf8K6e6J
ADMIN_PASSWORD=KQEZTqOxb9wx/OAxxEJEw2VkZbR9vOHg