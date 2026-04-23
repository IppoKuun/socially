"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Image from "next/image";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { z } from "zod";
import createPost from "@/app/actions/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  POST_ACCEPTED_IMAGE_TYPES,
  POST_IMAGE_MAX_COUNT,
  POST_IMAGE_MAX_SIZE,
} from "@/lib/validations.ts/post";
import { ImagePlus, LoaderCircle, Plus, Upload, X } from "lucide-react";

type ClientImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ServerFieldErrors = {
  title?: string[];
  content?: string[];
  imagesUrl?: string[];
};

type CreatePostResult = {
  ok: boolean;
  userMsg?: string;
  errors?: string[] | ServerFieldErrors;
  reasons?: string;
  unsafeImages?: number[];
};

type LocalErrors = {
  title?: string;
  content?: string;
  images?: string;
};

export const INITIAL_ACTION_STATE = {
  ok: false,
  userMsg: "",
};

const EMPTY_SERVER_STATE: CreatePostResult = {
  ok: false,
  userMsg: "",
  errors: undefined,
  reasons: "",
  unsafeImages: [],
};

function getFieldErrors(errors?: CreatePostResult["errors"]) {
  if (!errors || Array.isArray(errors)) {
    return undefined;
  }

  return errors;
}

function getImageServerError(errors?: CreatePostResult["errors"]) {
  if (!errors) {
    return undefined;
  }

  if (Array.isArray(errors)) {
    return errors[0];
  }

  return errors.imagesUrl?.[0];
}

function getDropzoneErrorMessage(
  rejection: FileRejection,
  messages: {
    invalidType: string;
    fileTooLarge: string;
    maxImages: string;
  },
) {
  const firstError = rejection.errors[0];

  if (!firstError) {
    return messages.invalidType;
  }

  switch (firstError.code) {
    case "file-too-large":
      return messages.fileTooLarge;
    case "too-many-files":
      return messages.maxImages;
    case "file-invalid-type":
    default:
      return messages.invalidType;
  }
}

