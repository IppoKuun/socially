"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Bell,
  CircleUserRound,
  Compass,
  House,
  MessageCircleMore,
  MessageSquarePlus,
  Settings,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import sociallyWhiteLogo from "@/public/socially_white.png";

type NavigationUser = {
  avatarUrl: string | null;
  displayName: string;
  username: string;
};

type NavigationItem = {
  href: string;
  // typage d'icone spécial pour que TS comprenne qu'on puisse modifié l'icone
  // Et nous aider avec l'autocomplétion //
  icon: LucideIcon;
  key:
    | "home"
    | "discover"
    | "trending"
    | "notif"
    | "message"
    | "feedback"
    | "settings";
};

const desktopItems: NavigationItem[] = [
  { href: "/feed", icon: House, key: "home" },
  { href: "/discover", icon: Compass, key: "discover" },
  { href: "/trending", icon: TrendingUp, key: "trending" },
  { href: "/notifications", icon: Bell, key: "notif" },
  { href: "/messages", icon: MessageCircleMore, key: "message" },
  { href: "/feedback", icon: MessageSquarePlus, key: "feedback" },
  { href: "/settings", icon: Settings, key: "settings" },
];

const mobileItems = desktopItems.filter((item) => item.key !== "feedback");

// Fonction qui vas nous etre utile pour surligné la navigation courante //
function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserAvatar({
  avatarUrl,
  displayName,
  className,
}: {
  avatarUrl: string | null;
  displayName: string;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        width={40}
        height={40}
        // cn ici sert a fusionné intélligement 2 classes. Ont mets notre classe de base
        // Et quand useAvater sera appelé, ont pourra le modifié comme ont veut. //
        className={cn(
          "h-10 w-10 rounded-xl object-cover ring-4 ring-white/10",
          className,
        )}
      />
    );
  }
  // Si user n'as pas de avatar, ont lui une icone Avatar lucide react //
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(47,124,255,0.16))] text-white/70",
        className,
      )}
      aria-hidden="true"
    >
      <CircleUserRound className="h-5 w-5" />
    </span>
  );
}

export function DesktopAppSidebar({ user }: { user: NavigationUser }) {
  const pathname = usePathname();
  const tNav = useTranslations("appShell.navigation");
  const tShell = useTranslations("appShell");

  return (
    <Sidebar className="sticky top-0 border-white/6 bg-[#17181d]">
      <SidebarHeader className="px-6 pb-6 pt-8">
        <Link
          href="/feed"
          className="inline-flex w-fit items-center "
          aria-label={tShell("brandAlt")}
        >
          <Image
            src={sociallyWhiteLogo}
            alt={tShell("brandAlt")}
            priority
            className="h-auto w-auto w-38"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu>
            {desktopItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(pathname, item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild active={isActive}>
                    {/*Le asChild ici veut dire qu'on ne prends pas l'élément HTML par défault 
                    de la balise HTML mais la balise enfant, ici en l'occurence, le Link
                    */}

                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                      <span>{tNav(item.key)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-5 pt-4">
        <Separator className="bg-white/6" />
        <Link
          href="/profile"
          className={cn(
            "mt-4 flex items-center gap-3 rounded-2xl px-3 py-3 transition outline-none hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",

            // La classeName de base est tjr présente, mais bg-white uniquement si isActivePath est true //
            isActivePath(pathname, "/profile") && "bg-white/[0.04]",
          )}
        >
          <UserAvatar
            avatarUrl={user.avatarUrl}
            displayName={user.displayName}
          />
          <span className="w-full">
            <span className="block truncate text-sm font-semibold text-white">
              {user.displayName}
            </span>
            <span className="block truncate text-xs text-white/48">
              @{user.username}
            </span>
          </span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();
  const tNav = useTranslations("appShell.navigation");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[rgba(11,12,16,0.96)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 backdrop-blur-xl md:hidden">
      {/** pb-[calc(env(safe-area-inset-bottom)+0.55rem)] Cette valeur est faitent pour les téléphone qui n'ont
       * Pas de bouton physique homme et ont également une bottome bar de naviguation, c'est fait pour évitez confusion
       * et chevauchement des 2 barre
       */}
      <ul className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-15 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[0.66rem] font-medium transition",
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/52 hover:bg-white/[0.03] hover:text-white/80",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tNav(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
