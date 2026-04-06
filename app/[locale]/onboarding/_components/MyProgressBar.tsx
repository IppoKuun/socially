import { getTranslations } from "next-intl/server";
import { Progress } from "../../../../components/ui/progress";

export default async function MyProgressBar({
  currentStep,
}: {
  currentStep: number;
}) {
  const t = await getTranslations("onboarding.progress");
  const totalSteps = 3;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mx-auto mt-12 mb-8 flex w-full max-w-md flex-col gap-5">
      <div className="flex items-start justify-between gap-4 px-1">
        <h2 className="font-manrope text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">
          {t("title")}
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
          {t("stepLabel", { current: currentStep + 1, total: totalSteps })}
        </span>
      </div>

      <Progress
        value={progressValue}
        className="h-6 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-18px_rgba(47,124,255,0.45)] [&>div]:rounded-full [&>div]:bg-[linear-gradient(90deg,#f8fbff_0%,#a7d2ff_24%,#5ea1ff_58%,#2f7cff_100%)] [&>div]:shadow-[0_0_18px_rgba(47,124,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]"
      />

      <p className="text-center text-2xl font-bold text-white">
        {currentStep === 0 && "Créez votre profile"}
        {currentStep === 1 && "Profil détaillé"}
        {currentStep === 2 && "C'est parti !"}
      </p>
    </div>
  );
}
