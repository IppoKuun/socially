import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
import PagePlaceholderCard from "../_components/page-placeholder-card";
import { myPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import {
  getCachedDiscoveryPost,
  getCachedDiscoveryProfile,
  getDiscoveryPostForViewer,
  getDiscoveryProfileForViewer,
} from "@/lib/discover/queries";
import MainPostCard from "./_components/MainPostCard";
import CategoryCard from "./_components/CategoryCard";
import DiscussionPostCard from "./_components/DiscussionPostCard";
import ProfilCard from "./_components/ProfileCard";

async function requireViewerProfile() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const profile = await myPrisma.userProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
}

export default async function DiscoverPage() {
  const t = await getTranslations("appShell.pages.discover");
  const [viewer, candidatesPost, candidatesProfil] = await Promise.all([
    requireViewerProfile(),
    getCachedDiscoveryPost(),
    getCachedDiscoveryProfile(),
  ]);

  const [posts, profiles] = await Promise.all([
    getDiscoveryPostForViewer(viewer.id, candidatesPost),
    getDiscoveryProfileForViewer(viewer.id, candidatesProfil),
  ]);

  const mainPost = posts[0] ?? null;
  const discussionPost = posts.slice(1, 4);

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <PagePlaceholderCard message={t("placeholder")} />
      <section className="flex flex-col">
        <div className="flex flex-row">
          <MainPostCard mainPost={mainPost} />
          <CategoryCard />
        </div>
        <div className="flex flex-col">
          <DiscussionPostCard discussionPost={discussionPost} />
          <ProfilCard profiles={profiles} />
        </div>
      </section>
    </AppPageShell>
  );
}
