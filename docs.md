# Socially — Docs V1

## 0. Résumé du projet
Socially est un réseau social web-first de conversations publiques, pensé comme une alternative moderne aux plateformes de débat rapide et toxique.

Le produit est text-first : le texte structure l’expérience, les images enrichissent les publications sans dominer l’interface.

Cette V1 a un objectif d’entraînement à travailler de renforcer mes compétence sur ma stack et surtout d'apprendre a travailler comme attendu dans milieux pro : cadrer un produit, fixer des règles fonctionnelles claires, puis découper le tout en backlog, user stories et tickets etc.

---

## 1. Périmètre V1

### Inclus en V1
- Auth utilisateur : email + mot de passe, Google, Apple, Facebook avec Better Auth
- Onboarding utilisateur
- Feed accueil
- Fil des abonnements
- Trending
- Discover
- Recherche utilisateurs + posts
- Profil utilisateur public
- Création de post texte + images
- Commentaires
- Notifications
- Messagerie privée 1-to-1
- Pages settings
- Back-office admin complet
- Modération IA sur texte et images
- Cookies banner, legal/help, export CSV, suppression/désactivation compte

### Hors scope V1
- Topics automatiques
- Recommandations par topics
- Vidéo
- Repost / quote-post / référence de post
- Compte privé
- Fake News
- Mute
- Report utilisateur
- Temps réel pour la messagerie
- Typing indicator
- Paiement réel / Stripe
- Sélection d’offres payantes
- Règles détaillées UI des commentaires imbriqués (prototype à finaliser séparément)

---

## 2. Rôles

### Visiteur
- Peut voir les pages publiques autorisées
- Peut accéder au login
- Ne peut pas publier, commenter, liker, envoyer de message

### Utilisateur connecté
- Peut publier des posts
- Peut liker, commenter, suivre, bloquer
- Peut envoyer des messages privés 1-to-1
- Peut gérer son profil et ses préférences
- Peut signaler un post ou un commentaire
- Peut supprimer ses propres posts

### Admin
- Accède au back-office
- Consulte les modérations, utilisateurs, logs
- Gère les invitations admin
- Gère l’acceptance admin
- Consulte le dashboard et les réglages admin

---

## 3. Sitemap

### Front-office
- `/`
- `/discover`
- `/trending`
- `/conversation`
- `/notifications`
- `/search`
- `/profile/[username]`
- `/post/[slug]`
- `/login`
- `/onboarding`
- `/settings/compte`
- `/settings/data-confidentialite`
- `/settings/preferences`
- `/settings/notifications`
- `/settings/billing`
- `/billing`
- `/legal`
- `/help`

### Back-office
- `/admin/login`
- `/admin/dashboard`
- `/admin/moderations`
- `/admin/users`
- `/admin/invite`
- `/admin/acceptance`
- `/admin/logs`
- `/admin/settings`

---

## 4. Authentification et onboarding

### Login utilisateur
Méthodes disponibles :
- email + mot de passe
- Google
- Apple

### Onboarding au premier passage
Champs demandés :
- `username`
- `displayName`
- `avatar`
- `bio courte`
- `où habites-tu ?`
- `d’où viens-tu / comment as-tu pris connaissance de Socially ?`

Notes :
- pas de sélection de catégories dans l’onboarding V1
- pas de sélection de topics en V1
- le compte est public uniquement

---

## 5. Spécifications par page

### 5.1 Accueil `/`
Structure :
- navigation principale
- contenu principal en deux onglets
- colonne latérale de contexte

Onglets :
- `Pour vous`
- `Abonnements`

#### Onglet “Pour vous”
- affiche les posts les plus récents
- tri principal : `createdAt DESC`
- pas de logique topics en V1
- pagination/infinite scroll : à confirmer pendant l’implémentation

#### Onglet “Abonnements”
- affiche uniquement les posts des comptes suivis
- tri principal : `createdAt DESC`

Règles :
- les posts supprimés ne doivent pas apparaître
- les posts des comptes bloqués ne doivent pas apparaître
- les médias ne prennent pas une place dominante dans la carte post

### 5.2 Discover `/discover`
Sections :
- Post du moment
- Catégories
- Comptes à suivre
- Bloc `Pourrait vous intéresser` avec état `COMING SOON`

Objectif :
- offrir une surface de découverte éditoriale légère sans topics ni recommandation avancée en V1

### 5.3 Trending `/trending`
- page séparée
- affiche les posts les plus likés sur les 7 derniers jours
- tri secondaire : nombre de commentaires, puis récence
- aucun topic en V1

