"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { markAllNotificationsAsRead } from "../_actions/readNotifs";
import { CheckCheck } from "lucide-react";
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
      type="submit"
      onClick={() => handleButtonClick()}
      className="flex flex-row p-4"
    >
      <CheckCheck />
      Marqué tout comme lu
    </Button>
  );
}
