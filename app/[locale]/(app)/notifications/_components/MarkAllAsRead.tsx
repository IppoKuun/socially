"use client";
import { Button } from "@/components/ui/button";
import { CheckCheck, LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { markAllNotificationsAsRead } from "../_actions/readNotifs";
import { useRouter } from "@/i18n/routing";

export default function MarkAllAsRead() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleButtonClick() {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await markAllNotificationsAsRead();

        if (!result.ok) {
          console.error("Impossible d'effectuez l'action");
          return;
        }

        router.refresh();
      } catch {
        console.error("Impossible d'effectuez l'action");
      }
    });
  }

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() => handleButtonClick()}
      className="h-11 cursor-pointer rounded-full border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white/82 shadow-[0_18px_52px_-40px_rgba(0,0,0,0.95)] transition hover:border-white/16 hover:bg-white/[0.11] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
    >
      {isPending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <CheckCheck className="size-4 text-primary-glow" />
      )}
      Marquer tout comme lu
    </Button>
  );
}
