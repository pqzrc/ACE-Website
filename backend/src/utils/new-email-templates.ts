/**
 * Templates d'emails pour ACE - L.U.M.E.N. Threat Response
 * Thème: Dark Mode, Neon, Cyberpunk
 */

import fs from 'fs';
import path from 'path';

/**
 * Load HTML email template from file and replace placeholders
 */
const loadTemplate = (templateName: string, replacements: Record<string, string>): string => {
    const templatePath = path.join(__dirname, '../../email-templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Replace all placeholders
    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, replacements[key]);
    });

    return html;
};

export const getTeamCreatedEmailHtml = (
    firstName: string,
    teamName: string,
    inviteCode: string,
    dashboardLink: string
): string => {
    return loadTemplate('team-created-email.html', {
        firstName,
        teamName,
        inviteCode,
        dashboardLink,
    });
};

export const getAdminAddPlayerEmailHtml = (
    firstName: string,
    teamName: string,
    teamLink: string
): string => {
    return loadTemplate('admin-add-player-email.html', {
        firstName,
        teamName,
        teamLink,
    });
};

export const getPasswordResetEmailHtml = (
    firstName: string,
    resetLink: string
): string => {
    return loadTemplate('password-reset-email.html', {
        firstName,
        resetLink,
    });
};
