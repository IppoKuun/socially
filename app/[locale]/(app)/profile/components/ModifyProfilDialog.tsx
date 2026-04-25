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
      avatar: avatarFile ?? undefined,
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
        className="rounded-full border border-white/14 bg-white/[0.08] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl hover:bg-white/[0.13]"
        onClick={() => setOpen(true)}
      >
        Editez votre profile
      </Button>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={cn(
            "w-full max-w-[min(94vw,30rem)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#11151d]/95 p-0 text-white shadow-[0_30px_90px_-45px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
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
          <DialogHeader className="shrink-0 border-b border-white/10 bg-white/[0.03] px-6 py-5">
            <p className="text-lg font-semibold tracking-[-0.02em] text-white">
              Editez votre profile
            </p>
            <p className="text-sm leading-6 text-white/58">
              Modifié votre profil et comment les gens vous voient
            </p>
          </DialogHeader>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col overflow-hidden px-6 py-5"
          >
            {hasServerError && (
              <div className="mb-5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <p>{serverState.userMsg || "Erreur serveur"}</p>
              </div>
            )}
            <div className="space-y-5">
              <div className="space-y-3">
                <label
                  htmlFor="avatar"
                  className="text-sm font-medium text-white/82"
                >
                  Photo de profil
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white/[0.04]",
                      avatarError ? "border-destructive/50" : "border-white/10",
                    )}
                  >
                    {avatarPreviewUrl ? (
                      <Image
                        src={avatarPreviewUrl}
                        height={72}
                        width={72}
                        alt="profil_photo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User2Icon className="h-7 w-7 text-white/45" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isPending}
                      className={cn(
                        "h-9 rounded-full border bg-white/[0.04] px-4 text-white/78 hover:bg-white/[0.09] hover:text-white",
                        avatarError
                          ? "border-destructive/70 focus:border-destructive/70"
                          : "border-white/10 focus:border-primary/60",
                      )}
                    >
                      Changez votre photo de profil
                    </Button>
                    <p className="text-xs leading-5 text-white/42">
                      JPG, PNG ou WebP. Taille max :{" "}
                      {PROFILE_AVATAR_MAX_SIZE / 1000000} Mo.
                    </p>
                  </div>
                </div>
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
              <div className="space-y-2">
                <label
                  htmlFor="displayname"
                  className="text-sm font-medium text-white/82"
                >
                  Nom dutilsateur
                </label>
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
                  className={cn(
                    "h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-primary/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20",
                    displaynameError
                      ? "border-destructive/60 focus:border-destructive/70 focus:ring-destructive/20"
                      : "border-white/10",
                  )}
                ></input>
                {displaynameError && (
                  <p className="text-sm text-destructive">
                    {displaynameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-white/82"
                >
                  Biographie
                </label>
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
                  className={cn(
                    "h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-primary/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20",
                    bioError
                      ? "border-destructive/60 focus:border-destructive/70 focus:ring-destructive/20"
                      : "border-white/10",
                  )}
                ></input>
                {bioError && (
                  <p className="text-sm text-destructive">{bioError}</p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="mt-1 h-10 rounded-full bg-primary px-5 font-semibold text-white shadow-[0_18px_42px_-24px_rgba(47,124,255,0.9)] hover:bg-primary-glow"
              >
                {isPending ? "Enregistrement en cours" : "Enregistré"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
