import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import JsonLd from "@/components/seo/json-ld";
import { makeQueryClient } from "@/lib/query-client";
import getProfilePage, { ProfileData } from "../_actions/getProfile";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProfileHeader from "../components/ProfilHeader";
import ProfileFooter from "../components/ProfileFooter";
import QueryProvider from "@/components/providers/query-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import {
  createPublicPageMetadata,
  getAbsoluteUrl,
  noIndexMetadata,
  truncateDescription,
} from "@/lib/seo";

export type ProfileProps = {
  isOwner: boolean;
  isAuthentificated: boolean;
  profile: ProfileData;
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile/[username]">): Promise<Metadata> {
  const { locale, username } = await params;
  const data = await getProfilePage(username);

  if (!data.ok || !data.profile) {
    return noIndexMetadata;
  }

  const profile = data.profile;
  const publicUsername = profile.username ?? username;
  const t = await getTranslations({ locale, namespace: "seo.profile" });
  const title = t("title", {
    name: profile.displayname,
    username: publicUsername,
  });
  const description = truncateDescription(
    profile.bio ??
      t("description", {
        name: profile.displayname,
        count: profile._count.post,
      }),
  );

  return createPublicPageMetadata({
    title,
    description,
    locale,
    pathname: `/profile/${publicUsername}`,
    images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    type: "profile",
  });
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/[locale]/profile/[username]">) {
  const { locale, username } = await params;
  const queryClient = makeQueryClient();

  const data = queryClient.fetchQuery({
    queryKey: ["profile", username],
    queryFn: () => {
      return getProfilePage(username);
    },
  });

  const { ok, profile, isOwner, isAuthentificated } = (await data) || {};

  if (!ok || !profile) {
    notFound();
  }

  const publicUsername = profile.username ?? username;
  const profileUrl = getAbsoluteUrl(locale, `/profile/${publicUsername}`);
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: profileUrl,
    dateCreated: undefined,
    mainEntity: {
      "@type": "Person",
      name: profile.displayname,
      alternateName: `@${publicUsername}`,
      description: profile.bio ?? undefined,
      image: profile.avatarUrl ?? undefined,
      identifier: profile.id,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/FollowAction",
          userInteractionCount: profile._count.relationWhereUserIsFollowed,
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={profileJsonLd} />
      <AppPageShell
        title={profile.displayname}
        description={`@${publicUsername}`}
        className="max-w-[880px]"
      ></AppPageShell>
      <QueryProvider>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProfileHeader
            key={profile.id}
            isOwner={Boolean(isOwner)}
            profile={profile}
            isAuthentificated={isAuthentificated}
          />
          <ProfileFooter
            profile={profile}
            isAuthenticated={Boolean(isAuthentificated)}
          />
        </HydrationBoundary>
      </QueryProvider>
    </>
  );
}
