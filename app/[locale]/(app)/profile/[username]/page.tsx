import AppPageShell from "@/app/[locale]/(app)/_components/app-page-shell";
import { makeQueryClient } from "@/lib/query-client";
import getProfilePage, { ProfileData } from "../_actions/getProfile";
import { notFound } from "next/navigation";
import ProfileHeader from "../components/ProfilHeader";
import ProfileFooter from "../components/ProfileFooter";
import QueryProvider from "@/components/providers/query-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export type ProfileProps = {
  isOwner: boolean;
  isAuthentificated: boolean;
  profile: ProfileData;
};
export default async function PublicProfilePage({
  params,
}: PageProps<"/[locale]/profile/[username]">) {
  const { username } = await params;
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

  return (
    <>
      <AppPageShell
        title={profile.displayname}
        description={`@${profile.username}`}
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
