import { getTranslations } from "next-intl/server";

export default async function MessageEmptyPage() {
  const t = await getTranslations("appShell.pages.messages");

  return (
    <section className="flex min-h-[620px] items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="font-sora text-2xl font-semibold text-white">
          {t("emptySelection.title")}
        </p>
        <p className="text-sm leading-6 text-white/48">
          {t("emptySelection.description")}
        </p>
      </div>
    </section>
  );
}
