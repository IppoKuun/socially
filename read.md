Objectif

Créer un composant client de création de post sur le feed, avec un petit bouton fixe en bas à droite qui ouvre une modale responsive. Le composant doit être branché à la server action `createPost` existante, rester simple, lisible, et ne pas partir en overkill.

Contexte

- Le scope est uniquement la création de post, pas l’affichage du feed réel.
- La route feed est déjà dans une zone authentifiée. On se concentre donc sur l’UI de création.
- Utiliser `shadcn/dialog`, `lucide-react`, et une solution légère de drag and drop pour l’ajout d’images.
- Choix retenu pour le drag and drop: `react-dropzone` ou équivalent très léger pour ajout + preview + remove uniquement.
- Utiliser `framer-motion` de façon minimale seulement si cela apporte un vrai plus au pop-up.

Fichiers à lire en priorité

- `app/actions/post.ts`
- `lib/validations.ts/post.ts`
- `lib/AI/postModerations.ts`
- `app/[locale]/(app)/feed/page.tsx`
- `app/components/CookiesConsentBanner.tsx`
- `app/[locale]/onboarding/_components/StepFinal.tsx`

Exemple existant à suivre

- Image que je vais ci-joint

Contraintes

- Préférer une implémentation simple, lisible.
- Créer un composant client de modale + le bouton fixe sur la page feed.
- Auutre petite intégration dans `app/[locale]/(app)/feed/page.tsx` est autorisée si nécessaire pour rendre le composant.
- Ne pas modifier le backend, la logique de modération, Prisma, les tests serveurs, ou d’autres fichiers server-side hors intégration minimale indispensable.
- Gérer des erreurs client-side avant submit, cohérentes avec les règles serveur actuelles, exemple:
  - `title`: trim, requis, min 3, max 100
  - `content`: optionnel, max 500
  - `images`: max 10 côté client
  - types autorisés: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
  - taille max par image: `8_000_000` bytes
- Afficher des loading/error states propres dans la modale.
- Au succès: reset du formulaire, fermeture de la modale, puis `router.refresh()`.
- Si la réponse serveur indique un cas unsafe, garder la modale ouverte, mettre sa bordure en rouge, afficher les `reasons`, et mettre une bordure rouge sur les previews d’images concernées si IA a mis les index dans tableau unsafeImages.
- Garder l’ordre des images stable, car `unsafeImages` repose sur des index.
- Préférer state local + validation Zod simple. Ne pas introduire une grosse abstraction formulaire si ce n’est pas clairement utile.
- Garder `framer-motion` minimal. Si l’animation native du dialog suffit déjà presque, ne pas sur-animer.
- À la fin, fournir un ordre de lecture logique des fichiers créés/modifiés.

Non-objectifs

- Pas de vrai rendu de posts dans le feed
- Pas d’optimistic update
- Pas de flow d’édition de post
- Pas de réordonnancement drag-and-drop des images
- Pas de refacto backend
- Pas de redesign global du feed

Done when

- Un bouton flottant existe sur le feed et ouvre une modale responsive
- La modale contient les champs `title`, `content`, une zone drag and drop image, les previews, le remove, et le submit
- Les erreurs client apparaissent avant submit
- Les erreurs serveur sont affichées proprement
- Le pending state est clair
- Le cas unsafe met bien la modale et les images concernées en évidence
- Un submit réussi ferme, reset, puis refresh la page

Checks à exécuter

- Vérification manuelle desktop + mobile
- Cas invalides client: titre trop court/long, content trop long, trop d’images, mauvais type, image trop lourde
- Cas serveur: erreur générique, rate limit si possible, retour unsafe si possible
- `npm run lint`
- `npm run typecheck` si possible sans élargir le scope; sinon lister proprement ce qui bloque. Si npm run tyupecheck pointe vers des erreurs de server-side car tu as été interdis d'y toucher, lister ce qui doit etre changé pour que typeCheck marchent.

Niveau d’autonomie

- Élevé sur la partie client UI
- Autorisé: créer les composants nécessaires, ajouter une dépendance légère de drag and drop, faire l’intégration minimale sur le feed
- Non autorisé: élargir le scope au backend ou nettoyer les incohérences serveur en douce

Si la tâche est ambiguë: Posez des question d'abord pour avoir un meuilleur contexte, et réduire les ambuiguité, pas de code.

- Si un blocage vient d’une incohérence server-side, ne pas élargir le périmètre. Finir le composant au maximum, puis terminer avec une liste courte et précise des corrections serveur que je ferai moi-même.
