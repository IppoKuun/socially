import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";
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

async function getViewerProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await myPrisma.userProfile.findFirst({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return null;
  }

  return profile;
}

export default async function DiscoverPage() {
  const t = await getTranslations("appShell.pages.discover");
  const [viewer, candidatesPost, candidatesProfil] = await Promise.all([
    getViewerProfile(),
    getCachedDiscoveryPost(),
    getCachedDiscoveryProfile(),
  ]);

  const [posts, profiles] = await Promise.all([
    getDiscoveryPostForViewer(viewer?.id ?? null, candidatesPost),
    getDiscoveryProfileForViewer(viewer?.id ?? null, candidatesProfil),
  ]);

  const mainPost = posts[0] ?? null;
  const discussionPost = posts.slice(1, 5);

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="space-y-8 ">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <MainPostCard mainPost={mainPost} />
          <CategoryCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,1fr)]  min-w-0">
          <DiscussionPostCard discussionPost={discussionPost} />
          <ProfilCard profiles={profiles} />
        </div>
      </section>
    </AppPageShell>
  );
}
