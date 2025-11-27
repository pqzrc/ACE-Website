/**
 * Templates d'emails pour ACE - L.U.M.E.N. Threat Response
 * Thème: Dark Mode, Neon, Cyberpunk
 */

export const getVerificationEmailHtml = (firstName: string, verificationLink: string): string => {
    return `<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Urgence DSI - Vérification Requise</title>
    <!-- Import Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            padding: 40px 20px;
        }
        .main-table {
            background-color: #030315;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            overflow: hidden;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }
        .vizyon-logo {
            max-width: 150px;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .invitation-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .invitation-subtitle {
            font-size: 14px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }
        .header-divider {
            height: 1px;
            background-color: #1e293b;
            width: 80%;
            margin: 0 auto 30px auto;
            border: none;
        }

        /* Hero Section */
        .hero-section {
            text-align: center;
            padding: 10px 0;
        }
        .ace-logo {
            width: 180px;
            height: 180px;
            margin: 0 auto;
            display: block;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.3);
        }
        /* Content */
        .content-cell {
            padding: 0 40px;
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
            color: #cbd5e1;
        }
        strong {
            color: #ffffff;
            font-weight: 600;
        }
        .bullet-list {
            list-style: none;
            padding: 0;
            margin: 25px 0;
        }
        .bullet-list li {
            margin-bottom: 10px;
            color: #cbd5e1;
            font-family: 'Space Grotesk', sans-serif;
        }
        .bullet-prefix {
            color: #ff0055;
            /* Red for urgency */
            font-weight: bold;
            margin-right: 10px;
        }
        .alert-badge {
            background-color: rgba(255, 0, 85, 0.1);
            border: 1px solid #ff0055;
            color: #ff0055;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Button */
        .btn-container {
            margin: 40px 0;
            text-align: center;
        }
        .btn {
            background-color: #D53F8C;
            /* Red for urgency */
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: #d60047;
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
        }

        /* Footer */
        .footer {
            padding: 40px 20px;
            text-align: center;
            border-top: 1px solid #1e293b;
            margin-top: 40px;
        }
        .footer-title {
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            margin: 0 10px;
        }
        .footer-copyright {
            color: #64748b;
            font-size: 12px;
        }

        /* Utilities */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, rgba(15, 14, 74, 0) 0%, rgba(255, 0, 85, 0.5) 50%, rgba(15, 14, 74, 0) 100%);
            margin: 30px 0;
            border: none;
        }

        .alert-badge {
            background-color: rgba(255, 0, 85, 0.1);
            border: 1px solid #ff0055;
            color: #ff0055;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <table class="main-table">
            <!-- Header -->
            <tr>
                <td class="header">
                    <!-- Placeholder for Vizyon Dijital Logo -->
                    <img src="https://ace.vizyondijital.fr/assets/logo/vizyon-dijital-logo.png" alt="Vizyon Dijital"
                        class="vizyon-logo">
                    <div class="invitation-title">URGENCE DSI</div>
                    <div class="invitation-subtitle">11 Décembre • Vérification Requise</div>
                    <hr class="header-divider">
                </td>
            </tr>
            <!-- Hero -->
            <tr>
                <td class="hero-section">
                    <!-- ACE Logo -->
                    <img src="https://s3.us-east-2.amazonaws.com/harrowco.fr/vizyon-dijital/2ACE-LOGO.png" alt="ACE Antilles Cyber Escape"
                        class="ace-logo">
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content-cell">


                    <p style="margin-top: 30px;">Agent <strong>${firstName}</strong>,</p>

                    <p>Une situation d'urgence a été détectée. <strong>L.U.M.E.N.</strong>, l'intelligence artificielle de gestion du campus, a subi une défaillance critique et est devenue hostile. Elle menace de prendre le contrôle total du réseau le <strong>11 Décembre 2025</strong>.</p>

                    <p>La <strong>DSI</strong> constitue une force d'intervention d'urgence pour contrer cette menace IA. Votre profil a été retenu pour rejoindre l'opération de neutralisation.</p>

                    <ul class="bullet-list">
                        <li><span class="bullet-prefix">⚠</span> IA hostile détectée - Niveau critique</li>
                        <li><span class="bullet-prefix">⚠</span> Recrutement d'urgence en cours</li>
                        <li><span class="bullet-prefix">⚠</span> Activation immédiate requise</li>
                    </ul>

                    <p>Activez votre accréditation dès maintenant pour sécuriser votre place dans la force d'intervention contre L.U.M.E.N.</p>

                    <div class="btn-container">
                        <a href="${verificationLink}" class="btn">&gt; CONFIRMER MA MOBILISATION &lt;</a>
                    </div>

                    <p style="font-size: 14px; color: #9ca3af;">Lien d'activation sécurisé :</p>
                    <p style="font-size: 12px; color: #09c7df; word-break: break-all;">${verificationLink}</p>


                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <div class="footer-title">SUIVEZ-NOUS</div>
                    <div class="footer-links">
                        <a href="https://vizyondijital.fr/" class="footer-link">Site Web</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.instagram.com/vizyon.dijital/" class="footer-link">Instagram</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.linkedin.com/company/vizyon-dijital/posts/?feedView=all" class="footer-link">Linkedin</a>
                    </div>
                    <div class="footer-copyright">Vizyon Dijital - Martinique</div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`;
};

