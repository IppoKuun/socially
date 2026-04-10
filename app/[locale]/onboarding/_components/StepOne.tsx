"use client";
import Image, { StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import {
  stepFormState,
  stepOneValidOnboarding,
  uploadImage,
  verifyUsername,
} from "../_actions/actions";
import {
  CircleUserRound,
  Images,
  LoaderCircle,
  AtSign,
  Quote,
  User2,
  BriefcaseBusiness,
} from "lucide-react";
import { useActionState, useState, useRef } from "react";
import { User } from "@/lib/auth";
import { useDebouncedCallback } from "use-debounce";
import TextareaAutosize from "react-textarea-autosize";

interface stepOneProps {
  user: User;
  providerImage: string | null | undefined;
}
export default function StepOne({ user, providerImage }: stepOneProps) {
  const [displayname, setDisplayname] = useState<string>(user.name ?? "");
  const [username, setUsername] = useState<string>(user.name ?? "");
  const [bio, setBio] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("");

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

  return (
    <main className="flex flex-col items-center py-4 px-4">
      <form
        ref={formRef}
        action={formAction}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          // La touche entré ne submit plus le form //
          if (e.key !== "Enter") return;
          if (target.tagName === "TEXTAREA") return;

          e.preventDefault();
        }}
        className=" flex flex-col px-4 py-2 rounded-2xl items-center bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]
border border-white/6
backdrop-blur-md

  h-auto w-full max-w-[700px]"
      >
        <div className="group z-10 relative cursor-pointer rounded-full">
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
          <button
            type="button"
            className="absolute bottom-3 right-0 z-10 h-8 w-8 items-center justify-center rounded-full border bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(59,130,246,0.14)_100%)] text-white shadow-[0_10px_30px_rgba(37,99,235,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md transition hover:scale-[1.03] hover:shadow-[0_14px_38px_rgba(37,99,235,0.48),inset_0_1px_0_rgba(255,255,255,0.34)]"
            aria-label={t("avatarButton")}
          ></button>
          {/**VERIFIER QUE l'icone Image sois toujours au hoovers au centre */}
          <Images
            size={15}
            strokeWidth={2}
            className="absolute bottom-5  left-28 z-20  "
          />
        </div>
        {uploadProfileState.userMsg ? (
          <p className="form-error">{uploadProfileState.userMsg}</p>
        ) : null}
        <div className="w-full flex flex-col gap-4 mt-5">
          <div className=" form-field-card relative ">
            <label className="self-start form-field-text form-label">
              {t("fields.displayNameLabel")}
            </label>

            <User2 className="absolute left-5 top-7 " />
            <input
              name="displayname"
              placeholder={t("fields.displayNamePlaceholder")}
              value={displayname}
              className={`input-ghost form-field-control form-field-control-lg form-field-text ${
                state.errors?.displayname ? "input-ghost-error" : ""
              }`}
              onChange={(e) => setDisplayname(e.target.value)}
            ></input>
          </div>
          <p className="form-error">{state.errors?.displayname?.[0]}</p>

          <div className="relative form-field-card">
            {userNamePending && (
              <LoaderCircle
                className="absolute z-50 right-5 top-10 -translate-y-1/2 animate-spin text-white/30"
                size={26}
              />
            )}
            <label className="self-start form-field-text form-label">
              {t("fields.usernameLabel")}
            </label>

            <AtSign className="absolute left-5 top-7" />
            <input
              name="username"
              placeholder={t("fields.username")}
              value={username}
              className={`input-ghost form-field-control form-field-text font-extralight text-sm ${
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
          <div className=" form-field-card form-field-card-bio relative ">
            <Quote className="absolute left-5 top-7" />
            <label className="form-label form-field-text">
              {t("fields.bioLabel")}
            </label>
            <TextareaAutosize
              name="bio"
              placeholder={t("fields.bio")}
              value={bio}
              maxLength={160}
              maxRows={3}
              className={`form-field-control form-field-text form-field-textarea text-sm appearance-none resize-none outline-none ring-0
                           transition-all duration-200 ${state.errors?.bio ? "input-ghost-error" : ""}`}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <p className="form-error">{state.errors?.bio?.[0]}</p>
          <div className=" form-field-card relative ">
            <label className="form-field-text form-label">
              {t("fields.occupationLabel")}
            </label>
            <BriefcaseBusiness className="absolute left-5 top-7" />
            <input
              value={occupation}
              className={`input-ghost form-field-control form-field-text ${
                state.errors?.occupation ? "input-ghost-error" : ""
              }`}
              placeholder={t("fields.occupation")}
              name="occupation"
              onChange={(e) => setOccupation(e.target.value)}
            ></input>
          </div>
          <p className="form-error">{state.errors?.occupation?.[0]}</p>

          {state.userMsg ? <p className="form-error">{state.userMsg}</p> : null}
        </div>
        <button
          type="submit"
          formAction={formAction}
          className="btn-primary mt-4 self-center md:absolute md:bottom-3 md:-right-80"
          disabled={isInvalid}
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
