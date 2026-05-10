import { redirect } from "@/i18n/routing";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import MyProgressBar from "./_components/MyProgressBar";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata;

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
  }
  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session?.user.id },
    select: { onboardedStep: true },
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