### 5.4 Conversation `/conversation`
- liste des conversations 1-to-1
- tri par dernier message desc
- affichage dernier message + état lu/non lu
- contenu d’une conversation : texte, image, partage de post
- pas de temps réel
- pas d’indicateur “en train d’écrire”
- pas de suppression de conversation en V1
- pas de suppression de message en V1
- 1 image max par message
- partage de post affiché sous forme de carte preview

### 5.5 Notifications `/notifications`
Types V1 :
- like
- commentaire
- follow

Affichage :
- groupé par contenu
- ordre antéchronologique
- distinction lu / non lu

### 5.6 Recherche `/search`
Entités recherchées :
- utilisateurs
- `posts.title`
- `posts.content`

Interface :
- page avec onglets `Tout`, `Utilisateurs`, `Posts`
- autocomplete sur utilisateurs uniquement dans la barre
- historique des recherches récentes activé

### 5.7 Profil `/profile/[username]`
Éléments :
- avatar
- display name
- username
- bio
- stats
- bouton follow / unfollow
- bouton message
- liste des posts de l’utilisateur
- éventuels posts épinglés si implémentés plus tard

Règles :
- profil public uniquement
- si l’utilisateur est bloqué, les accès et interactions sont restreints selon les règles de block

### 5.8 Post detail `/post/[slug]`
- affiche le post complet
- affiche ses médias
- affiche les commentaires
- sert de point d’entrée aux interactions de détail

Note :
- la spécification détaillée du permalink commentaire est différée au prototype dédié

### 5.9 Billing `/billing` et `/settings/billing`
- page visible en V1
- offres visibles
- aucune offre sélectionnable
- état global `COMING SOON`
- pas d’intégration paiement réel

### 5.10 Settings
#### `/settings/compte`
- informations de compte
- désactivation
- suppression de compte
- block list

#### `/settings/data-confidentialite`
- export des données CSV
- confidentialité et informations légales liées aux données

#### `/settings/preferences`
- thème
- langue

#### `/settings/notifications`
- préférences de notifications disponibles en V1

#### `/settings/billing`
- état `COMING SOON`

### 5.11 Legal `/legal`
- mentions et documents légaux
- informations RGPD minimales
- politique cookies

### 5.12 Help `/help`
- aide produit
- contact / support basique si prévu

---

## 6. Posts

### Modèle fonctionnel
- `title` obligatoire
- `content` optionnel
- images autorisées jusqu’à 10
- vidéo non autorisée en V1

### Limites V1
- `title` max : 120 caractères
- `content` max : 10 000 caractères
- images max : 10

### Actions autorisées
- créer un post
- supprimer un post

### Actions non autorisées en V1
- éditer un post
- repost
- quote-post
- référence de post
- vidéo

### Affichage média
- le texte reste prioritaire
- les images ne doivent pas prendre toute la hiérarchie de la carte
- si plusieurs images, présentation compacte avec ouverture agrandie si nécessaire

---

## 7. Commentaires

### Présence en V1
- les commentaires sont bien présents en V1

### Règles déjà validées
- profondeur de réponses gérée en data
- si un commentaire parent est supprimé, il reste affiché en état `supprimé` et les enfants restent visibles
- tri principal des réponses : `top`

### Règles différées
Les choix suivants seront finalisés via prototype séparé avant découpage détaillé :
- comportement UI précis de l’imbrication
- indentation max visuelle
- permalink commentaire `/post/[slug]/c/[commentId]`
- navigation de contexte dans un fil long

---

## 8. Recherche et découverte

### Recherche
- recherche utilisateurs + posts
- pas de topics en V1
- pas de recherche sémantique avancée en V1

### Discover
- surface éditoriale légère
- pas de moteur complexe de recommandation en V1
- partie “Pourrait vous intéresser” explicitement marquée `COMING SOON`

### Trending
- classement simple par likes sur 7 jours
- sans topics

---

## 9. Relations sociales

### Follow
- un utilisateur connecté peut suivre un autre utilisateur
- le fil `Abonnements` dépend des comptes suivis
- les notifications de follow sont activées en V1

### Block
Quand un utilisateur bloque un autre utilisateur :
- il ne peut plus lui envoyer de message privé
- il ne voit plus son profil
- il ne voit plus ses posts
- la personne bloquée ne voit plus son profil
- la personne bloquée ne peut plus interagir avec lui

### Mute
- non disponible en V1

---

## 10. Messagerie privée

### Portée V1
- DM 1-to-1 uniquement
- tout le monde peut écrire à tout le monde, sauf si block

### Types de contenu supportés
- texte
- image
- partage de post

### Hors scope V1
- groupes
- appels
- temps réel
- typing indicator
- suppression de message
- suppression de conversation

---

## 11. Notifications

Types V1 :
- like
- commentaire
- follow

Règles :
- regroupement par contenu
- distinction lu / non lu
- ordre antéchronologique

