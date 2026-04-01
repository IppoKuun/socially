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
  en: {
    INVALID_EMAIL: "Invalid email address.",
    INVALID_PASSWORD: "Invalid password.",
    PASSWORD_TOO_SHORT: "Password is too short.",
    PASSWORD_TOO_LONG: "Password is too long.",
    INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
    EMAIL_NOT_VERIFIED: "Your email address has not been verified yet.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
      "An account already exists with this email address.",
    INVALID_TOKEN: "The link is invalid or has expired.",
    RESET_PASSWORD_DISABLED:
      "Password reset is currently unavailable.",
    EMAIL_PASSWORD_DISABLED:
      "Email and password sign-in is currently unavailable.",
    EMAIL_PASSWORD_SIGN_UP_DISABLED:
      "Email and password sign-up is currently unavailable.",
    USER_NOT_FOUND: "User not found.",
    UNAUTHORIZED: "You must be signed in to perform this action.",
    INTERNAL_SERVER_ERROR:
      "An internal error occurred. Please try again.",
    FAILED_TO_GET_USER_INFO: "Unable to retrieve user information.",
    USER_EMAIL_NOT_FOUND: "No email address was found for this account.",
    PROVIDER_NOT_CONFIGURED: "This sign-in provider is not configured.",
    PROVIDER_NOT_SUPPORTED: "This sign-in provider is not supported.",
    OAUTH_LINK_ERROR: "Unable to link this social account.",
  },
  es: {
    INVALID_EMAIL: "Direccion de correo invalida.",
    INVALID_PASSWORD: "Contrasena invalida.",
    PASSWORD_TOO_SHORT: "La contrasena es demasiado corta.",
    PASSWORD_TOO_LONG: "La contrasena es demasiado larga.",
    INVALID_EMAIL_OR_PASSWORD: "Correo o contrasena incorrectos.",
    EMAIL_NOT_VERIFIED: "Tu direccion de correo aun no ha sido verificada.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
      "Ya existe una cuenta con esta direccion de correo.",
    INVALID_TOKEN: "El enlace no es valido o ha expirado.",
    RESET_PASSWORD_DISABLED:
      "El restablecimiento de contrasena no esta disponible por ahora.",
    EMAIL_PASSWORD_DISABLED:
      "El inicio de sesion con correo y contrasena no esta disponible.",
    EMAIL_PASSWORD_SIGN_UP_DISABLED:
      "El registro con correo y contrasena no esta disponible.",
    USER_NOT_FOUND: "Usuario no encontrado.",
    UNAUTHORIZED: "Debes iniciar sesion para realizar esta accion.",
    INTERNAL_SERVER_ERROR:
      "Se produjo un error interno. Intentalo de nuevo.",
    FAILED_TO_GET_USER_INFO:
      "No se pudo recuperar la informacion del usuario.",
    USER_EMAIL_NOT_FOUND:
      "No se encontro una direccion de correo para esta cuenta.",
    PROVIDER_NOT_CONFIGURED:
      "Este proveedor de inicio de sesion no esta configurado.",
    PROVIDER_NOT_SUPPORTED:
      "Este proveedor de inicio de sesion no es compatible.",
    OAUTH_LINK_ERROR: "No se pudo vincular esta cuenta social.",
  },
} as const;
