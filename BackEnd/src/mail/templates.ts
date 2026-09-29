import type { MailMessage } from './mail.service';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function passwordResetEmail(params: {
  to: string;
  displayName: string;
  resetUrl: string;
  ttlMinutes: number;
}): MailMessage {
  const { to, displayName, resetUrl, ttlMinutes } = params;
  const text = [
    `Bonjour ${displayName},`,
    '',
    'Tu as demandé à réinitialiser ton mot de passe VYRO.',
    `Ouvre ce lien pour en choisir un nouveau (valable ${ttlMinutes} minutes) :`,
    resetUrl,
    '',
    'Si tu n’es pas à l’origine de cette demande, ignore cet email : ton mot de passe reste inchangé.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="fr"><body style="font-family:system-ui,sans-serif;color:#0a0c10;line-height:1.5">
  <p>Bonjour ${escapeHtml(displayName)},</p>
  <p>Tu as demandé à réinitialiser ton mot de passe VYRO.</p>
  <p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#005afc;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Choisir un nouveau mot de passe</a></p>
  <p style="color:#5b6270;font-size:14px">Ce lien est valable ${ttlMinutes} minutes. Si tu n’es pas à l’origine de cette demande, ignore cet email.</p>
</body></html>`;

  return { to, subject: 'Réinitialisation de ton mot de passe VYRO', text, html };
}
