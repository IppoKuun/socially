import { useEffect, useState } from "react";

const MAX_SAMPLE_SIZE = 48;
const MIN_ALPHA = 180;
const MIN_SATURATION = 18;
const MIN_LIGHTNESS = 12;
const MAX_LIGHTNESS = 88;
const HUE_BUCKET_SIZE = 18;
const SAT_BUCKET_SIZE = 12;
const LIGHT_BUCKET_SIZE = 10;
const PALETTE_SIZE = 3;
const MAX_FAMILY_HUE_DISTANCE = 20;

interface PaletteColor {
  h: number;
  s: number;
  l: number;
  weight: number;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hueDistance(a: number, b: number) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function shiftHue(hue: number, amount: number) {
  return (hue + amount + 360) % 360;
}

function toUiColor({ h, s, l }: PaletteColor) {
  const finalS = clamp(Math.round(s), 34, 72);
  const finalL = clamp(Math.round(l), 32, 60);

  return `hsl(${Math.round(h)} ${finalS}% ${finalL}%)`;
}

function buildFamilyPalette(colors: PaletteColor[]) {
  const baseColor = colors[0] ?? { h: 221, s: 46, l: 36, weight: 1 };
  const relatedColor =
    colors.find(
      (candidate, index) =>
        index > 0 && hueDistance(candidate.h, baseColor.h) <= MAX_FAMILY_HUE_DISTANCE,
    ) ?? null;

  const anchorHue = relatedColor
    ? shiftHue(baseColor.h, (relatedColor.h - baseColor.h) / 2)
    : baseColor.h;
  const anchorSaturation = relatedColor
    ? (baseColor.s * 0.72 + relatedColor.s * 0.28)
    : baseColor.s;
  const anchorLightness = relatedColor
    ? (baseColor.l * 0.8 + relatedColor.l * 0.2)
    : baseColor.l;

  return [
    {
      h: shiftHue(anchorHue, -4),
      s: clamp(anchorSaturation + 8, 34, 70),
      l: clamp(anchorLightness + 12, 38, 60),
      weight: 1,
    },
    {
      h: anchorHue,
      s: clamp(anchorSaturation, 32, 64),
      l: clamp(anchorLightness + 2, 34, 52),
      weight: 1,
    },
    {
      h: shiftHue(anchorHue, 8),
      s: clamp(anchorSaturation - 10, 28, 56),
      l: clamp(anchorLightness - 8, 28, 44),
      weight: 1,
    },
  ]
    .slice(0, PALETTE_SIZE)
    .map(toUiColor);
}

export function useImageColors(src: string | null) {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      const longestSide = Math.max(img.naturalWidth, img.naturalHeight, 1);
      const scale = Math.min(1, MAX_SAMPLE_SIZE / longestSide);

      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const buckets = new Map<string, PaletteColor>();

        for (let index = 0; index < imageData.length; index += 4) {
          const alpha = imageData[index + 3];
          if (alpha < MIN_ALPHA) continue;

          const [h, s, l] = rgbToHsl(
            imageData[index],
            imageData[index + 1],
            imageData[index + 2],
          );

          if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) {
            continue;
          }

          const hueBucket = Math.round(h / HUE_BUCKET_SIZE) * HUE_BUCKET_SIZE;
          const saturationBucket = Math.round(s / SAT_BUCKET_SIZE) * SAT_BUCKET_SIZE;
          const lightnessBucket = Math.round(l / LIGHT_BUCKET_SIZE) * LIGHT_BUCKET_SIZE;

          const key = `${hueBucket}-${saturationBucket}-${lightnessBucket}`;
          const balanceWeight = 1 + s / 100 + (1 - Math.abs(l - 52) / 52);

          const current = buckets.get(key) ?? { h: 0, s: 0, l: 0, weight: 0 };

          current.h += h * balanceWeight;
          current.s += s * balanceWeight;
          current.l += l * balanceWeight;
          current.weight += balanceWeight;

          buckets.set(key, current);
        }

        const palette = Array.from(buckets.values())
          .map((color) => ({
            h: color.h / color.weight,
            s: color.s / color.weight,
            l: color.l / color.weight,
            weight: color.weight,
          }))
          .sort((a, b) => b.weight - a.weight);

        if (!cancelled) {
          setColors(buildFamilyPalette(palette));
        }
      } catch {
        if (!cancelled) {
          setColors([]);
        }
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        setColors([]);
      }
    };

    return () => {
      cancelled = true;
    };
  }, [src]);

  return src ? colors : [];
}
