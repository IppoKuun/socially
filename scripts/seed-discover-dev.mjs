import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run discover dev seed in production.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the discover dev seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const seedProfiles = [
  {
    name: "Julien Martin",
    email: "seed-julien-martin@example.test",
    username: "julien_dev",
    displayname: "Julien Martin",
    occupation: "Frontend developer",
    bio: "Je partage des idees sur React, design systems et interfaces produit.",
    categories: ["TECH", "BUSINESS"],
    avatarUrl:
      "https://res.cloudinary.com/demo/image/upload/w_160,h_160,c_fill/sample.jpg",
  },
  {
    name: "Maya Laurent",
    email: "seed-maya-laurent@example.test",
    username: "maya_studio",
    displayname: "Maya Laurent",
    occupation: "Creative technologist",
    bio: "Entre art numerique, IA creative et experiences interactives.",
    categories: ["CULTURE_ARTS", "TECH"],
    avatarUrl:
      "https://res.cloudinary.com/demo/image/upload/w_160,h_160,c_fill,bo_0px_solid_rgb:ffffff/sample.jpg",
  },
  {
    name: "Nora Benali",
    email: "seed-nora-benali@example.test",
    username: "nora_society",
    displayname: "Nora Benali",
    occupation: "Journaliste tech",
    bio: "J'analyse l'impact social des plateformes et des nouveaux usages.",
    categories: ["SOCIETY", "POLITICS"],
    avatarUrl: null,
  },
  {
    name: "Theo Garnier",
    email: "seed-theo-garnier@example.test",
    username: "theo_motion",
    displayname: "Theo Garnier",
    occupation: "Video producer",
    bio: "Cinema, montage, formats courts et narration visuelle.",
    categories: ["ENTERTAINMENT", "CULTURE_ARTS"],
    avatarUrl: null,
  },
  {
    name: "Lea Moreau",
    email: "seed-lea-moreau@example.test",
    username: "lea_health",
    displayname: "Lea Moreau",
    occupation: "Product manager health",
    bio: "Produit, sante numerique et habitudes durables.",
    categories: ["HEALTH", "BUSINESS"],
    avatarUrl: null,
  },
  {
    name: "Adam Roche",
    email: "seed-adam-roche@example.test",
    username: "adam_sportlab",
    displayname: "Adam Roche",
    occupation: "Coach sportif",
    bio: "Performance, recuperation et data dans le sport amateur.",
    categories: ["SPORTS", "HEALTH"],
    avatarUrl: null,
  },
  {
    name: "Ines Vidal",
    email: "seed-ines-vidal@example.test",
    username: "ines_learn",
    displayname: "Ines Vidal",
    occupation: "Formatrice web",
    bio: "Pedagogie, apprentissage en ligne et progression professionnelle.",
    categories: ["EDUCATION", "TECH"],
    avatarUrl: null,
  },
  {
    name: "Samir Cohen",
    email: "seed-samir-cohen@example.test",
    username: "samir_markets",
    displayname: "Samir Cohen",
    occupation: "Business analyst",
    bio: "Je vulgarise les tendances marche, startups et produits SaaS.",
    categories: ["BUSINESS", "TECH"],
    avatarUrl: null,
  },
];