export const getWelcomeEmailHtml = (firstName: string, teamName: string, dashboardLink: string): string => {
    return `<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Briefing Mission - L.U.M.E.N. Threat Response</title>
    <!-- Import Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            padding: 40px 20px;
        }
        .main-table {
            background-color: #030315;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            overflow: hidden;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }
        .vizyon-logo {
            max-width: 150px;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .invitation-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .invitation-subtitle {
            font-size: 14px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }
        .header-divider {
            height: 1px;
            background-color: #1e293b;
            width: 80%;
            margin: 0 auto 30px auto;
            border: none;
        }

        /* Hero Section */
        .hero-section {
            text-align: center;
            padding: 10px 0;
        }
        .ace-logo {
            width: 180px;
            height: 180px;
            margin: 0 auto;
            display: block;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.3);
        }
        /* Content */
        .content-cell {
            padding: 0 40px;
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
            color: #cbd5e1;
        }
        strong {
            color: #ffffff;
            font-weight: 600;
        }
        .bullet-list {
            list-style: none;
            padding: 0;
            margin: 25px 0;
        }
        .bullet-list li {
            margin-bottom: 10px;
            color: #cbd5e1;
            font-family: 'Space Grotesk', sans-serif;
        }
        .bullet-prefix {
            color: #ec4899;
            /* Pink */
            font-weight: bold;
            margin-right: 10px;
        }

        /* Mission Briefing Box */
        .briefing-box {
            background-color: #050511;
            border: 1px solid #09c7df;
            border-left: 4px solid #09c7df;
            border-radius: 4px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
        }

        .briefing-title {
            color: #09c7df;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 10px;
            font-size: 14px;
            letter-spacing: 1px;
        }

        .briefing-list {
            margin: 0;
            padding-left: 20px;
            color: #f6f2f9;
            font-size: 14px;
        }

        .briefing-list li {
            margin-bottom: 8px;
        }

        /* Button */
        .btn-container {
            margin: 40px 0;
            text-align: center;
        }
        .btn {
            background-color: #d53f8c;
            /* Pink/Magenta */
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: #b83280;
            box-shadow: 0 0 20px rgba(213, 63, 140, 0.4);
        }

        /* Footer */
        .footer {
            padding: 40px 20px;
            text-align: center;
            border-top: 1px solid #1e293b;
            margin-top: 40px;
        }
        .footer-title {
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            margin: 0 10px;
        }
        .footer-copyright {
            color: #64748b;
            font-size: 12px;
        }

        /* Utilities */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, rgba(15, 14, 74, 0) 0%, rgba(9, 199, 223, 0.5) 50%, rgba(15, 14, 74, 0) 100%);
            margin: 30px 0;
            border: none;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <table class="main-table">
            <!-- Header -->
            <tr>
                <td class="header">
                    <!-- Placeholder for Vizyon Dijital Logo -->
                    <img src="https://ace.vizyondijital.fr/assets/logo/vizyon-dijital-logo.png" alt="Vizyon Dijital"
                        class="vizyon-logo">
                    <div class="invitation-title">ACCRÉDITATION</div>
                    <div class="invitation-subtitle">11 Décembre • IUT de Martinique</div>
                    <hr class="header-divider">
                </td>
            </tr>
            <!-- Hero -->
            <tr>
                <td class="hero-section">
                    <!-- ACE Logo -->
                    <img src="https://s3.us-east-2.amazonaws.com/harrowco.fr/vizyon-dijital/2ACE-LOGO.png" alt="ACE Antilles Cyber Escape"
                        class="ace-logo">
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content-cell">
                    <p style="margin-top: 30px;">Bienvenue dans l'équipe, Agent <strong>${firstName}</strong>.</p>

                    <p>Votre <strong>accréditation DSI</strong> est validée. Vous faites officiellement partie de la force d'intervention d'urgence pour contrer <strong>L.U.M.E.N.</strong>, l'IA corrompue qui menace le campus.</p>

                    <ul class="bullet-list">
                        <li><span class="bullet-prefix">&gt;_</span> L.U.M.E.N. a verrouillé l'administration</li>
                        <li><span class="bullet-prefix">&gt;_</span> Elle exploite des failles pour prendre le contrôle du réseau</li>
                        <li><span class="bullet-prefix">&gt;_</span> Elle menace de publier des données sensibles</li>
                    </ul>

                    <p><strong>Votre mission :</strong> Analyser les attaques de l'IA, comprendre les failles qu'elle exploite et contrer ses offensives numériques avant qu'il ne soit trop tard. Vous êtes la dernière ligne de défense face à une intelligence artificielle devenue hostile.</p>

                    <p>Le QG Numérique sera accessible le 11 Décembre. En attendant, affûtez vos compétences et préparez-vous pour cette mission critique.</p>

                    <div class="btn-container">
                        <a href="${dashboardLink}" class="btn">&gt; ACCÉDER AU QG &lt;</a>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <div class="footer-title">SUIVEZ-NOUS</div>
                    <div class="footer-links">
                        <a href="https://vizyondijital.fr/" class="footer-link">Site Web</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.instagram.com/vizyon.dijital/" class="footer-link">Instagram</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.linkedin.com/company/vizyon-dijital/posts/?feedView=all" class="footer-link">Linkedin</a>
                    </div>
                    <div class="footer-copyright">Vizyon Dijital - Martinique</div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`;
};

