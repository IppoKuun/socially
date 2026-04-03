import ProfileCard from "@/app/components/ProfileCard";
import { getSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import { myPrisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  // Si user a déjà onboarded on l'envoie a feed //
  const session = await getSession();
  if (session) {
    const id = session.user.id;
    const user = await myPrisma.userProfile.findUnique({
      where: { userId: id },
    });

    if (user?.hasOnboarded) {
      redirect("/feed");
    }
    const onboardingStep = user?.onboardedStep;
  }
  return (
    <div className="">
      <ProfileCard />
    </div>
  );
}
