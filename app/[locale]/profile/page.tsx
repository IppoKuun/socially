"use client";
// @ts-nocheck //

import Image, { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import {
  stepFormState,
  stepOneValidOnboarding,
  uploadImage,
  verifyUsername,
} from "../_actions/actions";
import {
  AtSign,
  CircleUserRound,
  Images,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useActionState, useState, useRef } from "react";
import { User } from "@/lib/auth";
import { useDebouncedCallback } from "use-debounce";
import { useImageColors } from "@/app/hooks/useImageColors";
import TextareaAutosize from "react-textarea-autosize";

interface stepOneProps {
  user: User;
  providerImage: string | null | undefined;
}
export default function StepOne({ user, providerImage }: stepOneProps) {
  const [displayname, setDisplayname] = useState<string>("");
  const [username, setUsername] = useState<string>(user.name ?? "");

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
  const [usernameState, userNameAction, userNamePending] = useActionState(
    verifyUsername,
    initialState,
  );

  const initialImageState = { ok: false, userMsg: "" };

  const [uploadProfileState, uploadProfileAction, uploadPending] =
    useActionState(uploadImage, initialImageState);

  const formRef = useRef<HTMLFormElement>(null);
  const usernameSubmitterRef = useRef<HTMLButtonElement>(null);
  const uploadSubmitterRef = useRef<HTMLButtonElement>(null);

  const debouncedUsernameCheck = useDebouncedCallback(() => {
    // UseRef est crucial ici, ont doit prendre la fonction submit du formulaire général,
    // et à la place de submit son action normal, le form Principal vas submit le form de submitter.
    // Et ici submitter pointe vers la serv action de userName, celle qu"on veut submit //

    const form = formRef.current;
    const submitter = usernameSubmitterRef.current;
    if (form && submitter) form.requestSubmit(submitter);
  }, 500);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // On créer une URL de l'image pour pouvoir avoir le src et l'afficher pour la preview direct //
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const form = formRef.current;
    const submitter = uploadSubmitterRef.current;
    if (form && submitter) form.requestSubmit(submitter);
  };

  const isInvalid =
    displayname.trim().length === 0 || username.trim().length < 3 || isPending;

  const colors = useImageColors(
    typeof previewUrl === "string" ? previewUrl : null,
  );
  const bannerColors =
    colors.length > 0
      ? colors
      : ["hsl(221 54% 50%)", "hsl(224 46% 42%)", "hsl(228 38% 34%)"];

  const gradientStyle = {
    background: `
      radial-gradient(circle at 24% 18%, ${bannerColors[0]} 0%, transparent 40%),
      radial-gradient(circle at 78% 18%, ${bannerColors[1]} 0%, transparent 43%),
      radial-gradient(circle at 50% 74%, ${bannerColors[2]} 0%, transparent 52%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 42%)
    `,
  };
  return (
    <main className="">
      <form
        // Obligé de mettre une ref aux formulaire, c'est avec ce formulaire qu'on vas pouvoir submit
        //  les autres serv action sans créer d'autre form ??//
        ref={formRef}
        action={formAction}
        className="relative z-10 flex flex-col rounded-xl items-center "
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/7 bg-white/[0.03] p-8 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] h-[500px] w-full max-w-[700px]">
          {/* ← Couche background colorée */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              ...gradientStyle,
              filter: "blur(84px) saturate(112%)",
              transform: "scale(1.04)",
              opacity: 0.8,
            }}
          />
          {/* Blur + fondu vers ton background #090b10 */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `
                radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 42%),
                linear-gradient(
                  180deg,
                  rgba(9, 11, 16, 0.18) 0%,
                  rgba(9, 11, 16, 0.44) 46%,
                  rgba(9, 11, 16, 0.78) 100%
                )
              `,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              backdropFilter: "blur(28px) saturate(170%)",
              background: `
                  linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.22) 0%,
                    rgba(255, 255, 255, 0.11) 14%,
                    rgba(255, 255, 255, 0.05) 34%,
                    rgba(9, 11, 16, 0.05) 68%,
                    rgba(9, 11, 16, 0.14) 100%
                  )
                `,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.06)",
            }}
          />

          <div className="relative z-30 flex flex-col items-center  gap-3">
            {/* PHOTO DE PROFILE */}
            <div className="group z-10 relative cursor-pointer  rounded-full">
              <label htmlFor="avatar-input" className="cursor-pointer">
                <input
                  id="avatar-input"
                  name="avatar"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadPending}
                  type="file"
                ></input>
                {previewUrl ? (
                  <div className="rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(59,130,246,0.14)_100%)] p-[3px]">
                    <Image
                      src={previewUrl}
                      alt={t("avatarAlt")}
                      height={256}
                      width={256}
                      sizes="128px"
                      priority
                      className="rounded-full w-32 h-32 object-cover border-2 border-black/12 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.75)] "
                    ></Image>
                  </div>
                ) : (
                  <CircleUserRound
                    aria-label={t("avatarAlt")}
                    size={64}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                )}
              </label>
              <button
                ref={uploadSubmitterRef}
                type="submit"
                formAction={uploadProfileAction}
                className="hidden"
                tabIndex={-1}
              />

              {/**VERIFIER QUE l'icone Image sois toujours au hoovers au centre */}
              <Images
                size={30}
                className="absolute top-12 left-12 opacity-0 group-hover:opacity-90 transform transition-opacity duration-300"
              />
            </div>
            {uploadProfileState.userMsg ? (
              <p className="form-error">{uploadProfileState.userMsg}</p>
            ) : null}

            <input
              name="displayname"
              placeholder={t("fields.displayName")}
              value={displayname}
              className={`input-ghost-display w-fit font-bold text-3xl ${
                state.errors?.displayname ? "input-ghost-error" : ""
              }`}
              onChange={(e) => setDisplayname(e.target.value)}
            ></input>
            <p className="form-error">{state.errors?.displayname?.[0]}</p>

            <div className="relative flex w-full justify-center">
              <div className="relative inline-flex items-center justify-center">
                {userNamePending && (
                  <LoaderCircle
                    className="absolute top-1/2 -right-6 -translate-y-1/2 animate-spin text-white/30"
                    size={14}
                  />
                )}
                <AtSign
                  className="absolute top-1/2 -left-4 -translate-y-1/2 text-white/20"
                  strokeWidth={1.25}
                  size={16}
                />
                <input
                  name="username"
                  placeholder={t("fields.username")}
                  value={username}
                  className={`input-ghost input-ghost-left min-w-[12ch] w-auto px-5 font-extralight text-sm ${
                    state.errors?.username
                      ? "input-ghost-error"
                      : "text-muted-foreground/60"
                  }`}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    debouncedUsernameCheck();
                  }}
                  // PETIT INDICATIONS VISUEL A METTRE POUR COMPRENDRE QUE ça CHERCHE //
                />
              </div>
            </div>

            {/*"Bouton caché pour le servAction UserName"*/}
            <button
              ref={usernameSubmitterRef}
              type="submit"
              formAction={userNameAction}
              className="hidden"
            />
            {usernameState.userMsg ? (
              <p
                className={` ${usernameState.ok ? "form-succes" : "form-error"}  `}
              >
                {usernameState.userMsg}
              </p>
            ) : null}
            <p className="form-error">{state.errors?.username?.[0]}</p>
            <div className=" w-full flex flex-col ">
              <label className="ml-35 form-label">Bio</label>
              <TextareaAutosize
                name="bio"
                placeholder={t("fields.bio")}
                maxLength={160}
                maxRows={3}
                className={`input-ghost appearance-none resize-none outline-none ring-0
                 transition-all duration-200 ${state.errors?.bio ? "input-ghost-error" : ""}`}
              />
            </div>

            <p className="form-error">{state.errors?.bio?.[0]}</p>

            <div className=" w-full flex flex-col ">
              <label className="ml-35 form-label">Occupation</label>
              <input
                className={`input-ghost ${
                  state.errors?.occupation ? "input-ghost-error" : ""
                }`}
                placeholder={t("fields.occupation")}
                name="occupation"
              ></input>
            </div>
            <p className="form-error">{state.errors?.occupation?.[0]}</p>

            {state.userMsg ? (
              <p className="form-error">{state.userMsg}</p>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          formAction={formAction}
          className="btn-primary absolute -bottom-0  right-20 sm:left-auto sm:translate-x-0 sm:right-20 "
          disabled={isInvalid}
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