const seedPosts = [
  {
    authorUsername: "julien_dev",
    title: "Pourquoi les dashboards sociaux deviennent plus visuels",
    slug: "seed-dashboards-sociaux-plus-visuels",
    content:
      "Les utilisateurs scannent les interfaces avant de les lire. Une bonne page Discover doit donc mettre en avant une carte forte, des categories lisibles et des signaux sociaux rapides.",
    imagesUrl: [
      "https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_760/sample.jpg",
    ],
    categories: ["TECH", "BUSINESS"],
  },
  {
    authorUsername: "maya_studio",
    title: "L'IA creative doit-elle ressembler a un outil ou a un studio ?",
    slug: "seed-ia-creative-outil-ou-studio",
    content:
      "Les meilleurs produits creatifs ne se limitent pas a generer un resultat. Ils aident a explorer, comparer, iterer et raconter une intention.",
    imagesUrl: [],
    categories: ["CULTURE_ARTS", "TECH"],
  },
  {
    authorUsername: "nora_society",
    title: "Les reseaux sociaux locaux peuvent-ils redevenir utiles ?",
    slug: "seed-reseaux-sociaux-locaux-utiles",
    content:
      "Entre moderation, confiance et recommandations, les petits espaces communautaires ont peut-etre un avantage que les grandes plateformes ont perdu.",
    imagesUrl: [],
    categories: ["SOCIETY", "POLITICS"],
  },
  {
    authorUsername: "theo_motion",
    title: "Le format court change notre facon de raconter le cinema",
    slug: "seed-format-court-raconter-cinema",
    content:
      "Les createurs decoupent leurs idees autrement : accroche immediate, rythme plus dense, mais besoin d'une direction artistique encore plus claire.",
    imagesUrl: [
      "https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_760/sample.jpg",
    ],
    categories: ["ENTERTAINMENT", "CULTURE_ARTS"],
  },
  {
    authorUsername: "lea_health",
    title: "Les apps sante doivent arreter de culpabiliser les utilisateurs",
    slug: "seed-apps-sante-sans-culpabiliser",
    content:
      "Les bons produits sante accompagnent les habitudes au lieu de punir les ecarts. Le design doit rendre le retour a la routine simple.",
    imagesUrl: [],
    categories: ["HEALTH", "BUSINESS"],
  },
  {
    authorUsername: "adam_sportlab",
    title: "La recuperation devient le vrai sujet des sportifs amateurs",
    slug: "seed-recuperation-sportifs-amateurs",
    content:
      "Sommeil, charge d'entrainement, stress et nutrition : les signaux faibles comptent autant que la seance elle-meme.",
    imagesUrl: [],
    categories: ["SPORTS", "HEALTH"],
  },
  {
    authorUsername: "ines_learn",
    title: "Apprendre le code demande surtout de bons retours",
    slug: "seed-apprendre-code-bons-retours",
    content:
      "Un exercice utile ne donne pas seulement une correction. Il force a expliquer ses choix, repere les raccourcis fragiles et construit une methode.",
    imagesUrl: [],
    categories: ["EDUCATION", "TECH"],
  },
  {
    authorUsername: "samir_markets",
    title: "Les petits SaaS gagnent quand ils reduisent le bruit",
    slug: "seed-petits-saas-reduire-bruit",
    content:
      "Les equipes ne veulent pas plus de graphiques, elles veulent moins d'ambiguite. Une interface dense peut rester calme si les priorites sont nettes.",
    imagesUrl: [],
    categories: ["BUSINESS", "TECH"],
  },
  {
    authorUsername: "julien_dev",
    title: "Design system minimal : ce qu'il faut vraiment standardiser",
    slug: "seed-design-system-minimal-standardiser",
    content:
      "Couleurs, espacements, typographie, radius et etats interactifs suffisent souvent a rendre une application plus coherente sans creer une usine a gaz.",
    imagesUrl: [],
    categories: ["TECH", "EDUCATION"],
  },
  {
    authorUsername: "maya_studio",
    title: "Les categories visuelles aident-elles vraiment la decouverte ?",
    slug: "seed-categories-visuelles-decouverte",
    content:
      "Une categorie bien dessinee agit comme un raccourci mental. L'icone, le label et le contraste doivent donner envie de cliquer sans voler la scene.",
    imagesUrl: [],
    categories: ["CULTURE_ARTS", "TECH"],
  },
  {
    authorUsername: "nora_society",
    title: "La moderation visible peut renforcer la confiance",
    slug: "seed-moderation-visible-confiance",
    content:
      "Les utilisateurs acceptent mieux les regles quand l'interface montre clairement ce qui est protege, signale ou limite.",
    imagesUrl: [],
    categories: ["SOCIETY"],
  },
  {
    authorUsername: "samir_markets",
    title: "Pourquoi les communautes nichees convertissent mieux",
    slug: "seed-communautes-nichees-convertissent-mieux",
    content:
      "Une communaute plus petite mais plus precise cree des discussions plus utiles, des recommandations plus fiables et une meilleure retention.",
    imagesUrl: [],
    categories: ["BUSINESS", "SOCIETY"],
  },
];

function createSeedUserId(username) {
  return `seed_user_${username}`;
}

