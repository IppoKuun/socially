"use client";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileProps } from "../[username]/page";

export default function ProfileHeader({ isOwner }: ProfileProps) {
  const t = useTranslations("profilePublic");

  const tNav = useTranslations("appShell.navigation");

  return (
    <>
      {isOwner && (
        <Link
          href="/settings"
          aria-label={tNav("settings")}
          className="fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[rgba(18,21,28,0.88)] text-white/78 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white md:hidden"
        >
          <Settings className="h-5 w-5" />
        </Link>
      )}
    </>
  );
}
