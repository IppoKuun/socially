"use client";
import Image, { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import {
  stepFormState,
  stepOneValidOnboarding,
  uploadImage,
  verifyUsername,
} from "../_actions/actions";
import { CircleUserRound, Images } from "lucide-react";
import { useActionState, useState, useRef } from "react";
import { User } from "@/lib/auth";
import { useDebouncedCallback } from "use-debounce";

interface stepOneProps {
  user: User;
  providerImage: string | null | undefined;
}
export default function StepOne({ user, providerImage }: stepOneProps) {
  const highResProviderImage = providerImage?.includes("googleusercontent.com")
    ? providerImage.replace(/=s\d+-c$/, "=s512-c")
    : providerImage;

  const t = useTranslations("onboarding.stepOne");
  const [previewUrl, setPreviewUrl] = useState<string | StaticImageData | null>(
    highResProviderImage ?? null,
  );
  const initialState: stepFormState = { ok: false, userMsg: "" };
  const [state, formAction, isPending] = useActionState(
    stepOneValidOnboarding,
    initialState,
  );
  const [usernameState, userNameAction] = useActionState(
    verifyUsername,
    initialState,
  );

  const initialImageState = { ok: false, userMsg: "" };

  const [uploadProfileState, uploadProfileAction, uploadPending] =
    useActionState(uploadImage, initialImageState);

  const formRef = useRef<HTMLFormElement>(null);

  const debouncedSubmit = useDebouncedCallback(() => {
    // On demande au formulaire de se soumettre
    formRef.current?.requestSubmit();
  }, 2000);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crée une URL locale "blob:" qui ne dure que le temps de la session
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // On  nettoie la mémoire si le composant est démonté
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  return (
    <main className="flex flex-col">
      <form action={formAction} className="flex flex-col items-center">
        <form
          action={uploadProfileAction}
          className="group rounded-full relative cursor-pointer"
        >
          <input
            name="avatar"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadPending}
            type="file"
          ></input>
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={t("avatarAlt")}
              height={256}
              width={256}
              sizes="128px"
              priority
              className="rounded-full w-32 h-32 object-cover "
            ></Image>
          ) : (
            <CircleUserRound
              size={64}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          )}
          {uploadProfileState && (
            <p className="  ">{uploadProfileState.userMsg}</p>
          )}
          {/**VERIFIER QUE l'icone Image sois toujours au hoovers au centre */}
          <Images
            size={30}
            className="opacity-0 absolute top-12 left-12 group-hover:opacity-70 transition-opacity duration-300"
          />
        </form>
        <input
          name="displayname"
          placeholder={t("fields.displayName")}
          className="input-ghost"
        ></input>
        <p className="">{state.errors?.displayName?.join(",")}</p>
        <form action={userNameAction}>
          <input
            name="username"
            placeholder={t("fields.username")}
            defaultValue={user.name ?? ""}
            className="input-ghost"
            onChange={debouncedSubmit}
            // PETIT INDICATIONS VISUEL A METTRE POUR COMPRENDRE QUE ça CHERCHE //
          ></input>
        </form>
        {usernameState && <p className="">{usernameState.userMsg}</p>}
        <p className="">{state.errors?.username?.join(",")}</p>
        <input
          name="bio"
          placeholder={t("fields.bio")}
          className="input-ghost"
        ></input>
        <p className="">{state.errors?.bio?.join(",")}</p>
        <input
          className="input-ghost"
          placeholder={t("fields.occupation")}
          name="occupation"
        ></input>
        <p className="">{state.errors?.occupation?.join(",")}</p>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
