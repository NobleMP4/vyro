import { ApiError, ClientErrorCode } from './api-error';

/**
 * User-facing translations of API error codes. Technical details
 * (stack traces, SQL, raw status text) are never shown to the user.
 */
const MESSAGES_BY_CODE: Record<string, string> = {
  [ClientErrorCode.NETWORK_ERROR]:
    'Impossible de joindre le serveur. Vérifie ta connexion internet.',
  [ClientErrorCode.TIMEOUT]: 'Le serveur met trop de temps à répondre. Réessaie dans un instant.',
  [ClientErrorCode.INVALID_RESPONSE]: 'Réponse inattendue du serveur.',
  VALIDATION_FAILED: 'Certaines informations sont invalides. Vérifie le formulaire.',
  UNAUTHORIZED: 'Ta session a expiré. Reconnecte-toi.',
  FORBIDDEN: 'Tu n’as pas accès à cette ressource.',
  NOT_FOUND: 'Élément introuvable.',
  ROUTE_NOT_FOUND: 'Cette fonctionnalité n’est pas encore disponible.',
  CONFLICT: 'Cet élément existe déjà.',
  TOO_MANY_REQUESTS: 'Trop de tentatives. Patiente un peu avant de réessayer.',
  SERVICE_UNAVAILABLE: 'Le service est momentanément indisponible.',
  INTERNAL_ERROR: 'Une erreur inattendue est survenue. Réessaie plus tard.',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  EMAIL_ALREADY_USED: 'Un compte existe déjà avec cet email.',
  TOKEN_EXPIRED: 'Ta session a expiré. Reconnecte-toi.',
  INVALID_REFRESH_TOKEN: 'Ta session a expiré. Reconnecte-toi.',
  INVALID_RESET_TOKEN:
    'Ce lien de réinitialisation est invalide ou a expiré. Fais une nouvelle demande.',
  INVALID_PASSWORD: 'Mot de passe actuel incorrect.',
};

const FALLBACK = 'Une erreur est survenue. Réessaie.';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (MESSAGES_BY_CODE[error.code]) return MESSAGES_BY_CODE[error.code];
    if (error.status >= 500) return MESSAGES_BY_CODE.INTERNAL_ERROR;
    return FALLBACK;
  }
  return FALLBACK;
}
