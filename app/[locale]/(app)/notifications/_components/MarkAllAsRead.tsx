import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { markAllNotificationsAsRead } from "../_actions/readNotifs";
import { Result } from "pg";

export default function MarkAllAsRead() {
  const [isPending, startTransition] = useTransition();
  const [servMsg, setServMsg] = useState<string>("");

  function handleButtonClick() {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await markAllNotificationsAsRead();

        if (!result.ok) {
          setServMsg("Impossible d'effectuez l'actions veuillez réessayé");
          return;
        }
      } catch {
        setServMsg("Impossible d'effectuez l'actions veuillez réessayé");
      }
    });
  }

  return (
    <Button type="submit" onClick={handleButtonClick} className="">
      Marqué tout comme lu
    </Button>
  );
}
