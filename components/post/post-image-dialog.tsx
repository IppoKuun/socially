"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PostImageDialogProps = {
  images: string[];
  postTitle: string;
  openIndex: number | null;
  onOpenIndexChange: (nextIndex: number | null) => void;
};

export default function PostImageDialog({
  images,
  postTitle,
  openIndex,
  onOpenIndexChange,
}: PostImageDialogProps) {
  const t = useTranslations("feed.postCard");
  const [selectedIndex, setSelectedIndex] = useState(openIndex ?? 0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: images.length > 1,
    startIndex: openIndex ?? 0,
  });

  useEffect(() => {
    if (!emblaApi || openIndex === null) {
      return;
    }

    emblaApi.scrollTo(openIndex, true);
  }, [emblaApi, openIndex]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const isOpen = openIndex !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => onOpenIndexChange(nextOpen ? openIndex : null)}>
      <DialogContent
        className="max-w-[min(96vw,1080px)] overflow-hidden border border-white/10 bg-[#0b0f16] p-0"
        showCloseButton={images.length > 0}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-manrope text-lg tracking-[-0.03em] text-white">
              {postTitle}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/52">
              <Images className="size-4" />
              {t("imageCounter", {
                current: selectedIndex + 1,
                total: images.length,
              })}
            </p>
          </div>

          {images.length > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">{t("previousImage")}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">{t("nextImage")}</span>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-[16/11] w-full bg-black">
                  <Image
                    src={image}
                    alt={t("imageAlt", { index: index + 1 })}
                    fill
                    className="object-contain"
                    sizes="96vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
