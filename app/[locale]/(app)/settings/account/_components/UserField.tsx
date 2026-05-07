"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { getUserInfoType } from "@/lib/settings/account/queries";
import modifyEmailActions from "../../_actions/modifyEmail";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

function formatDate(date: Date | undefined, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getReadableValue(value: string | null | undefined, fallback: string) {
  return value?.trim() ? value : fallback;
}

type userInfoProps = {
  userInfo: getUserInfoType;
};

const FormServ = { ok: false, userMsg: "" };

export default function UserField({ userInfo }: userInfoProps) {
  const t = useTranslations("appShell.pages.settings.account");
  const locale = useLocale();
  const [servMsg, setServMsg] = useState<string>(userInfo?.user.email ?? "");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const fields = [
    {
      label: t("fields.displayName"),
      value: userInfo?.userProfile.displayname,
    },
    {
      label: t("fields.username"),
      value: getReadableValue(userInfo?.userProfile.username, t("notProvided")),
    },
    { label: t("fields.language"), value: userInfo?.userProfile.language },
    {
      label: t("fields.occupation"),
      value: getReadableValue(
        userInfo?.userProfile.occupation,
        t("notProvided"),
      ),
    },
    {
      label: t("fields.intent"),
      value: getReadableValue(userInfo?.userProfile.intent, t("notProvided")),
    },
    {
      label: t("fields.createdAt"),
      value: formatDate(userInfo?.userProfile.createdAt, locale),
    },
  ];

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await modifyEmailActions(FormServ, email);
      if (!result.ok) {
        setServMsg(result.userMsg ?? t("email.fallbackError"));
      }
      setServMsg(t("email.success"));
    });
  };
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-manrope text-xl font-semibold text-white">
            {t("title")}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-white/55">
            {t("description")}
          </p>
        </div>

        {userInfo?.userProfile.username && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${userInfo?.userProfile.username}`}>
              {t("viewProfile")}
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
        {servMsg && (
          <p className="mb-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70">
            {servMsg}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-white">{t("email.label")}</p>
            <Input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? t("email.pending") : t("email.submit")}
          </Button>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-white/10">
        {fields.map((field) => (
          <div
            key={field.label}
            className="grid gap-1 py-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt className="text-white/45">{field.label}</dt>
            <dd className="break-words font-medium text-white">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
