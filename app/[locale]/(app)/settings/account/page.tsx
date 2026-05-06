import { getUserInfo } from "@/lib/settings/account/queries";
import { notFound } from "next/navigation";
import UserField from "./_components/UserField";
import UserDeleteArea from "./_components/UserDeleteArea";

export default async function SettingsAccountPage() {
  const userInfo = await getUserInfo();

  if (!userInfo) {
    return notFound();
  }

  //Pas de AppPageShell dans le TSX ici c'est normal //
  return (
    <main className="">
      <UserField userInfo={userInfo} />
      <UserDeleteArea />
    </main>
  );
}
