import ProfileCard from "@/app/components/ProfileCard";
import { getSession } from "@/lib/authSession";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await getSession();
  if (session) {
    redirect("/feed");
  }
  return (
    <div className="">
      <ProfileCard />
    </div>
  );
}