export default function CreatePostComposer() {
  const t = useTranslations("post.compose");
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ClientImage[]>([]);
  const [localErrors, setLocalErrors] = useState<LocalErrors>({});
  const [serverState, setServerState] =
    useState<CreatePostResult>(EMPTY_SERVER_STATE);
  const [isPending, startTransition] = useTransition();
  const imagesRef = useRef<ClientImage[]>([]);

  // Ont fait un UseMemo pour les err client car ont veut que next ne recalcule plus a chaque fois le schema ZOD
  // A part quand user change de langue //
  const validationSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .trim()
          .min(1, t("errors.titleRequired"))
          .min(3, t("errors.titleMin"))
          .max(100, t("errors.titleMax")),
        content: z.string().max(500, t("errors.contentMax")),
        images: z
          .array(
            z
              .instanceof(File)
              .refine(
                (file) =>
                  POST_ACCEPTED_IMAGE_TYPES.includes(
                    file.type as (typeof POST_ACCEPTED_IMAGE_TYPES)[number],
                  ),
                t("errors.imageType"),
              )
              .refine(
                (file) => file.size <= POST_IMAGE_MAX_SIZE,
                t("errors.imageSize", {
                  max: POST_IMAGE_MAX_SIZE / 1_000_000,
                }),
              ),
          )
          .max(
            POST_IMAGE_MAX_COUNT,
            t("errors.imagesMax", { max: POST_IMAGE_MAX_COUNT }),
          ),
      }),
    [t],
  );

  const dropzoneMessages = useMemo(
    () => ({
      invalidType: t("errors.imageType"),
      fileTooLarge: t("errors.imageSize", {
        max: POST_IMAGE_MAX_SIZE / 1_000_000,
      }),
      maxImages: t("errors.imagesMax", { max: POST_IMAGE_MAX_COUNT }),
    }),
    [t],
  );

  const fieldErrors = getFieldErrors(serverState.errors);
  const isUnsafe = Boolean(serverState.reasons);
  const unsafeImageIndexes = new Set(serverState.unsafeImages ?? []);

  // Les 2 useEffect si dessous permettent de bien revoké les URL de tout les images
  // On a besoin des URLs qu'on stocke en mémoire du naviguateur pour afficher les images
  // Mais ont doit obligatoirement les supprimer car sinon la Mémoire s'accumule, la naviguateur rame et plante.
  // Le premier useeffect est juste la pour que la refImages est bien égales a celui de notre state
  // Le 2eme est la pour revoké les URLs de tout les images.
  // On utilise les useRef sur les images car, si on utilise le useState Images.
  // Au début du 2eme UseEffect le useState Images sera vide, et meme si on ajoute des images, le return prendra en compte que la valeur de départ
  // Alors que la reference de l'images lui capture la "boite" image et pas sa valeur  //
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  const clearServerState = useCallback(() => {
    setServerState(EMPTY_SERVER_STATE);
  }, []);

  const resetComposer = useCallback(() => {
    imagesRef.current.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setTitle("");
    setContent("");
    setImages([]);
    setLocalErrors({});
    setServerState(EMPTY_SERVER_STATE);
  }, []);

  // Ont mets cette fonction en UseCallback car elle est appelée par handleSubmit, et pour évitez que la fonction
  // Est appelée par handleSubmit a chaque rerender, ont lui dit qu'elle doit etre appelé que par certaines condition
  // Meme si ici l'impact est quasi null car user vas constamment appeler les valeurs dans le tab de dépendances du useCallback  //
  const validateDraft = useCallback(() => {
    const result = validationSchema.safeParse({
      title,
      content,
      images: images.map((image) => image.file),
    });

    if (result.success) {
      return {};
    }

    const errors = result.error.flatten().fieldErrors;

    return {
      title: errors.title?.[0],
      content: errors.content?.[0],
      images: errors.images?.[0],
      // satisfies car je veux que TS m'indique si y'a une probable err de type //
    } satisfies LocalErrors;
  }, [content, images, title, validationSchema]);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Si pending, impossible de fermer la modale  //
      if (isPending) {
        return; // Avvec le return JS s'arrete de lire la fonction et s'en vas //
      }

      if (!nextOpen) {
        setLocalErrors({});
        clearServerState();
      }

      setOpen(nextOpen);
    },
    [clearServerState, isPending],
  );

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      clearServerState();
      setLocalErrors((current) => ({ ...current, images: undefined })); // Ont supprime que les errors liée a l'image //
      setImages((current) => {
        const target = current.find((image) => image.id === imageId);

        if (target) {
          URL.revokeObjectURL(target.previewUrl);
        }

        return current.filter((image) => image.id !== imageId); // Ont return que les images qui ne sont pas l'ID de ce que user a supprimé //
      });
    },
    [clearServerState],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      clearServerState();

      if (fileRejections.length > 0) {
        setLocalErrors((current) => ({
          ...current,
          images: getDropzoneErrorMessage(fileRejections[0], dropzoneMessages),
        }));
      } else {
        setLocalErrors((current) => ({ ...current, images: undefined }));
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      if (images.length + acceptedFiles.length > POST_IMAGE_MAX_COUNT) {
        // Si le nombre d'image en State et image qui vient d'etre upload => 10 error //

        setLocalErrors((current) => ({
          ...current,
          images: t("errors.imagesMax", { max: POST_IMAGE_MAX_COUNT }),
        }));
        return;
      }

      const nextImages = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setImages((current) => [...current, ...nextImages]);
    },
    [clearServerState, dropzoneMessages, images.length, t],
  );

  const acceptedFormats = Object.fromEntries(
    POST_ACCEPTED_IMAGE_TYPES.map((type) => [type, []]),
  );

  const dropzoneOptions = {
    accept: acceptedFormats,
    maxSize: POST_IMAGE_MAX_SIZE,
    onDrop: onDrop,
    disabled: isPending,
    multiple: true,
    noClick: true, // Empeche l'ouverture auto au clic (on gère manuellement)
  };

  // Destructuration : Ont extrait chaque element que useDropZone nous renvoie //
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone(dropzoneOptions);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      clearServerState();

      const nextLocalErrors = validateDraft();
      setLocalErrors(nextLocalErrors);

      // Ont regarde les valeur, et si une est truth ( donc une err ) on cancel tout
      if (Object.values(nextLocalErrors).some(Boolean)) {
        return;
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content);
      formData.append("language", locale);

      images.forEach((image) => {
        formData.append("images", image.file);
      });

      startTransition(async () => {
        try {
          const result = (await createPost(
            INITIAL_ACTION_STATE,
            formData,
          )) as CreatePostResult;

          if (result.ok) {
            resetComposer();
            setOpen(false);
            router.refresh();
            return;
          }

          setServerState({
            ok: false,
            userMsg: result.userMsg ?? "",
            errors: result.errors,
            reasons: result.reasons ?? "",
            unsafeImages: result.unsafeImages ?? [],
          });
        } catch {
          setServerState({
            ok: false,
            userMsg: t("errors.submitFailed"),
            errors: undefined,
            reasons: "",
            unsafeImages: [],
          });
        }
      });
    },
    [
      clearServerState,
      content,
      images,
      locale,
      resetComposer,
      router,
      title,
      t,
      validateDraft,
    ],
  );

  const titleError = localErrors.title ?? fieldErrors?.title?.[0];
  const contentError = localErrors.content ?? fieldErrors?.content?.[0];
  const imagesError =
    localErrors.images ?? getImageServerError(serverState.errors);

  return (
    <>
      <Button
        type="button"
        size="lg"
        className={cn(
          "fixed right-4 sm:bottom-4 bottom-40 z-41 h-14 cursor-pointer max-h-[92svh] rounded-full border border-white/10 bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] px-4 text-white shadow-[0_28px_60px_-28px_rgba(47,124,255,0.92)] hover:opacity-95 sm:right-6 sm:bottom-6",
          open && "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-5" />
        <span className="hidden sm:inline">{t("floatingButton.desktop")}</span>
        <span className="sr-only sm:hidden">{t("floatingButton.mobile")}</span>
      </Button>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={cn(
            "w-full max-h-[90svh] max-w-[calc(100%-1rem)] overflow-hidden sm:max-w-3xl p-0 gap-0",
            isUnsafe && "border-destructive/70 ring-2 ring-destructive/35",
          )}
          // Impossible de sortir du formulaire si isPending//
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
          <DialogHeader className="shrink-0 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-glow">
                  Socially
                </p>
                <DialogTitle className="font-manrope text-[1.8rem] leading-none text-white sm:text-[2.1rem]">
                  {t("dialog.title")}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-6 text-text-muted sm:text-[0.95rem]">
                  {t("dialog.description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
              {(serverState.userMsg || serverState.reasons) && (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm",
                    isUnsafe
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-white/10 bg-white/[0.03] text-text-muted",
                  )}
                >
                  {serverState.userMsg && (
                    <p
                      className={cn(
                        "font-medium",
                        isUnsafe && "text-destructive",
                      )}
                    >
                      {serverState.userMsg}
                    </p>
                  )}
                  {serverState.reasons && (
                    <p className="mt-1 leading-6 text-white/78">
                      {serverState.reasons}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 ">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="post-title"
                    className="text-sm font-medium text-white/85"
                  >
                    {t("dialog.titleLabel")}
                  </label>
                  <span className="text-xs text-white/35">
                    {t("dialog.titleCount", { count: title.trim().length })}
                  </span>
                </div>
                <input
                  id="post-title"
                  name="title"
                  value={title}
                  onChange={(event) => {
                    clearServerState();
                    // A chaque fois qu'une input est tapé son err devient undefined pour que que user puisse corrigé sans se faire agressé //
                    setLocalErrors((current) => ({
                      ...current,
                      title: undefined,
                    }));
                    setTitle(event.target.value);
                  }}
                  placeholder={t("dialog.titlePlaceholder")}
                  className={cn(
                    "w-full rounded-2xl border bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/24",
                    titleError
                      ? "border-destructive/70 focus:border-destructive/70"
                      : "border-white/10 focus:border-primary/60",
                  )}
                  disabled={isPending}
                  maxLength={100}
                />
                {titleError && (
                  <p className="text-sm text-destructive">{titleError}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="post-content"
                    className="text-sm font-medium text-white/85"
                  >
                    {t("dialog.contentLabel")}
                  </label>
                  <span className="text-xs text-white/35">
                    {t("dialog.contentCount", { count: content.length })}
                  </span>
                </div>
                <textarea
                  id="post-content"
                  name="content"
                  value={content}
                  onChange={(event) => {
                    clearServerState();
                    setLocalErrors((current) => ({
                      ...current,
                      content: undefined,
                    }));
                    setContent(event.target.value);
                  }}
                  placeholder={t("dialog.contentPlaceholder")}
                  className={cn(
                    "min-h-36 w-full resize-y rounded-2xl border bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/24",
                    contentError
                      ? "border-destructive/70 focus:border-destructive/70"
                      : "border-white/10 focus:border-primary/60",
                  )}
                  disabled={isPending}
                  maxLength={500}
                />
                {contentError && (
                  <p className="text-sm text-destructive">{contentError}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white/85">
                    {t("dialog.imagesLabel")}
                  </p>
                  <p className="text-sm leading-6 text-white/45">
                    {t("dialog.imagesHint", {
                      max: POST_IMAGE_MAX_COUNT,
                      size: POST_IMAGE_MAX_SIZE / 1_000_000,
                    })}
                  </p>
                </div>

                <div
                  {...getRootProps()}
                  className={cn(
                    "rounded-[26px]   border border-dashed bg-white/[0.02] p-4  transition",
                    isDragActive
                      ? "border-primary/70 bg-primary/10"
                      : "border-white/10",
                    imagesError && "border-destructive/60",
                  )}
                >
                  <input {...getInputProps()} name="images" />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75">
                        {isDragActive ? (
                          <Upload className="size-5" />
                        ) : (
                          <ImagePlus className="size-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          {isDragActive
                            ? t("dialog.dropzoneActive")
                            : t("dialog.dropzoneIdle")}
                        </p>
                        <p className="text-sm text-white/45">
                          {t("dialog.imagesCount", {
                            count: images.length,
                            max: POST_IMAGE_MAX_COUNT,
                          })}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                      onClick={openFilePicker}
                      disabled={isPending}
                    >
                      <Plus className="size-4" />
                      {t("dialog.dropzoneAction")}
                    </Button>
                  </div>
                </div>

                {imagesError && (
                  <p className="text-sm text-destructive">{imagesError}</p>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => {
                      const isUnsafeImage = unsafeImageIndexes.has(index);

                      return (
                        <div
                          key={image.id}
                          className={cn(
                            "group relative overflow-hidden rounded-[24px] border bg-black/20",
                            isUnsafeImage
                              ? "border-destructive/70 shadow-[0_0_0_1px_rgba(239,68,68,0.18)]"
                              : "border-white/10",
                          )}
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={image.previewUrl}
                              alt={t("dialog.previewAlt", { index: index + 1 })}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 640px) 45vw, 180px"
                            />
                          </div>

                          <button
                            type="button"
                            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white transition hover:bg-black/75"
                            onClick={() => handleRemoveImage(image.id)}
                            disabled={isPending}
                            aria-label={t("dialog.removeImage", {
                              index: index + 1,
                            })}
                          >
                            <X className="size-4" />
                          </button>

                          {isUnsafeImage && (
                            <div className="absolute inset-x-2 bottom-2 rounded-xl border border-destructive/40 bg-black/70 px-2.5 py-2 text-xs text-destructive">
                              {t("dialog.unsafeBadge")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-white/42">
                {t("dialog.footerHint", {
                  max: POST_IMAGE_MAX_COUNT,
                })}
              </p>

              <Button
                type="submit"
                size="lg"
                className="shrink-0  h-12 min-w-32 rounded-2xl bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95 disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    {t("dialog.submitting")}
                  </>
                ) : (
                  t("dialog.submit")
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
