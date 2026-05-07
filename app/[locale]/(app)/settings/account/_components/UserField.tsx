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
  const t = useTranslations("settings");
  const locale = useLocale();
  const [servMsg, setServMsg] = useState<string>();
  const [email, setEmail] = useState(userInfo?.user.email ?? "");
  const [isPending, startTransition] = useTransition();

  const fields = [
    {
      label: t("account.fields.displayName"),
      value: userInfo?.userProfile.displayname,
    },
    {
      label: t("account.fields.username"),
      value: getReadableValue(
        userInfo?.userProfile.username,
        t("account.notProvided"),
      ),
    },
    {
      label: t("account.fields.language"),
      value: userInfo?.userProfile.language,
    },
    {
      label: t("account.fields.occupation"),
      value: getReadableValue(
        userInfo?.userProfile.occupation,
        t("account.notProvided"),
      ),
    },
    {
      label: t("account.fields.intent"),
      value: getReadableValue(
        userInfo?.userProfile.intent,
        t("account.notProvided"),
      ),
    },
    {
      label: t("account.fields.createdAt"),
      value: formatDate(userInfo?.userProfile.createdAt, locale),
    },
  ];

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await modifyEmailActions(FormServ, email);
      if (!result.ok) {
        setServMsg(result.userMsg ?? t("account.email.fallbackError"));
        return;
      }
      setServMsg(t("account.email.success"));
    });
  };
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-manrope text-xl font-semibold text-white">
            {t("account.title")}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-white/55">
            {t("account.description")}
          </p>
        </div>

        {userInfo?.userProfile.username && (
          <Button asChild variant="outline" className="py-6">
            <Link href={`/profile/${userInfo?.userProfile.username}`}>
              {t("account.viewProfile")}
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
            <p className="text-sm font-medium text-white">
              {t("account.email.label")}
            </p>
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
            {isPending ? t("account.email.pending") : t("account.email.submit")}
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
