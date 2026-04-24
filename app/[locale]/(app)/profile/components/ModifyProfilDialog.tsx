"use client";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  PROFILE_ACCEPTED_IMAGE_TYPES,
  PROFILE_AVATAR_MAX_SIZE,
  PROFILE_BIO_MAX,
  PROFILE_DISPLAYNAME_MAX,
  PROFILE_DISPLAYNAME_MIN,
} from "@/lib/validations.ts/profile";
import { useTranslations } from "next-intl";
import { useState, useTransition, useMemo, useRef } from "react";
import z from "zod";
import modifyProfil from "../_actions/modifyProfile";
import { useRouter } from "next/navigation";
import { ProfileData } from "../_actions/getProfile";
import Image from "next/image";
import { User2Icon } from "lucide-react";

type LocalErrors = {
  displayname?: string;
  bio?: string;
  avatar?: string;
};

const EMPTY_SERVER_STATE = {
  ok: false,
  userMsg: "",
  errors: undefined,
};

type ServerFieldErrors = {
  displayname?: string[];
  bio?: string[];
  image?: string[];
  avatarUrl?: string[];
};
type ServerState = {
  ok?: boolean;
  userMsg?: string;
  errors?: string[] | ServerFieldErrors;
};

type ProfilProps = {
  profile: ProfileData;
};