export const getTeamJoinEmailHtml = (firstName: string, teamName: string, teamLink: string): string => {
    return `<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Affectation Équipe - L.U.M.E.N. Threat Response</title>
    <!-- Import Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #ffffff;
            /* White Background - Change to #000000 for black */
            padding: 40px 20px;
        }
        .main-table {
            background-color: #030315;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            overflow: hidden;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }
        .vizyon-logo {
            max-width: 150px;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .invitation-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .invitation-subtitle {
            font-size: 14px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }
        .header-divider {
            height: 1px;
            background-color: #1e293b;
            width: 80%;
            margin: 0 auto 30px auto;
            border: none;
        }

        /* Hero Section */
        .hero-section {
            text-align: center;
            padding: 10px 0;
        }
        .ace-logo {
            width: 180px;
            height: 180px;
            margin: 0 auto;
            display: block;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.3);
        }
        /* Content */
        .content-cell {
            padding: 0 40px;
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
            color: #cbd5e1;
        }
        strong {
            color: #ffffff;
            font-weight: 600;
        }
        .bullet-list {
            list-style: none;
            padding: 0;
            margin: 25px 0;
        }
        .bullet-list li {
            margin-bottom: 10px;
            color: #cbd5e1;
            font-family: 'Space Grotesk', sans-serif;
        }
        .bullet-prefix {
            color: #D53F8C;
            /* Pink for team */
            font-weight: bold;
            margin-right: 10px;
        }

        /* Team Badge */
        .team-badge {
            background-color: rgba(252, 16, 202, 0.1);
            border: 2px solid #D53F8C;
            border-radius: 12px;
            padding: 25px;
            margin: 30px auto;
            display: block;
            text-align: center;
            max-width: 300px;
        }
        .team-label {
            color: #D53F8C;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
            font-weight: 700;
        }
        .team-name {
            color: #ffffff;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
        }

        /* Button */
        .btn-container {
            margin: 40px 0;
            text-align: center;
        }
        .btn {
            background-color: #D53F8C;
            /* Pink for team */
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: #d90db0;
            box-shadow: 0 0 20px rgba(252, 16, 202, 0.4);
        }

        /* Footer */
        .footer {
            padding: 40px 20px;
            text-align: center;
            border-top: 1px solid #1e293b;
            margin-top: 40px;
        }
        .footer-title {
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            margin: 0 10px;
        }
        .footer-copyright {
            color: #64748b;
            font-size: 12px;
        }

        /* Utilities */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, rgba(15, 14, 74, 0) 0%, rgba(252, 16, 202, 0.5) 50%, rgba(15, 14, 74, 0) 100%);
            margin: 30px 0;
            border: none;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <table class="main-table">
            <!-- Header -->
            <tr>
                <td class="header">
                    <!-- Placeholder for Vizyon Dijital Logo -->
                    <img src="https://ace.vizyondijital.fr/assets/logo/vizyon-dijital-logo.png" alt="Vizyon Dijital"
                        class="vizyon-logo">
                    <div class="invitation-title">AFFECTATION</div>
                    <div class="invitation-subtitle">11 Décembre • Équipe Confirmée</div>
                    <hr class="header-divider">
                </td>
            </tr>
            <!-- Hero -->
            <tr>
                <td class="hero-section">
                    <!-- ACE Logo -->
                    <img src="https://s3.us-east-2.amazonaws.com/harrowco.fr/vizyon-dijital/2ACE-LOGO.png" alt="ACE Antilles Cyber Escape"
                        class="ace-logo">
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content-cell">
                    <p style="margin-top: 30px;">Agent <strong>${firstName}</strong>,</p>

                    <p>Votre demande de transfert a été <strong>approuvée</strong>. Vous avez été affecté à une nouvelle unité d'intervention d'urgence pour contrer <strong>L.U.M.E.N.</strong> le 11 Décembre.</p>

                    <div class="team-badge">
                        <div class="team-label">UNITÉ D'INTERVENTION</div>
                        <div class="team-name">${teamName}</div>
                    </div>

                    <ul class="bullet-list">
                        <li><span class="bullet-prefix">&gt;_</span> Prenez contact avec vos coéquipiers</li>
                        <li><span class="bullet-prefix">&gt;_</span> Établissez votre stratégie contre l'IA hostile</li>
                        <li><span class="bullet-prefix">&gt;_</span> Préparez-vous à contrer ses attaques</li>
                    </ul>

                    <p>L.U.M.E.N., l'IA corrompue, menace de prendre le contrôle total du campus. Votre unité est appelée en urgence pour stopper ses offensives avant qu'il ne soit trop tard. La cohésion d'équipe sera votre meilleure arme.</p>

                    <div class="btn-container">
                        <a href="${teamLink}" class="btn">&gt; REJOINDRE MON UNITÉ &lt;</a>
                    </div>

                    <p style="font-size: 13px; margin-bottom: 0; color: #D53F8C;">
                        Vous êtes la dernière ligne de défense.<br>
                        Coordonnez-vous. Agissez vite.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <div class="footer-title">SUIVEZ-NOUS</div>
                    <div class="footer-links">
                        <a href="https://vizyondijital.fr/" class="footer-link">Site Web</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.instagram.com/vizyon.dijital/" class="footer-link">Instagram</a>
                        <span style="color: #64748b;">|</span>
                        <a href="https://www.linkedin.com/company/vizyon-dijital/posts/?feedView=all" class="footer-link">Linkedin</a>
                    </div>
                    <div class="footer-copyright">Vizyon Dijital - Martinique</div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`;
};