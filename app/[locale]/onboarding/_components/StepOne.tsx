"use client";
import Image, { StaticImageData } from "next/image";
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
  const [previewUrl, setPreviewUrl] = useState<string | StaticImageData | null>(
    providerImage ?? null,
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
    <main className="">
      <h1 className="">Créez votre profile</h1>
      <form action={formAction} className="flex flex-col items-center">
        <form
          action={uploadProfileAction}
          className="group rounded-full cursor-pointer"
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
              alt="photo de profil"
              height={45}
              width={50}
              className="rounded-full"
            ></Image>
          ) : (
            <CircleUserRound />
          )}
          {uploadProfileState && (
            <p className="">{uploadProfileState.userMsg}</p>
          )}
          {/**A CHANGER DEMPLACEMENT POUR QUE CA VAS AU CENTRE */}
          <Images className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </form>
        <input name="displayname" className=""></input>
        <p className="">{state.errors?.displayName?.join(",")}</p>
        <form action={userNameAction}>
          <input
            name="username"
            defaultValue={user.name}
            className=""
            onChange={debouncedSubmit}
            // PETIT INDICATIONS VISUEL A METTRE POUR COMPRENDRE QUE ça CHERCHE //
          ></input>
        </form>
        {usernameState && <p className="">{usernameState.userMsg}</p>}
        <p className="">{state.errors?.username?.join(",")}</p>
        <input name="bio" className=""></input>
        <p className="">{state.errors?.bio?.join(",")}</p>
        <input name="occupation"></input>
        <p className="">{state.errors?.occupation?.join(",")}</p>
        <button type="submit" disabled={isPending}>
          Passez a l&aposétape suivante
        </button>
      </form>
    </main>
  );
}
