"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Bot,
  CircleUserRound,
  LoaderCircle,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useImageColors } from "@/app/hooks/useImageColors";
import type { ProfileData } from "../_actions/getProfile";
import toggleFollow from "../_actions/toggleFollow";
import ModifyProfilDialog from "./ModifyProfilDialog";
import { createOrGetConversation } from "../../messages/_actions/createOrGetConversation";

const DEFAULT_PROFILE_COLORS = [
  "hsl(216 72% 56%)",
  "hsl(198 48% 46%)",
  "hsl(229 38% 34%)",
];

type ProfileHeaderProps = {
  isOwner: boolean;
  isAuthentificated: boolean;
  profile: ProfileData;
};

function ProfileAvatar({
  avatarUrl,
  displayname,
}: {
  avatarUrl: string | null;
  displayname: string;
}) {
  const t = useTranslations("profilePublic");

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={t("avatarAlt", { name: displayname })}
        width={148}
        height={148}
        priority
        className="h-full w-full rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className="flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(47,124,255,0.20))] text-white/70"
      aria-label={t("avatarFallback")}
    >
      <CircleUserRound className="h-14 w-14" />
    </span>
  );
}

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value);
}

function StatItem({
  value,
  label,
  href,
}: {
  value: string;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="block font-sora text-xl font-semibold leading-none text-white sm:text-2xl">
        {value}
      </span>
      <span className="mt-1 block text-xs font-medium uppercase tracking-[0.18em] text-white/48">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl px-3 py-3 text-center transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-2xl px-3 py-3 text-center">{content}</div>;
}

export default function ProfileHeader({
  isOwner,
  isAuthentificated,
  profile,
}: ProfileHeaderProps) {
  const t = useTranslations("profilePublic");
  const tNav = useTranslations("appShell.navigation");
  const locale = useLocale();
  const router = useRouter();
  const imageColors = useImageColors(profile.avatarUrl);
  const palette =
    imageColors.length >= 3 ? imageColors : DEFAULT_PROFILE_COLORS;
  const [isPending, startTransition] = useTransition();
  const [isMessagePending, startMessageTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(profile.isViewerFollowing);
  const [followersCount, setFollowersCount] = useState(
    profile._count.relationWhereUserIsFollowed,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const username = profile.username ?? "";
  const connectionsBaseHref = username
    ? `/profile/${username}/connections`
    : null;
  const accentStyle = {
    "--profile-accent-1": palette[0],
    "--profile-accent-2": palette[1],
    "--profile-accent-3": palette[2],
  } as CSSProperties;

  function handleFollowToggle() {
    if (isOwner || !isAuthentificated || !username || isPending) {
      return;
    }

    const previousFollowing = isFollowing;
    const nextFollowing = !previousFollowing;
    const followerDelta = nextFollowing ? 1 : -1;

    setActionError(null);
    setIsFollowing(nextFollowing);
    setFollowersCount((current) => Math.max(0, current + followerDelta));

    startTransition(async () => {
      const result = await toggleFollow(username);

      if (!result.ok) {
        setIsFollowing(previousFollowing);
        setFollowersCount((current) => Math.max(0, current - followerDelta));
        setActionError(t("actions.followError"));
      }
    });
  }

  function handleStartConversation() {
    if (isOwner || !isAuthentificated || !profile.id || isMessagePending) {
      return;
    }

    setActionError(null);

    startMessageTransition(async () => {
      const result = await createOrGetConversation(profile.id);

      if (!result.ok) {
        setActionError(result.userMsg);
        return;
      }

      router.push(`/messages/${result.conversationId}`);
    });
  }

  return (
    <header className="relative" style={accentStyle}>
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(12,15,22,0.74)] px-4 py-6 shadow-[0_26px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:px-6 sm:py-7 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="pointer-events-none absolute left-1/2 top-14 h-40 w-[125%] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,var(--profile-accent-1),var(--profile-accent-2),var(--profile-accent-3))] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--profile-accent-1),transparent_66%)] opacity-20 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
          <div className="relative shrink-0">
            <div className="absolute inset-[-1.1rem] rounded-full bg-[radial-gradient(circle,var(--profile-accent-1)_0%,var(--profile-accent-2)_42%,transparent_72%)] opacity-55 blur-2xl" />
            <div className="relative h-32 w-32 rounded-full border border-white/20 bg-black/30 p-1 shadow-[0_22px_70px_-24px_rgba(0,0,0,0.95)] ring-1 ring-white/10 sm:h-36 sm:w-36">
              <ProfileAvatar
                avatarUrl={profile.avatarUrl}
                displayname={profile.displayname}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge
                variant="outline"
                className="border-white/10 bg-white/[0.05] text-white/62"
              >
                <Sparkles className="h-3 w-3 text-primary-glow" />
                {isOwner ? t("ownerLabel") : t("profileLabel")}
              </Badge>

              {profile.isPro && (
                <Badge className="border border-primary/30 bg-primary/15 text-primary-glow">
                  <ShieldCheck className="h-3 w-3" />
                  {t("proBadge")}
                </Badge>
              )}

              {profile.isAi && (
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/[0.05] text-white/68"
                >
                  <Bot className="h-3 w-3" />
                  {t("aiBadge")}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <h1 className="truncate font-sora text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  {profile.displayname}
                </h1>
                {username && (
                  <p className="mt-1 truncate text-sm font-medium text-white/52 sm:text-base">
                    @{username}
                  </p>
                )}
              </div>

              <p className="mx-auto max-w-2xl text-sm leading-6 text-white/66 md:mx-0 sm:text-[0.95rem]">
                {profile.bio?.trim() || t("bioFallback")}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-48">
            {isOwner ? (
              <div className="flex gap-2">
                <div className="flex-1 [&>[data-slot=button]]:!static [&>[data-slot=button]]:h-10 [&>[data-slot=button]]:w-full [&>[data-slot=button]]:rounded-full [&>[data-slot=button]]:border [&>[data-slot=button]]:border-white/14 [&>[data-slot=button]]:bg-white/[0.08] [&>[data-slot=button]]:px-5 [&>[data-slot=button]]:text-sm [&>[data-slot=button]]:font-semibold [&>[data-slot=button]]:text-white [&>[data-slot=button]]:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.95)] [&>[data-slot=button]]:backdrop-blur-xl [&>[data-slot=button]]:hover:bg-white/[0.13]">
                  <ModifyProfilDialog profile={profile} />
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full border-white/14 bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white md:hidden"
                >
                  <Link href="/settings" aria-label={tNav("settings")}>
                    <Settings className="h-4.5 w-4.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleFollowToggle}
                  disabled={!isAuthentificated || !username || isPending}
                  className={cn(
                    "h-10 rounded-full border border-primary/40 bg-[linear-gradient(135deg,var(--primary),var(--primary-glow))] px-6 font-semibold text-white shadow-[0_20px_44px_-24px_rgba(47,124,255,0.9)] hover:brightness-110",
                    isFollowing &&
                      "border-white/14 bg-white/[0.08] shadow-[0_18px_42px_-30px_rgba(0,0,0,0.9)] hover:bg-white/[0.13]",
                  )}
                >
                  {isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isFollowing ? t("actions.following") : t("actions.follow")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleStartConversation}
                  disabled={!isAuthentificated || isMessagePending}
                  className="h-10 rounded-full border-white/14 bg-white/[0.04] px-6 text-white/76 hover:bg-white/[0.10] hover:text-white"
                >
                  {isMessagePending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {t("actions.message")}
                </Button>
              </>
            )}

            {actionError && (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {actionError}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-3 gap-2 rounded-[1.5rem] border border-white/10 bg-black/20 p-2 backdrop-blur-xl">
          <StatItem
            value={formatCount(profile._count.post, locale)}
            label={t("stats.posts")}
          />
          <StatItem
            value={formatCount(followersCount, locale)}
            label={t("stats.followers")}
            href={
              connectionsBaseHref
                ? `${connectionsBaseHref}/followers`
                : undefined
            }
          />
          <StatItem
            value={formatCount(
              profile._count.relationWhereUserIsFollower,
              locale,
            )}
            label={t("stats.following")}
            href={
              connectionsBaseHref
                ? `${connectionsBaseHref}/following`
                : undefined
            }
          />
        </div>
      </section>
    </header>
  );
}
