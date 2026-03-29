export const authTranslations = {
  fr: {
    INVALID_EMAIL: "Adresse email invalide.",
    INVALID_PASSWORD: "Mot de passe invalide.",
    PASSWORD_TOO_SHORT: "Le mot de passe est trop court.",
    PASSWORD_TOO_LONG: "Le mot de passe est trop long.",
    INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
    EMAIL_NOT_VERIFIED: "Votre adresse email n'a pas encore ete verifiee.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
      "Un compte existe deja avec cette adresse email.",
    INVALID_TOKEN: "Le lien est invalide ou expire.",
    RESET_PASSWORD_DISABLED:
      "La reinitialisation du mot de passe est indisponible pour le moment.",
    EMAIL_PASSWORD_DISABLED:
      "La connexion par email et mot de passe est indisponible.",
    EMAIL_PASSWORD_SIGN_UP_DISABLED:
      "L'inscription par email et mot de passe est indisponible.",
    USER_NOT_FOUND: "Utilisateur introuvable.",
    UNAUTHORIZED: "Vous devez etre connecte pour effectuer cette action.",
    INTERNAL_SERVER_ERROR:
      "Une erreur interne est survenue. Veuillez reessayer.",
    FAILED_TO_GET_USER_INFO:
      "Impossible de recuperer les informations utilisateur.",
    USER_EMAIL_NOT_FOUND:
      "Aucune adresse email n'a ete trouvee pour ce compte.",
    PROVIDER_NOT_CONFIGURED: "Ce fournisseur de connexion n'est pas configure.",
    PROVIDER_NOT_SUPPORTED:
      "Ce fournisseur de connexion n'est pas pris en charge.",
    OAUTH_LINK_ERROR: "Impossible de lier ce compte social.",
  },
} as const;
