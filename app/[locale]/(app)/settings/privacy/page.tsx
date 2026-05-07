import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function SettingsPrivacyPage() {
  return (
    <section className="flex flex-col">
      <Link href={"/settings/privacy/block"}>
        <Button className="">Voir la liste des bloquées</Button>
      </Link>
    </section>
  );
}
