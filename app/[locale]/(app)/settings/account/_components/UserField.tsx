import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { getUserInfoType } from "@/lib/settings/account/queries";
import modifyEmailActions from "../../_actions/modifyEmail";
import { useState, useTransition } from "react";

type UserFieldProps = {
  userInfo: NonNullable<getUserInfoType>;
};

function formatDate(date: Date | undefined) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getReadableValue(value: string | null | undefined) {
  return value?.trim() ? value : "Non renseigné";
}

type userInfoProps = {
  userInfo: getUserInfoType;
};

const FormServ = { ok: false, userMsg: "" };

export default function UserField({ userInfo }: userInfoProps) {
  const [servMsg, setServMsg] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const fields = [
    { label: "Nom public", value: userInfo?.userProfile.displayname },
    {
      label: "Nom d'utilisateur",
      value: getReadableValue(userInfo?.userProfile.username),
    },
    { label: "Langue", value: userInfo?.userProfile.language },
    {
      label: "Occupation",
      value: getReadableValue(userInfo?.userProfile.occupation),
    },
    {
      label: "Intention",
      value: getReadableValue(userInfo?.userProfile.intent),
    },
    {
      label: "Compte cree le",
      value: formatDate(userInfo?.userProfile.createdAt),
    },
  ];

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await modifyEmailActions(FormServ, email);
      if (!result.ok) {
        setServMsg(
          result.userMsg ??
            "Impossible de modifié votre email veuillez reessayé",
        );
        setServMsg("Email modifié avec succès");
      }
    });
  };
  return (
    <section className="flex flex-col">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-manrope text-xl font-semibold text-white">
            Informations du compte
          </h2>
          <p className="max-w-xl text-sm leading-6 text-white/55">
            Ces informations sont affichees en lecture seule depuis les donnees
            de votre compte et de votre profil.
          </p>
        </div>

        {userInfo?.userProfile.username && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${userInfo?.userProfile.username}`}>
              Voir mon profil
            </Link>
          </Button>
        )}
      </div>
      {servMsg && <p className="">{servMsg}</p>}
      <p className="">Pour modifié les information relatives a votre profile</p>
      <Link href={`/profile/${userInfo?.userProfile.username}`}>
        <Button />
      </Link>
      <Input
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onSubmit={handleSubmit}
        disabled={isPending}
        defaultValue={userInfo?.user.email}
      />

      <dl className="divide-y divide-white/10">
        {fields.map((field) => (
          <div
            key={field.label}
            className="grid gap-1 py-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt className="text-white/45">{field.label}</dt>
            <dd className="break-words font-medium text-white">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
