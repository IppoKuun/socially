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
  // Ont force google a nous donné le provider Image en HIGH resolution, donc 500px ici //
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
    <main className="flex flex-col gap-3 ">
      <form action={formAction} className="flex flex-col gap-3  items-center">
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
              className="rounded-full w-32 h-32 object-cover"
            ></Image>
          ) : (
            <CircleUserRound
              size={64}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          )}
          {uploadProfileState.userMsg ? (
            <p className="">{uploadProfileState.userMsg}</p>
          ) : null}
          {/**VERIFIER QUE l'icone Image sois toujours au hoovers au centre */}
          <Images
            size={30}
            className="opacity-0 absolute top-12 left-12 group-hover:opacity-70 transition-opacity duration-300"
          />
        </form>
        <input
          name="displayname"
          placeholder={t("fields.displayName")}
          className="input-ghost font-bold text-3xl  "
        ></input>
        <p className="">{state.errors?.displayname?.join(",")}</p>
        <form ref={formRef} action={userNameAction}>
          <input
            name="username"
            placeholder={t("fields.username")}
            defaultValue={user.name ?? ""}
            className="input-ghost font-extralight text-sm "
            onChange={debouncedSubmit}
            // PETIT INDICATIONS VISUEL A METTRE POUR COMPRENDRE QUE ça CHERCHE //
          ></input>
        </form>
        {usernameState.userMsg ? (
          <p className="">{usernameState.userMsg}</p>
        ) : null}
        <p className="">{state.errors?.username?.join(",")}</p>
        <input
          name="bio"
          placeholder={t("fields.bio")}
          className="input-ghost   "
        ></input>
        <p className="">{state.errors?.bio?.join(",")}</p>
        <input
          className="input-ghost"
          placeholder={t("fields.occupation")}
          name="occupation"
        ></input>
        <p className="">{state.errors?.occupation?.join(",")}</p>
        {state.userMsg ? <p className="">{state.userMsg}</p> : null}
        <button type="submit" className="btn-primary" disabled={isPending}>
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
