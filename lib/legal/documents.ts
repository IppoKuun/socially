import type { AppLocale } from "@/lib/seo";

export const LEGAL_DOCUMENT_SLUGS = [
  "mentions-legales",
  "privacy",
  "cookies",
  "terms",
  "community-guidelines",
  "moderation",
] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENT_SLUGS)[number];

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const contactEmail = "hippolyte.devweb@gmail.com";
const publicUrl = "https://socially.info";

const documents: Record<AppLocale, LegalDocument[]> = {
  fr: [
    {
      slug: "mentions-legales",
      title: "Mentions legales",
      description:
        "Informations sur l'edition non professionnelle de Socially, le contact et l'hebergement du service.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Edition du service",
          paragraphs: [
            "Socially est un projet personnel d'apprentissage edite a titre non professionnel. Le service est exploite sans societe, sans publicite, sans paiement reel et sans monetisation effective dans cette version beta.",
            "Conformement a l'article 6, III, 2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'economie numerique, l'editeur non professionnel a choisi de preserver son anonymat public. Les elements d'identification personnelle de l'editeur ont ete communiques a l'hebergeur du service.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Pour toute demande relative au service, aux donnees personnelles, a la moderation ou a un signalement, vous pouvez contacter l'editeur a l'adresse suivante : ${contactEmail}.`,
          ],
        },
        {
          title: "Hebergement",
          items: [
            "Hebergeur principal : Vercel Inc.",
            "Adresse indiquee publiquement : 340 S Lemon Ave #4133, Walnut, CA 91789, United States.",
            "Site web : https://vercel.com",
            "Contact support : support@vercel.com",
          ],
        },
        {
          title: "Nom de domaine",
          paragraphs: [
            `Le service est destine a etre accessible a l'adresse ${publicUrl}. Le nom de domaine est enregistre via IONOS.`,
          ],
        },
        {
          title: "Propriete intellectuelle",
          paragraphs: [
            "L'interface, le nom Socially, les choix de presentation et les contenus techniques du projet appartiennent a leur editeur, sauf mentions contraires. Les contenus publies par les utilisateurs restent sous leur responsabilite.",
          ],
        },
      ],
    },
    {
      slug: "privacy",
      title: "Politique de confidentialite",
      description:
        "Synthese des donnees traitees par Socially, des finalites, des droits utilisateurs et des sous-traitants.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Responsable du traitement",
          paragraphs: [
            `Socially est edite a titre non professionnel. Pour toute demande RGPD, contactez ${contactEmail}.`,
          ],
        },
        {
          title: "Donnees traitees",
          items: [
            "Donnees de compte : nom, email, mot de passe gere par le systeme d'authentification, fournisseur OAuth le cas echeant.",
            "Donnees de profil : nom public, username, avatar, banniere, bio, langue, theme, categories et informations d'onboarding.",
            "Activite sociale : posts, images de posts, commentaires, likes, abonnements, blocages, notifications, signalements et historique de recherche.",
            "Messagerie privee : conversations 1-to-1, messages, etats lu/non lu et participants.",
            "Donnees techniques : sessions, adresse IP et user-agent lorsque conserves par l'authentification, journaux d'erreur, rate limiting et securite.",
            "Donnees d'acquisition first-party : consentement cookies, UTM, domaine referent, langue, compteur de visites avant inscription.",
          ],
        },
        {
          title: "Finalites et bases legales",
          items: [
            "Fournir le reseau social : execution des conditions d'utilisation.",
            "Authentifier les utilisateurs et proteger les comptes : execution du service et interet legitime de securite.",
            "Afficher les profils, posts, commentaires et interactions publiques : execution du service.",
            "Moderation, prevention des abus, signalements et securite : interet legitime et obligations legales applicables.",
            "Cookies et mesure d'acquisition non essentiels : consentement.",
            "Support, demandes RGPD et litiges : obligation legale ou interet legitime selon la demande.",
          ],
        },
        {
          title: "Export et suppression",
          paragraphs: [
            "L'espace donnees permet de telecharger un export produit des principales donnees de compte et d'activite. Cet export n'est pas presente comme une copie exhaustive de toutes les donnees RGPD.",
            "Une demande d'acces plus complete, de rectification, d'opposition, de limitation ou d'effacement peut etre envoyee par email.",
            "La suppression de compte est realisee en deux temps : le profil public est masque rapidement, puis les donnees applicatives sont anonymisees ou supprimees apres un delai de 30 jours, sauf conservation minimale necessaire a la securite, a la moderation ou a une obligation legale.",
          ],
        },
        {
          title: "Sous-traitants et services externes",
          items: [
            "Vercel : hebergement, deploiement et infrastructure web.",
            "IONOS : enregistrement du nom de domaine.",
            "Cloudinary : stockage et diffusion des images de profil, bannieres et images de posts.",
            "OpenAI : assistance a la moderation automatique des textes et images soumis.",
            "Resend : envoi d'emails transactionnels.",
            "Sentry : suivi des erreurs applicatives et diagnostic technique.",
            "Pusher : notifications et messagerie temps reel.",
            "Upstash Redis : limitation de debit et mecanismes anti-abus.",
            "Google et Microsoft : authentification OAuth lorsque l'utilisateur choisit ces fournisseurs.",
          ],
        },
        {
          title: "Transferts hors Union europeenne",
          paragraphs: [
            "Certains prestataires peuvent traiter des donnees hors de l'Union europeenne. Socially s'appuie sur les garanties contractuelles et mecanismes fournis par ces prestataires lorsque ces transferts existent.",
          ],
        },
        {
          title: "Droits des utilisateurs",
          paragraphs: [
            `Vous pouvez demander l'acces, la rectification, l'effacement, la limitation, l'opposition, la portabilite lorsque applicable, ou le retrait d'un consentement en ecrivant a ${contactEmail}. Vous pouvez egalement saisir la CNIL si vous estimez que vos droits ne sont pas respectes.`,
          ],
        },
      ],
    },
    {
      slug: "cookies",
      title: "Politique cookies",
      description:
        "Information sur les cookies et traceurs utilises par Socially dans la beta.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Principe",
          paragraphs: [
            "Socially utilise des cookies strictement necessaires au fonctionnement du service et, avec votre consentement, des cookies first-party de mesure d'acquisition limitee.",
          ],
        },
        {
          title: "Cookies utilises",
          items: [
            "cookie_consent : memorise votre choix d'acceptation ou de refus pendant un an.",
            "visitorId : identifie un visiteur anonyme apres acceptation des cookies non essentiels, pendant un an.",
            "session_active : evite de recompter plusieurs fois une meme session de visite.",
            "NEXT_LOCALE et cookies d'authentification : necessaires a la langue, a la session et au fonctionnement du compte.",
          ],
        },
        {
          title: "Donnees associees",
          paragraphs: [
            "Lorsque le consentement est donne, Socially peut conserver la langue du navigateur, les parametres UTM, le domaine referent et un compteur de visites. Ces donnees servent a comprendre comment le projet est decouvert, sans tracking publicitaire tiers.",
          ],
        },
        {
          title: "Retrait du consentement",
          paragraphs: [
            "Dans cette V1 beta, vous pouvez retirer votre consentement en supprimant les cookies Socially depuis les reglages de votre navigateur. Une interface dediee de gestion des preferences pourra etre ajoutee dans une version ulterieure.",
          ],
        },
      ],
    },
    {
      slug: "terms",
      title: "Conditions d'utilisation",
      description:
        "Regles courtes d'utilisation de Socially pour la beta publique.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Objet du service",
          paragraphs: [
            "Socially est un reseau social web-first de conversations publiques. Cette version est une beta issue d'un projet personnel d'entrainement, construite pour fonctionner comme un vrai produit tout en restant proportionnee a son stade de developpement.",
          ],
        },
        {
          title: "Age minimum",
          paragraphs: [
            "Le service est reserve aux personnes agees d'au moins 15 ans. En creant un compte, l'utilisateur declare avoir 15 ans ou plus. Si Socially apprend qu'un compte a ete cree par une personne de moins de 15 ans, le compte pourra etre supprime.",
          ],
        },
        {
          title: "Compte utilisateur",
          items: [
            "L'utilisateur doit fournir des informations exactes et garder son compte securise.",
            "Les profils sont publics en V1 : username, nom public, avatar, bio et posts visibles peuvent etre consultes par d'autres utilisateurs.",
            "L'utilisateur reste responsable de l'activite realisee depuis son compte.",
          ],
        },
        {
          title: "Contenus publies",
          paragraphs: [
            "L'utilisateur reste titulaire de ses contenus, mais autorise Socially a les afficher, les heberger, les indexer dans les pages publiques du service et les rendre accessibles aux autres utilisateurs tant qu'ils sont visibles.",
            "Les contenus peuvent etre supprimes, masques, limites ou soumis a verification lorsqu'ils enfreignent les regles du service, la loi, ou lorsqu'un risque de securite/moderation est detecte.",
          ],
        },
        {
          title: "Fonctionnalites beta",
          paragraphs: [
            "Certaines fonctionnalites sont incompletes ou evolutives : export partiel des donnees, signalement simplifie, moderation IA, back-office en construction et futurs recours contre les decisions de moderation.",
          ],
        },
        {
          title: "Disponibilite",
          paragraphs: [
            "Socially est fourni sans garantie de disponibilite continue. Le service peut etre modifie, suspendu ou interrompu pour maintenance, correction, securite ou evolution du projet.",
          ],
        },
      ],
    },
    {
      slug: "community-guidelines",
      title: "Regles communautaires",
      description:
        "Cadre de publication et d'interaction applicable aux posts, commentaires, profils et messages.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Ce qui est interdit",
          items: [
            "Haine, insultes ciblees, harcelement, menaces ou incitation a la violence.",
            "Doxxing, divulgation de donnees personnelles ou intimidation.",
            "Contenu illegal, apologie d'infractions, contournement manifeste de la moderation.",
            "Spam, manipulation, usurpation d'identite ou usage trompeur du service.",
            "Contenus sexuels non consentis, exploitation de mineurs ou contenu gravement choquant.",
            "Atteinte manifeste aux droits d'auteur ou publication de contenus que vous n'avez pas le droit de diffuser.",
          ],
        },
        {
          title: "Comportements attendus",
          items: [
            "Debattre sans attaquer les personnes.",
            "Publier des contenus que vous acceptez de rendre publics.",
            "Respecter les blocages et les limites d'interaction.",
            "Signaler les contenus problematiques au lieu de relancer un conflit.",
          ],
        },
        {
          title: "Consequences",
          paragraphs: [
            "Selon la gravite, Socially peut refuser une publication, masquer un contenu, supprimer un post ou un commentaire, limiter un compte, envoyer un avertissement ou supprimer un compte.",
          ],
        },
      ],
    },
    {
      slug: "moderation",
      title: "Moderation et signalements",
      description:
        "Fonctionnement beta de la moderation IA, des signalements et du futur recours humain.",
      updatedAt: "10 mai 2026",
      sections: [
        {
          title: "Moderation IA",
          paragraphs: [
            "Les posts, commentaires et images peuvent etre analyses par une moderation automatique avant publication. Le systeme classe les contenus en SAFE, UNCERTAIN ou UNSAFE.",
            "Un contenu UNSAFE peut etre bloque avant publication. Un contenu UNCERTAIN peut etre publie avec un avertissement ou etre journalise pour revue ulterieure.",
          ],
        },
        {
          title: "Signalements V1",
          paragraphs: [
            "Le bouton de signalement permet a un utilisateur connecte de signaler un post a l'equipe de moderation. Dans cette beta, le signalement est volontairement simple et ne demande pas encore de motif detaille.",
          ],
        },
        {
          title: "Back-office et revue humaine",
          paragraphs: [
            "Le back-office de moderation est prevu pour permettre a des moderateurs de consulter les contenus signales ou bloques par l'IA, puis de confirmer ou corriger la decision.",
            "Lorsqu'un contenu est finalement refuse apres revue, Socially pourra informer l'utilisateur par email avec la raison principale.",
          ],
        },
        {
          title: "Contestation",
          paragraphs: [
            "Une action de contestation des decisions IA est prevue avant le deploiement complet de la moderation. Elle permettra a l'utilisateur de demander une revue humaine lorsqu'il estime qu'un contenu a ete mal classe.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Pour un signalement legal, une contestation ou une demande urgente, contactez ${contactEmail}.`,
          ],
        },
      ],
    },
  ],
  en: [
    {
      slug: "mentions-legales",
      title: "Legal notice",
      description:
        "Information about Socially's non-professional publisher, contact details and hosting.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "Publisher",
          paragraphs: [
            "Socially is a personal learning project published on a non-professional basis. In this beta version, it is operated without a company, advertising, real payments or effective monetization.",
            "Under Article 6, III, 2 of French Law No. 2004-575 of June 21, 2004 on confidence in the digital economy, the non-professional publisher has chosen not to disclose their personal identity publicly. The publisher's identifying information has been provided to the hosting provider.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `For service, personal data, moderation or reporting requests, contact the publisher at: ${contactEmail}.`,
          ],
        },
        {
          title: "Hosting",
          items: [
            "Main hosting provider: Vercel Inc.",
            "Publicly listed address: 340 S Lemon Ave #4133, Walnut, CA 91789, United States.",
            "Website: https://vercel.com",
            "Support contact: support@vercel.com",
          ],
        },
        {
          title: "Domain name",
          paragraphs: [
            `The service is intended to be available at ${publicUrl}. The domain name is registered through IONOS.`,
          ],
        },
        {
          title: "Intellectual property",
          paragraphs: [
            "The interface, Socially name, presentation choices and technical project content belong to the publisher unless stated otherwise. User-published content remains under each user's responsibility.",
          ],
        },
      ],
    },
    {
      slug: "privacy",
      title: "Privacy policy",
      description:
        "Summary of the data processed by Socially, purposes, user rights and processors.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "Controller",
          paragraphs: [
            `Socially is published on a non-professional basis. For GDPR requests, contact ${contactEmail}.`,
          ],
        },
        {
          title: "Data processed",
          items: [
            "Account data: name, email, password handled by the authentication system, OAuth provider when applicable.",
            "Profile data: display name, username, avatar, banner, bio, language, theme, categories and onboarding information.",
            "Social activity: posts, post images, comments, likes, follows, blocks, notifications, reports and search history.",
            "Private messaging: 1-to-1 conversations, messages, read status and participants.",
            "Technical data: sessions, IP address and user-agent when retained by authentication, error logs, rate limiting and security data.",
            "First-party acquisition data: cookie consent, UTMs, referrer domain, language and visit count before signup.",
          ],
        },
        {
          title: "Purposes and legal bases",
          items: [
            "Providing the social network: performance of the terms of use.",
            "Authenticating users and protecting accounts: service performance and legitimate security interest.",
            "Displaying public profiles, posts, comments and interactions: service performance.",
            "Moderation, abuse prevention, reports and security: legitimate interest and applicable legal obligations.",
            "Non-essential cookies and acquisition measurement: consent.",
            "Support, GDPR requests and disputes: legal obligation or legitimate interest depending on the request.",
          ],
        },
        {
          title: "Export and deletion",
          paragraphs: [
            "The data area lets users download a product export of the main account and activity data. This export is not presented as an exhaustive GDPR copy of every stored item.",
            "A more complete access, correction, objection, restriction or deletion request can be sent by email.",
            "Account deletion happens in two steps: the public profile is hidden quickly, then application data is anonymized or deleted after 30 days, unless minimal retention is required for security, moderation or legal reasons.",
          ],
        },
        {
          title: "Processors and external services",
          items: [
            "Vercel: hosting, deployment and web infrastructure.",
            "IONOS: domain name registration.",
            "Cloudinary: storage and delivery of profile images, banners and post images.",
            "OpenAI: assistance with automatic moderation of submitted text and images.",
            "Resend: transactional email delivery.",
            "Sentry: application error monitoring and technical diagnostics.",
            "Pusher: real-time notifications and messaging.",
            "Upstash Redis: rate limiting and anti-abuse mechanisms.",
            "Google and Microsoft: OAuth authentication when selected by the user.",
          ],
        },
        {
          title: "Transfers outside the European Union",
          paragraphs: [
            "Some providers may process data outside the European Union. Socially relies on the contractual safeguards and mechanisms provided by those providers where such transfers exist.",
          ],
        },
        {
          title: "User rights",
          paragraphs: [
            `You may request access, correction, deletion, restriction, objection, portability where applicable, or withdrawal of consent by emailing ${contactEmail}. You may also contact the French CNIL if you believe your rights are not respected.`,
          ],
        },
      ],
    },
    {
      slug: "cookies",
      title: "Cookie policy",
      description:
        "Information about cookies and trackers used by Socially in beta.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "Principle",
          paragraphs: [
            "Socially uses cookies that are strictly necessary for the service and, with consent, limited first-party acquisition measurement cookies.",
          ],
        },
        {
          title: "Cookies used",
          items: [
            "cookie_consent: stores your accept or reject choice for one year.",
            "visitorId: identifies an anonymous visitor after consent to non-essential cookies, for one year.",
            "session_active: avoids counting the same visit session multiple times.",
            "NEXT_LOCALE and authentication cookies: required for language, session and account features.",
          ],
        },
        {
          title: "Associated data",
          paragraphs: [
            "When consent is given, Socially may store browser language, UTM parameters, referrer domain and visit count. These data help understand how the project is discovered, without third-party advertising tracking.",
          ],
        },
        {
          title: "Withdrawing consent",
          paragraphs: [
            "In this beta V1, you can withdraw consent by deleting Socially cookies in your browser settings. A dedicated preference management interface may be added later.",
          ],
        },
      ],
    },
    {
      slug: "terms",
      title: "Terms of use",
      description: "Short beta rules for using Socially.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "Purpose of the service",
          paragraphs: [
            "Socially is a web-first social network for public conversations. This version is a beta from a personal training project, built to behave like a real product while remaining proportional to its development stage.",
          ],
        },
        {
          title: "Minimum age",
          paragraphs: [
            "The service is reserved for people aged 15 or older. By creating an account, the user declares that they are 15 or older. If Socially learns that an account was created by someone under 15, the account may be deleted.",
          ],
        },
        {
          title: "User account",
          items: [
            "Users must provide accurate information and keep their account secure.",
            "Profiles are public in V1: username, display name, avatar, bio and visible posts may be viewed by other users.",
            "Users remain responsible for activity performed from their account.",
          ],
        },
        {
          title: "Published content",
          paragraphs: [
            "Users remain the owners of their content, but authorize Socially to display it, host it, index it in public pages and make it available to other users while it remains visible.",
            "Content may be deleted, hidden, limited or reviewed when it breaches service rules, the law, or when a safety/moderation risk is detected.",
          ],
        },
        {
          title: "Beta features",
          paragraphs: [
            "Some features are incomplete or evolving: partial data export, simplified reporting, AI moderation, back-office under construction and future appeals against moderation decisions.",
          ],
        },
        {
          title: "Availability",
          paragraphs: [
            "Socially is provided without a guarantee of continuous availability. The service may be changed, suspended or interrupted for maintenance, correction, security or project evolution.",
          ],
        },
      ],
    },
    {
      slug: "community-guidelines",
      title: "Community guidelines",
      description:
        "Publication and interaction rules for posts, comments, profiles and messages.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "Forbidden content and behavior",
          items: [
            "Hate, targeted insults, harassment, threats or incitement to violence.",
            "Doxxing, disclosure of personal data or intimidation.",
            "Illegal content, promotion of offenses, obvious circumvention of moderation.",
            "Spam, manipulation, impersonation or deceptive use of the service.",
            "Non-consensual sexual content, exploitation of minors or severely shocking content.",
            "Clear copyright infringement or publishing content you are not allowed to share.",
          ],
        },
        {
          title: "Expected behavior",
          items: [
            "Debate without attacking people.",
            "Publish content you accept making public.",
            "Respect blocks and interaction limits.",
            "Report problematic content instead of escalating conflict.",
          ],
        },
        {
          title: "Consequences",
          paragraphs: [
            "Depending on severity, Socially may reject a publication, hide content, delete a post or comment, limit an account, send a warning or delete an account.",
          ],
        },
      ],
    },
    {
      slug: "moderation",
      title: "Moderation and reports",
      description:
        "Beta operation of AI moderation, reports and future human appeal.",
      updatedAt: "May 10, 2026",
      sections: [
        {
          title: "AI moderation",
          paragraphs: [
            "Posts, comments and images may be analyzed by automatic moderation before publication. The system classifies content as SAFE, UNCERTAIN or UNSAFE.",
            "UNSAFE content may be blocked before publication. UNCERTAIN content may be published with a warning or logged for later review.",
          ],
        },
        {
          title: "V1 reports",
          paragraphs: [
            "The report button lets a signed-in user report a post to the moderation team. In this beta, reporting is intentionally simple and does not yet ask for a detailed reason.",
          ],
        },
        {
          title: "Back-office and human review",
          paragraphs: [
            "The moderation back-office is planned so moderators can review content reported by users or blocked by AI, then confirm or correct the decision.",
            "When content is finally rejected after review, Socially may inform the user by email with the main reason.",
          ],
        },
        {
          title: "Appeal",
          paragraphs: [
            "An action to appeal AI decisions is planned before the full moderation deployment. It will let users request human review when they believe content was misclassified.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `For a legal report, appeal or urgent request, contact ${contactEmail}.`,
          ],
        },
      ],
    },
  ],
  es: [
    {
      slug: "mentions-legales",
      title: "Aviso legal",
      description:
        "Informacion sobre la edicion no profesional de Socially, el contacto y el alojamiento del servicio.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Edicion del servicio",
          paragraphs: [
            "Socially es un proyecto personal de aprendizaje editado a titulo no profesional. En esta beta, el servicio se explota sin sociedad, sin publicidad, sin pagos reales y sin monetizacion efectiva.",
            "De conformidad con el articulo 6, III, 2 de la ley francesa n° 2004-575 de 21 de junio de 2004 para la confianza en la economia digital, el editor no profesional ha elegido preservar su anonimato publico. Los datos de identificacion personal del editor han sido comunicados al proveedor de alojamiento.",
          ],
        },
        {
          title: "Contacto",
          paragraphs: [
            `Para cualquier solicitud relativa al servicio, datos personales, moderacion o reportes, puedes contactar al editor en: ${contactEmail}.`,
          ],
        },
        {
          title: "Alojamiento",
          items: [
            "Proveedor principal de alojamiento: Vercel Inc.",
            "Direccion publicada: 340 S Lemon Ave #4133, Walnut, CA 91789, United States.",
            "Sitio web: https://vercel.com",
            "Contacto soporte: support@vercel.com",
          ],
        },
        {
          title: "Nombre de dominio",
          paragraphs: [
            `El servicio esta previsto para estar disponible en ${publicUrl}. El nombre de dominio esta registrado mediante IONOS.`,
          ],
        },
        {
          title: "Propiedad intelectual",
          paragraphs: [
            "La interfaz, el nombre Socially, las decisiones de presentacion y el contenido tecnico del proyecto pertenecen a su editor salvo indicacion contraria. Los contenidos publicados por los usuarios siguen bajo su responsabilidad.",
          ],
        },
      ],
    },
    {
      slug: "privacy",
      title: "Politica de privacidad",
      description:
        "Resumen de los datos tratados por Socially, finalidades, derechos de usuarios y encargados.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Responsable del tratamiento",
          paragraphs: [
            `Socially se edita a titulo no profesional. Para solicitudes RGPD/GDPR, contacta con ${contactEmail}.`,
          ],
        },
        {
          title: "Datos tratados",
          items: [
            "Datos de cuenta: nombre, email, contrasena gestionada por el sistema de autenticacion, proveedor OAuth cuando corresponda.",
            "Datos de perfil: nombre publico, username, avatar, banner, bio, idioma, tema, categorias e informacion de onboarding.",
            "Actividad social: publicaciones, imagenes, comentarios, likes, seguimientos, bloqueos, notificaciones, reportes e historial de busqueda.",
            "Mensajeria privada: conversaciones 1-to-1, mensajes, estado leido/no leido y participantes.",
            "Datos tecnicos: sesiones, IP y user-agent cuando los conserva la autenticacion, logs de error, rate limiting y seguridad.",
            "Datos first-party de adquisicion: consentimiento cookies, UTM, dominio referente, idioma y contador de visitas antes del registro.",
          ],
        },
        {
          title: "Finalidades y bases legales",
          items: [
            "Prestar la red social: ejecucion de las condiciones de uso.",
            "Autenticar usuarios y proteger cuentas: ejecucion del servicio e interes legitimo de seguridad.",
            "Mostrar perfiles, publicaciones, comentarios e interacciones publicas: ejecucion del servicio.",
            "Moderacion, prevencion de abusos, reportes y seguridad: interes legitimo y obligaciones legales aplicables.",
            "Cookies no esenciales y medicion de adquisicion: consentimiento.",
            "Soporte, solicitudes RGPD/GDPR y litigios: obligacion legal o interes legitimo segun la solicitud.",
          ],
        },
        {
          title: "Exportacion y eliminacion",
          paragraphs: [
            "El area de datos permite descargar una exportacion de producto con los principales datos de cuenta y actividad. Esta exportacion no se presenta como una copia RGPD/GDPR exhaustiva de todos los datos.",
            "Puede solicitarse por email un acceso mas completo, rectificacion, oposicion, limitacion o eliminacion.",
            "La eliminacion de cuenta se realiza en dos pasos: el perfil publico se oculta rapidamente y luego los datos de aplicacion se anonimizan o eliminan tras 30 dias, salvo conservacion minima necesaria para seguridad, moderacion u obligacion legal.",
          ],
        },
        {
          title: "Encargados y servicios externos",
          items: [
            "Vercel: alojamiento, despliegue e infraestructura web.",
            "IONOS: registro del nombre de dominio.",
            "Cloudinary: almacenamiento y entrega de imagenes de perfil, banners e imagenes de publicaciones.",
            "OpenAI: asistencia para la moderacion automatica de textos e imagenes enviados.",
            "Resend: envio de emails transaccionales.",
            "Sentry: seguimiento de errores de aplicacion y diagnostico tecnico.",
            "Pusher: notificaciones y mensajeria en tiempo real.",
            "Upstash Redis: limitacion de flujo y mecanismos anti-abuso.",
            "Google y Microsoft: autenticacion OAuth cuando el usuario los elige.",
          ],
        },
        {
          title: "Transferencias fuera de la Union Europea",
          paragraphs: [
            "Algunos proveedores pueden tratar datos fuera de la Union Europea. Socially se apoya en las garantias contractuales y mecanismos proporcionados por dichos proveedores cuando existen esas transferencias.",
          ],
        },
        {
          title: "Derechos de los usuarios",
          paragraphs: [
            `Puedes solicitar acceso, rectificacion, eliminacion, limitacion, oposicion, portabilidad cuando aplique o retirada del consentimiento escribiendo a ${contactEmail}. Tambien puedes contactar con la CNIL francesa si consideras que tus derechos no se respetan.`,
          ],
        },
      ],
    },
    {
      slug: "cookies",
      title: "Politica de cookies",
      description:
        "Informacion sobre cookies y rastreadores utilizados por Socially en beta.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Principio",
          paragraphs: [
            "Socially utiliza cookies estrictamente necesarias para el funcionamiento del servicio y, con consentimiento, cookies first-party limitadas para medir la adquisicion.",
          ],
        },
        {
          title: "Cookies utilizadas",
          items: [
            "cookie_consent: recuerda tu aceptacion o rechazo durante un ano.",
            "visitorId: identifica a un visitante anonimo tras aceptar cookies no esenciales, durante un ano.",
            "session_active: evita contar varias veces la misma sesion de visita.",
            "NEXT_LOCALE y cookies de autenticacion: necesarias para idioma, sesion y funciones de cuenta.",
          ],
        },
        {
          title: "Datos asociados",
          paragraphs: [
            "Cuando das tu consentimiento, Socially puede conservar idioma del navegador, parametros UTM, dominio referente y contador de visitas. Estos datos ayudan a entender como se descubre el proyecto, sin tracking publicitario de terceros.",
          ],
        },
        {
          title: "Retirada del consentimiento",
          paragraphs: [
            "En esta V1 beta puedes retirar tu consentimiento eliminando las cookies de Socially desde la configuracion del navegador. Una interfaz dedicada de preferencias podra anadirse mas adelante.",
          ],
        },
      ],
    },
    {
      slug: "terms",
      title: "Condiciones de uso",
      description: "Reglas breves de uso de Socially para la beta publica.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Objeto del servicio",
          paragraphs: [
            "Socially es una red social web-first de conversaciones publicas. Esta version es una beta de un proyecto personal de entrenamiento, construida para comportarse como un producto real manteniendose proporcional a su fase de desarrollo.",
          ],
        },
        {
          title: "Edad minima",
          paragraphs: [
            "El servicio esta reservado a personas de 15 anos o mas. Al crear una cuenta, el usuario declara tener 15 anos o mas. Si Socially descubre que una cuenta fue creada por una persona menor de 15 anos, la cuenta podra ser eliminada.",
          ],
        },
        {
          title: "Cuenta de usuario",
          items: [
            "El usuario debe proporcionar informacion exacta y mantener su cuenta segura.",
            "Los perfiles son publicos en V1: username, nombre publico, avatar, bio y publicaciones visibles pueden ser consultados por otros usuarios.",
            "El usuario sigue siendo responsable de la actividad realizada desde su cuenta.",
          ],
        },
        {
          title: "Contenidos publicados",
          paragraphs: [
            "El usuario conserva la titularidad de sus contenidos, pero autoriza a Socially a mostrarlos, alojarlos, indexarlos en paginas publicas y hacerlos accesibles a otros usuarios mientras sigan visibles.",
            "Los contenidos pueden eliminarse, ocultarse, limitarse o revisarse cuando infrinjan las reglas del servicio, la ley o cuando se detecte un riesgo de seguridad/moderacion.",
          ],
        },
        {
          title: "Funciones beta",
          paragraphs: [
            "Algunas funciones estan incompletas o evolucionan: exportacion parcial de datos, reporte simplificado, moderacion IA, back-office en construccion y futuros recursos contra decisiones de moderacion.",
          ],
        },
        {
          title: "Disponibilidad",
          paragraphs: [
            "Socially se proporciona sin garantia de disponibilidad continua. El servicio puede modificarse, suspenderse o interrumpirse por mantenimiento, correccion, seguridad o evolucion del proyecto.",
          ],
        },
      ],
    },
    {
      slug: "community-guidelines",
      title: "Reglas comunitarias",
      description:
        "Marco de publicacion e interaccion aplicable a publicaciones, comentarios, perfiles y mensajes.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Contenido y comportamiento prohibidos",
          items: [
            "Odio, insultos dirigidos, acoso, amenazas o incitacion a la violencia.",
            "Doxxing, divulgacion de datos personales o intimidacion.",
            "Contenido ilegal, apologia de infracciones, elusion manifiesta de la moderacion.",
            "Spam, manipulacion, suplantacion de identidad o uso enganoso del servicio.",
            "Contenido sexual no consentido, explotacion de menores o contenido gravemente impactante.",
            "Infraccion manifiesta de derechos de autor o publicacion de contenidos que no tienes derecho a difundir.",
          ],
        },
        {
          title: "Comportamientos esperados",
          items: [
            "Debatir sin atacar a las personas.",
            "Publicar contenidos que aceptas hacer publicos.",
            "Respetar bloqueos y limites de interaccion.",
            "Reportar contenidos problematicos en lugar de escalar conflictos.",
          ],
        },
        {
          title: "Consecuencias",
          paragraphs: [
            "Segun la gravedad, Socially puede rechazar una publicacion, ocultar contenido, eliminar una publicacion o comentario, limitar una cuenta, enviar una advertencia o eliminar una cuenta.",
          ],
        },
      ],
    },
    {
      slug: "moderation",
      title: "Moderacion y reportes",
      description:
        "Funcionamiento beta de la moderacion IA, reportes y futuro recurso humano.",
      updatedAt: "10 de mayo de 2026",
      sections: [
        {
          title: "Moderacion IA",
          paragraphs: [
            "Publicaciones, comentarios e imagenes pueden ser analizados por una moderacion automatica antes de publicarse. El sistema clasifica los contenidos como SAFE, UNCERTAIN o UNSAFE.",
            "Un contenido UNSAFE puede bloquearse antes de publicarse. Un contenido UNCERTAIN puede publicarse con una advertencia o registrarse para revision posterior.",
          ],
        },
        {
          title: "Reportes V1",
          paragraphs: [
            "El boton de reporte permite a un usuario conectado reportar una publicacion al equipo de moderacion. En esta beta, el reporte es deliberadamente simple y aun no solicita un motivo detallado.",
          ],
        },
        {
          title: "Back-office y revision humana",
          paragraphs: [
            "El back-office de moderacion esta previsto para que moderadores puedan revisar contenidos reportados por usuarios o bloqueados por la IA, y confirmar o corregir la decision.",
            "Cuando un contenido se rechace finalmente tras revision, Socially podra informar al usuario por email con el motivo principal.",
          ],
        },
        {
          title: "Recurso",
          paragraphs: [
            "Una accion de recurso contra decisiones IA esta prevista antes del despliegue completo de la moderacion. Permitira solicitar una revision humana cuando el usuario considere que un contenido fue mal clasificado.",
          ],
        },
        {
          title: "Contacto",
          paragraphs: [
            `Para un reporte legal, recurso o solicitud urgente, contacta con ${contactEmail}.`,
          ],
        },
      ],
    },
  ],
};

export function getLegalDocuments(locale: AppLocale) {
  return documents[locale] ?? documents.en;
}

export function getLegalDocument(locale: AppLocale, slug: string) {
  return getLegalDocuments(locale).find((document) => document.slug === slug);
}

export function isLegalDocumentSlug(slug: string): slug is LegalDocumentSlug {
  return LEGAL_DOCUMENT_SLUGS.includes(slug as LegalDocumentSlug);
}
