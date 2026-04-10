import { getSession } from "@/lib/authSession";
import { redirect } from "@/i18n/routing";
import { myPrisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import StepFinal from "./_components/StepFinal";
import StepTwo from "./_components/StepTwo";
import StepOne from "./_components/StepOne";
import { StepAnimator } from "./_components/StepAnimator";

export default async function OnboardingPage() {
  // Si user a déjà onboarded on l'envoie a feed //
  const locale = await getLocale();
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
  }

  const id = session!.user.id;
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: id },
  });

  if (user?.hasOnboarded) {
    redirect({ href: "/feed", locale });
  }

  const onboardingStep = user?.onboardedStep ?? 0;

  const renderStep = () => {
    switch (onboardingStep) {
      case 0:
        return (
          <StepOne user={session!.user} providerImage={session?.user?.image} />
        );
      case 1:
        return <StepTwo />;
      case 2:
        return <StepFinal />;
    }
  };

  return (
    <section className="w-full">
      {/* On passe le step comme clé à notre animateur */}
      <StepAnimator step={onboardingStep}>{renderStep()}</StepAnimator>
    </section>
  );
}