async function upsertProfiles() {
  const profilesByUsername = new Map();

  for (const seedProfile of seedProfiles) {
    const user = await prisma.user.upsert({
      where: { email: seedProfile.email },
      update: {
        name: seedProfile.name,
        image: seedProfile.avatarUrl,
        AccountType: "public",
      },
      create: {
        id: createSeedUserId(seedProfile.username),
        name: seedProfile.name,
        email: seedProfile.email,
        emailVerified: true,
        image: seedProfile.avatarUrl,
        AccountType: "public",
      },
    });

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        username: seedProfile.username,
        displayname: seedProfile.displayname,
        avatarUrl: seedProfile.avatarUrl,
        bio: seedProfile.bio,
        language: "fr",
        hasOnboarded: true,
        onboardedStep: 3,
        occupation: seedProfile.occupation,
        categories: seedProfile.categories,
        isAi: true,
        deletedAt: null,
      },
      create: {
        userId: user.id,
        username: seedProfile.username,
        displayname: seedProfile.displayname,
        avatarUrl: seedProfile.avatarUrl,
        bio: seedProfile.bio,
        language: "fr",
        hasOnboarded: true,
        onboardedStep: 3,
        occupation: seedProfile.occupation,
        categories: seedProfile.categories,
        isAi: true,
      },
    });

    profilesByUsername.set(seedProfile.username, profile);
  }

  return profilesByUsername;
}

async function upsertPosts(profilesByUsername) {
  const posts = [];

  for (const seedPost of seedPosts) {
    const author = profilesByUsername.get(seedPost.authorUsername);

    if (!author) {
      throw new Error(`Missing author profile: ${seedPost.authorUsername}`);
    }

    const post = await prisma.post.upsert({
      where: { slug: seedPost.slug },
      update: {
        title: seedPost.title,
        content: seedPost.content,
        imagesUrl: seedPost.imagesUrl,
        imagesPublicId: [],
        categories: seedPost.categories,
        moderationStatus: "SAFE",
        deletedAt: null,
        userId: author.id,
      },
      create: {
        title: seedPost.title,
        slug: seedPost.slug,
        content: seedPost.content,
        imagesUrl: seedPost.imagesUrl,
        imagesPublicId: [],
        categories: seedPost.categories,
        moderationStatus: "SAFE",
        userId: author.id,
      },
    });

    posts.push(post);
  }

  return posts;
}

async function upsertLikes(posts, profiles) {
  for (let postIndex = 0; postIndex < posts.length; postIndex += 1) {
    const post = posts[postIndex];
    const likeCount = Math.min((postIndex % 6) + 1, profiles.length - 1);
    const eligibleProfiles = profiles.filter(
      (profile) => profile.id !== post.userId,
    );

    for (let index = 0; index < likeCount; index += 1) {
      const profile =
        eligibleProfiles[(postIndex + index) % eligibleProfiles.length];

      await prisma.postLike.upsert({
        where: {
          user_id_post_id: {
            user_id: profile.id,
            post_id: post.id,
          },
        },
        update: {},
        create: {
          id: createId(),
          user_id: profile.id,
          post_id: post.id,
        },
      });
    }
  }
}

async function createMissingComments(posts, profiles) {
  const commentTemplates = [
    "Sujet interessant, surtout pour tester la page Discover.",
    "Je serais curieux de voir comment la communaute reagit a ca.",
  ];

  for (const post of posts.slice(0, 5)) {
    const commenters = profiles
      .filter((profile) => profile.id !== post.userId)
      .slice(0, commentTemplates.length);

    for (let index = 0; index < commenters.length; index += 1) {
      const content = commentTemplates[index];
      const author = commenters[index];
      const existingComment = await prisma.comment.findFirst({
        where: {
          postId: post.id,
          authorId: author.id,
          content,
        },
        select: { id: true },
      });

      if (!existingComment) {
        await prisma.comment.create({
          data: {
            content,
            moderationStatus: "SAFE",
            postId: post.id,
            authorId: author.id,
          },
        });
      }
    }
  }
}

async function main() {
  const profilesByUsername = await upsertProfiles();
  const profiles = [...profilesByUsername.values()];
  const posts = await upsertPosts(profilesByUsername);

  await upsertLikes(posts, profiles);
  await createMissingComments(posts, profiles);

  console.log(
    `Discover dev seed done: ${profiles.length} profiles, ${posts.length} posts.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
