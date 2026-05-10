"use client";

import { useRouter } from "@/i18n/routing";
import { signOut } from "@/lib/authClient";
import softDeleteAction from "../[locale]/(app)/settings/_actions/softDelete";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function RestoreAccountModal() {
  const t = useTranslations("appShell.pages.settings");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRestore = () => {
    startTransition(async () => {
      const result = await softDeleteAction();
      if (!result.ok) {
        toast.error(result.userMsg);
      }
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const result = await signOut();

    if (result.error) {
      setIsSigningOut(false);
      toast.error(t("restoreAccount.signOutError"));
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-8 border border-neutral-800 text-center">
        <h2 className="text-2xl font-bold">{t("restoreAccount.title")}</h2>
        <p className="mt-4 text-neutral-400">
          {t("restoreAccount.description")}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleRestore}
            disabled={isPending}
            className="w-full rounded-full bg-white py-3 font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            {isPending
              ? t("restoreAccount.restorePending")
              : t("restoreAccount.restore")}
          </button>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm text-neutral-500 hover:underline"
          >
            {isSigningOut
              ? t("restoreAccount.signOutPending")
              : t("restoreAccount.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
