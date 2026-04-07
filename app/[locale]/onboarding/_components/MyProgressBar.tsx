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
    <div className="mx-auto mt-4 mb-4 flex w-full max-w-md flex-col">
      <Progress
        value={progressValue}
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/[0.03] 
             [&>div]:bg-gradient-to-r [&>div]:from-[#1D4ED8] [&>div]:via-[#60A5FA] [&>div]:to-[#2F7CFF] 
             [&>div]:shadow-[0_0_20px_rgba(47,124,255,0.4),0_0_40px_rgba(47,124,255,0.2)] 
             [&>div]:transition-all [&>div]:duration-500"
      />
      <span className="rounded-full flex mt-2  w-20 border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-muted">
        {t("stepLabel", { current: currentStep + 1, total: totalSteps })}
      </span>

      <p className="text-center text-2xl font-bold text-white">
        {currentStep === 0 && t("stepOneTitle")}
        {currentStep === 1 && t("stepTwoTitle")}
        {currentStep === 2 && t("stepThreeTitle")}
      </p>
    </div>
  );
}
