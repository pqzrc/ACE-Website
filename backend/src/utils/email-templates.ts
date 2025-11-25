/**
 * Templates d'emails pour ACE - Opération Data-Campus
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #050511; /* Fond principal */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9; /* Texte clair */
            -webkit-font-smoothing: antialiased;
        }
        
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #050511;
            padding-bottom: 40px;
        }

        .main-table {
            background-color: #050511;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        /* Card */
        .card {
            background-color: #0f0e4a; /* Fond secondaire */
            border-radius: 16px;
            border: 1px solid rgba(255, 0, 85, 0.3); /* Accent Rouge Urgence */
            padding: 40px;
            margin: 0 20px;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.1); /* Glow Rouge */
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        /* Typography */
        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(255, 0, 85, 0.5); /* Glow Rouge */
        }

        .subtitle {
            font-family: 'Space Grotesk', sans-serif;
            color: #ff0055; /* Error/Urgent color */
            font-size: 14px;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 25px;
            font-weight: 700;
        }

        .accent-text {
            color: #fc10ca; /* Accent Rose */
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 25px 0;
            color: #f6f2f9;
        }

        /* Button */
        .btn-container {
            margin: 35px 0;
        }

        .btn {
            background-color: #ff0055; /* Rouge Urgence */
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
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.4); /* Glow bouton */
            border: 1px solid #ff0055;
            transition: all 0.3s ease;
        }

        .btn:hover {
            background-color: #d60047;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.6);
        }

        /* Footer */
        .footer {
            padding: 30px 20px;
            text-align: center;
        }

        .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
        }

        .footer-link {
            color: #09c7df; /* Accent Bleu */
            text-decoration: none;
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
                    <div class="logo-container">
                        <img src="https://ace.vizyondijital.fr/assets/logo/ACE-LOGO(2).svg" alt="ACE Logo" width="80" height="80" style="display: block; margin: 0 auto;">
                    </div>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td>
                    <div class="card">
                        <div class="alert-badge">ORDRE DE MOBILISATION : PRIORITÉ 1</div>
                        <h1>Opération <span style="color: #09c7df;">Data-Campus</span></h1>
                        <div class="subtitle">Recrutement DSI - Session 2025</div>
                        
                        <p>Agent <strong>${firstName}</strong>,</p>
                        
                        <p>Nos services de renseignement ont intercepté des communications du groupe <strong>"Unitas"</strong>. Une cyber-attaque massive est planifiée pour le <strong>11 Décembre 2025</strong>.</p>

                        <p>La DSI constitue une force d'intervention d'élite pour contrer cette menace. Votre profil a été retenu pour rejoindre l'opération.</p>

                        <p>Activez votre accréditation dès maintenant pour sécuriser votre place dans les rangs.</p>

                        <div class="btn-container">
                            <a href="${verificationLink}" class="btn">Confirmer ma Mobilisation</a>
                        </div>

                        <p style="font-size: 14px; color: #9ca3af;">Lien d'activation sécurisé :</p>
                        <p style="font-size: 12px; color: #09c7df; word-break: break-all;">${verificationLink}</p>

                        <hr class="divider">

                        <p style="font-size: 13px; margin-bottom: 0; color: #ff0055;">
                            ⚠️ Préparez-vous. Le compte à rebours a commencé.<br>
                            Cible : 11 Décembre 2025.
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p class="footer-text">
                        &copy; 2025 Vizyon Dijital<br>
                        Opération Data-Campus.<br>
                        <a href="https://ace.vizyondijital.fr" class="footer-link">ace.vizyondijital.fr</a>
                    </p>
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
    <title>Briefing Mission - Opération Data-Campus</title>
    <!-- Import Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #050511; /* Fond principal */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9; /* Texte clair */
            -webkit-font-smoothing: antialiased;
        }
        
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #050511;
            padding-bottom: 40px;
        }

        .main-table {
            background-color: #050511;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        /* Card */
        .card {
            background-color: #0f0e4a; /* Fond secondaire */
            border-radius: 16px;
            border: 1px solid rgba(9, 199, 223, 0.3); /* Accent Bleu */
            padding: 40px;
            margin: 0 20px;
            box-shadow: 0 0 30px rgba(9, 199, 223, 0.1); /* Glow Bleu */
            text-align: center;
        }

        /* Typography */
        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(9, 199, 223, 0.5); /* Glow Bleu */
        }

        .accent-text {
            color: #09c7df; /* Accent Bleu */
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 25px 0;
            color: #f6f2f9;
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
            margin: 35px 0;
        }

        .btn {
            background-color: #09c7df; /* Accent Bleu */
            color: #050511 !important; /* Texte sombre pour contraste sur bleu */
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 20px rgba(9, 199, 223, 0.4); /* Glow bouton */
            border: 1px solid #09c7df;
            transition: all 0.3s ease;
        }

        .btn:hover {
            background-color: #07aabf;
            box-shadow: 0 0 30px rgba(9, 199, 223, 0.6);
        }

        /* Footer */
        .footer {
            padding: 30px 20px;
            text-align: center;
        }

        .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
        }

        .footer-link {
            color: #fc10ca; /* Accent Rose */
            text-decoration: none;
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
                    <div class="logo-container">
                        <img src="https://ace.vizyondijital.fr/assets/logo/ACE-LOGO(2).svg" alt="ACE Logo" width="80" height="80" style="display: block; margin: 0 auto;">
                    </div>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td>
                    <div class="card">
                        <h1>Accréditation <span class="accent-text">Validée</span></h1>
                        
                        <p>Bienvenue dans l'équipe, Agent <strong>${firstName}</strong>.</p>
                        
                        <p>Votre accréditation DSI est validée. Vous faites officiellement partie de la force d'intervention pour l'Opération Data-Campus.</p>

                        <div class="briefing-box">
                            <div class="briefing-title">ORDRE DE MISSION : 11 DÉCEMBRE 2025</div>
                            <ul class="briefing-list">
                                <li>Restez en alerte jusqu'au jour J.</li>
                                <li>Préparez-vous à identifier 10 vulnérabilités critiques.</li>
                                <li>Coordonnez-vous avec votre équipe <strong>${teamName}</strong>.</li>
                            </ul>
                        </div>

                        <p>Le QG Numérique sera accessible le jour de l'opération. En attendant, affûtez vos compétences.</p>

                        <div class="btn-container">
                            <a href="${dashboardLink}" class="btn">Accéder au QG (Standby)</a>
                        </div>

                        <hr class="divider">

                        <p style="font-size: 13px; margin-bottom: 0;">
                            L'ennemi est invisible, mais la menace est réelle.<br>
                            Soyez prêts.
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p class="footer-text">
                        &copy; 2025 Vizyon Dijital<br>
                        Opération Data-Campus.<br>
                        <a href="https://ace.vizyondijital.fr" class="footer-link">ace.vizyondijital.fr</a>
                    </p>
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
    <title>Affectation Équipe - Opération Data-Campus</title>
    <!-- Import Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        /* Reset & Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #050511; /* Fond principal */
            font-family: 'Inter', sans-serif;
            color: #f6f2f9; /* Texte clair */
            -webkit-font-smoothing: antialiased;
        }
        
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #050511;
            padding-bottom: 40px;
        }

        .main-table {
            background-color: #050511;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
        }

        /* Header */
        .header {
            padding: 40px 0 20px 0;
            text-align: center;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        /* Card */
        .card {
            background-color: #0f0e4a; /* Fond secondaire */
            border-radius: 16px;
            border: 1px solid rgba(252, 16, 202, 0.3); /* Accent Rose */
            padding: 40px;
            margin: 0 20px;
            box-shadow: 0 0 30px rgba(252, 16, 202, 0.1); /* Glow Rose */
            text-align: center;
        }

        /* Typography */
        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(252, 16, 202, 0.5); /* Glow Rose */
        }

        .accent-text {
            color: #fc10ca; /* Accent Rose */
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 25px 0;
            color: #f6f2f9;
        }

        /* Team Badge */
        .team-badge {
            background-color: rgba(252, 16, 202, 0.1);
            border: 1px solid #fc10ca;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: inline-block;
            min-width: 200px;
        }

        .team-label {
            color: #fc10ca;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5px;
            font-weight: 700;
        }

        .team-name {
            color: #ffffff;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
        }

        /* Button */
        .btn-container {
            margin: 35px 0;
        }

        .btn {
            background-color: #fc10ca; /* Accent Rose */
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
            box-shadow: 0 0 20px rgba(252, 16, 202, 0.4); /* Glow bouton */
            border: 1px solid #fc10ca;
            transition: all 0.3s ease;
        }

        .btn:hover {
            background-color: #d90db0;
            box-shadow: 0 0 30px rgba(252, 16, 202, 0.6);
        }

        /* Footer */
        .footer {
            padding: 30px 20px;
            text-align: center;
        }

        .footer-text {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.5;
        }

        .footer-link {
            color: #09c7df; /* Accent Bleu */
            text-decoration: none;
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
                    <div class="logo-container">
                        <img src="https://ace.vizyondijital.fr/assets/logo/ACE-LOGO(2).svg" alt="ACE Logo" width="80" height="80" style="display: block; margin: 0 auto;">
                    </div>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td>
                    <div class="card">
                        <h1>Affectation <span class="accent-text">Confirmée</span></h1>
                        
                        <p>Agent <strong>${firstName}</strong>,</p>
                        
                        <p>Votre demande de transfert a été approuvée. Vous avez été affecté à une nouvelle unité d'intervention pour l'opération du 11 Décembre.</p>

                        <div class="team-badge">
                            <div class="team-label">UNITÉ D'INTERVENTION</div>
                            <div class="team-name">${teamName}</div>
                        </div>

                        <p>Prenez contact avec vos coéquipiers dès maintenant pour établir votre stratégie avant le jour J.</p>

                        <div class="btn-container">
                            <a href="${teamLink}" class="btn">Rejoindre mon Unité</a>
                        </div>

                        <hr class="divider">

                        <p style="font-size: 13px; margin-bottom: 0;">
                            La cohésion d'équipe sera déterminante.<br>
                            Préparez-vous ensemble.
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    <p class="footer-text">
                        &copy; 2025 Vizyon Dijital<br>
                        Opération Data-Campus.<br>
                        <a href="https://ace.vizyondijital.fr" class="footer-link">ace.vizyondijital.fr</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
};
