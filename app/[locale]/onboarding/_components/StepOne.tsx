"use client";
import Image, { StaticImageData } from "next/image";
import {
  stepOneValidOnboarding,
  uploadImage,
  verifyUsername,
} from "../_actions/actions";
import { CircleUserRound, Images } from "lucide-react";
import { useActionState, useState } from "react";
import { User } from "@/lib/auth";

interface stepOneProps {
  user: User;
  providerImage: string | null | undefined;
}
export default function StepOne({ user, providerImage }: stepOneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | StaticImageData | null>(
    providerImage ?? null,
  );
  const initialState = { ok: false, userMsg: "" };
  const [state, formAction, isPending] = useActionState(
    stepOneValidOnboarding,
    initialState,
  );
  const [usernameState, userNameAction, userNamePending] = useActionState(
    verifyUsername,
    initialState,
  );

  const [uploadProfileState, uploadProfileAction, uploadPending] =
    useActionState(uploadImage, initialState);

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
            disabled={userNamePending}
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
          {/**A CHANGER DEMPLACEMENT POUR QIUE CA VAS AU CENTRE */}
          <Images className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </form>
        <input name="username" className=""></input>
        {usernameState && <p className="">{usernameState.userMsg}</p>}

        <input name="displayname" defaultValue={user.name} className=""></input>
        <input name="bio" className=""></input>
        <button type="submit" disabled={isPending}></button>
      </form>
    </main>
  );
}
