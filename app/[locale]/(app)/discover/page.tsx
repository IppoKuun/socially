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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const discussionPost = posts.slice(1, 5);

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="space-y-8 ">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <MainPostCard mainPost={mainPost} />
          <CategoryCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.4fr)]">
          <DiscussionPostCard discussionPost={discussionPost} />
          <ProfilCard profiles={profiles} />
        </div>
      </section>
    </AppPageShell>
  );
}
