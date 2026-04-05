import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import MyProgressBar from "./_components/MyProgressBar";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session?.user.id },
  });

  const step = user?.onboardedStep ?? 0;

  return (
    <div className="bg-socially-gradient">
      {/* La barre de progression sait où on en est */}
      <MyProgressBar currentStep={step} />

      {children}
    </div>
  );
}