export default function ModifyProfilDialog({ profile }: ProfilProps) {
  const t = useTranslations("modifyProfile.compose");
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<LocalErrors>({});
  const [serverState, setServerState] = useState<ServerState>({});
  const [isPending, startTransition] = useTransition();
  const [displayname, setDisplayName] = useState<string>(profile.displayname);
  const [bio, setBio] = useState<string | null>(profile.bio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    profile.avatarUrl,
  );
  const objectUrlRef = useRef<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const profileValidationSchema = useMemo(
    () =>
      z.object({
        displayname: z
          .string()
          .trim()
          .min(PROFILE_DISPLAYNAME_MIN)
          .max(PROFILE_DISPLAYNAME_MAX),

        bio: z.string().trim().max(PROFILE_BIO_MAX),

        avatar: z
          .instanceof(File)
          .refine(
            (file) =>
              PROFILE_ACCEPTED_IMAGE_TYPES.includes(
                file.type as (typeof PROFILE_ACCEPTED_IMAGE_TYPES)[number],
              ),
            "Mauvais image type",
          )
          .refine(
            (file) => file.size <= PROFILE_AVATAR_MAX_SIZE,
            t("Votre fichier est trop gros", {
              max: PROFILE_AVATAR_MAX_SIZE / 1000000,
            }),
          )
          .optional(),
      }),
    [t],
  );
  const resetComposer = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setDisplayName(profile.displayname);
    setBio(profile.bio);
    setAvatarPreviewUrl(profile.avatarUrl);
    setLocalError({});
    setServerState(EMPTY_SERVER_STATE);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const validateDraft = () => {
    const payload = profileValidationSchema.safeParse({
      displayname,
      bio,
      avatar: avatarFile,
    });

    if (payload.success) {
      return {};
    }

    const errors = payload.error.flatten().fieldErrors;

    return {
      displayname: errors.displayname?.[0],
      bio: errors.bio?.[0],
      avatar: errors.avatar?.[0],
    };
  };
  const clearServerState = () => {
    setServerState(EMPTY_SERVER_STATE);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (isPending) {
      return;
    }
    if (!open) {
      clearServerState();
    }
    setOpen(open);
  };

  function handleChangeImage(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    objectUrlRef.current = nextPreviewUrl;

    setAvatarFile(nextFile);
    setAvatarPreviewUrl(nextPreviewUrl);
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    clearServerState();

    const localError = validateDraft();
    setLocalError(localError);

    if (Object.values(localError).some(Boolean)) {
      return;
    }

    const formData = new FormData();

    formData.append("displayname", displayname.trim());

    formData.append("bio", bio?.trim() ?? "");

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    startTransition(async () => {
      try {
        const result = await modifyProfil(EMPTY_SERVER_STATE, formData);
        if (result.ok) {
          resetComposer();
          setOpen(false);
          router.refresh();
          return;
        }

        setServerState(result);
      } catch {
        setServerState({
          ok: false,
          userMsg: t("errors.submitFailed"),
        });
      }
    });
  }
  //??//
  const rawErrors = serverState.errors;
  const hasServerError = Boolean(serverState.userMsg || rawErrors);

  const fieldErrors =
    rawErrors && !Array.isArray(rawErrors) ? rawErrors : undefined;

  const avatarServerError =
    rawErrors && Array.isArray(rawErrors)
      ? rawErrors[0]
      : (rawErrors?.image?.[0] ?? rawErrors?.avatarUrl?.[0]);

  const displaynameError =
    localError.displayname ?? fieldErrors?.displayname?.[0];
  const bioError = localError.bio ?? fieldErrors?.bio?.[0];
  const avatarError = localError.avatar ?? avatarServerError;

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="fixed"
        onClick={() => setOpen(true)}
      >
        Editez votre profile
      </Button>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={cn(
            "w-full max-h-min overflow-hidden ",
            rawErrors && "border-destructive/70 ring-2 ring-destructive/35",
          )}
          onEscapeKeyDown={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (isPending) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader className="shrink-0 border-b p-5">
            <p className="tracking-[0.22em] text-primary-glow font-bold uppercase text-xl">
              Editez votre profile
            </p>
            <p className="">
              Modifié votre profil et comment les gens vous voient
            </p>
          </DialogHeader>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col overflow-hidden"
          >
            {hasServerError && (
              <div className="rounded-2xl border px-4 py-3 text-sm border-destructive/40 bg-destructive/10 text-destructive">
                <p className="">{serverState.userMsg || "Erreur serveur"}</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="">
                <label htmlFor="avatar">Photo de profil</label>
                {avatarPreviewUrl ? (
                  <Image
                    src={avatarPreviewUrl}
                    height={30}
                    width={30}
                    alt="profil_photo"
                  />
                ) : (
                  <User2Icon />
                )}

                <Button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isPending}
                  className={cn(
                    "",
                    avatarError
                      ? "border-destructive/70 focus:border-destructive/70"
                      : "border-white/10 focus:border-primary/60",
                  )}
                >
                  Changez votre photo de profil
                </Button>
                <input
                  ref={avatarInputRef}
                  name="avatar"
                  type="file"
                  accept={PROFILE_ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={(e) => {
                    handleChangeImage(e);
                    clearServerState();

                    setLocalError((current) => ({
                      ...current,
                      avatar: undefined,
                    }));
                  }}
                  className="hidden"
                  disabled={isPending}
                ></input>
                {avatarError && (
                  <p className="text-sm text-destructive">{avatarError}</p>
                )}
              </div>
              <div className="">
                <label htmlFor="displayname">Nom dutilsateur</label>
                <input
                  value={displayname}
                  id="displayname"
                  name="displayname"
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    clearServerState();
                    setLocalError((current) => ({
                      ...current,
                      displayname: undefined,
                    }));
                  }}
                  className=""
                ></input>
                {displaynameError && (
                  <p className="text-sm text-destructive">
                    {displaynameError}
                  </p>
                )}
              </div>
              <div className="">
                <label htmlFor="bio">Biographie</label>
                <input
                  value={bio ?? ""}
                  id="bio"
                  name="bio"
                  onChange={(e) => {
                    setBio(e.target.value);
                    clearServerState();
                    setLocalError((current) => ({
                      ...current,
                      bio: undefined,
                    }));
                  }}
                  className="" // CLASSNAME A CHANGER POUR QUE SI ERR, CLASSNAME DIFF //
                ></input>
                {bioError && (
                  <p className="text-sm text-destructive">{bioError}</p>
                )}
              </div>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Enregistrement en cours" : "Enregistré"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