Hors scope V1 :
- notifications de mention
- notifications de repost
- notifications de topic

---

## 12. Signalement et modération

### Signalement utilisateur
- pas de report utilisateur en V1

### Signalement contenu
- report post : oui
- report commentaire : oui

### Modération IA V1
Blocage dur avant publication si détection de :
- haine explicite
- menace
- harcèlement explicite
- violence
- doxxing

Comportement :
- le message ne peut pas être publié
- affichage d’une alerte simple
- pas de suggestion de reformulation en V1
- journalisation côté admin

### Portée technique visée
- modération texte
- modération images
- pas de vidéo en V1

---

## 13. Back-office admin

### `/admin/login`
- login admin
- connexion Microsoft

### `/admin/dashboard`
- vue d’ensemble admin
- métriques basiques si implémentées

### `/admin/moderations`
- liste des contenus signalés
- actions de modération
- consultation des refus automatiques si journalisés

### `/admin/users`
- consultation des utilisateurs
- consultation d’informations admin utiles

### `/admin/invite`
- inviter un admin via email
- historiser la liste des invitations

### `/admin/acceptance`
- page d’acceptation après clic sur lien d’invitation
- lien avec token
- vérification du token
- si le bon email n’est pas en session : redirection vers `/admin/login`
- login Microsoft requis

### `/admin/logs`
- journal des actions admin et techniques utiles

### `/admin/settings`
- réglages back-office disponibles en V1

---

## 14. RGPD, légal et données

### Cookies
- cookies banner présent en V1

### Données / droits utilisateur
- export des données en CSV
- suppression de compte
- désactivation de compte

### Pages obligatoires V1
- legal
- help

---

## 15. États UI à prévoir

Pour chaque page / composant critique, prévoir au minimum :
- loading
- empty
- error
- deleted
- blocked
- coming soon
- non autorisé

---

## 16. User flows critiques

### Flow 1 — Inscription et onboarding
1. le visiteur arrive sur login
2. il s’inscrit par email/mdp, Google ou Apple
3. il passe par l’onboarding
4. il renseigne username, displayName, avatar, bio courte, lieu de vie, source de découverte de Socially
5. il accède à l’accueil

### Flow 2 — Publication d’un post
1. l’utilisateur ouvre la modale de publication
2. il renseigne un `title`
3. il ajoute éventuellement un `content`
4. il ajoute éventuellement des images
5. la modération IA vérifie le contenu
6. si le contenu passe, le post est publié
7. le post apparaît dans le feed et sur son profil

### Flow 3 — Interaction sur un post
1. l’utilisateur ouvre un post
2. il like ou commente
3. une notification est créée pour l’auteur si nécessaire

### Flow 4 — Follow et fil abonnements
1. l’utilisateur ouvre un profil
2. il clique sur suivre
3. le compte apparaît dans ses abonnements
4. ses nouveaux posts remontent dans l’onglet `Abonnements`

### Flow 5 — Messagerie privée
1. l’utilisateur ouvre un profil ou la page conversation
2. il démarre une conversation 1-to-1
3. il envoie texte, image ou post partagé
4. la conversation remonte en haut de liste

### Flow 6 — Signalement et modération
1. l’utilisateur signale un post ou commentaire
2. le contenu apparaît dans le back-office
3. un admin le traite
4. l’action est journalisée si nécessaire

### Flow 7 — Invitation admin
1. un admin envoie une invitation par email
2. le destinataire reçoit le lien
3. il arrive sur `/admin/acceptance`
4. le token est vérifié
5. si l’email en session n’est pas le bon, redirection vers `/admin/login`
6. le login Microsoft est utilisé
7. l’accès admin est accordé si le flow est valide

---

## 17. Règles métier transverses

### Feed
- `Pour vous` = posts récents
- `Abonnements` = posts des comptes suivis
- tri principal par récence en V1
- pas de topics en V1

### Profil
- public uniquement

### Billing
- visible mais non activable
- `COMING SOON`

### Block
- coupe visibilité et interaction réciproque selon les règles définies plus haut

### Recherche
- utilisateurs + posts uniquement

### Modération
- refus automatique avant publication pour certains contenus graves

---

## 18. Points à préciser plus tard
- prototype final commentaires imbriqués
- choix exact pagination vs infinite scroll sur certains flux
- wording précis des alertes de modération
- détail exact des métriques dashboard admin
- éventuelle gestion des posts épinglés

---

## 19. Base pour le backlog
À partir de ce document, le backlog initial pourra être découpé au minimum en epics :
- Auth & onboarding
- Core social feed
- Publication & modération
- Profils & follows
- Commentaires
- Notifications
- Messagerie privée
- Search & discover
- Settings & légal
- Back-office admin

