"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import clientShades from "@/data/client-shades.json";
import {
  hexToRgb,
  normalizeHex,
  rankShades,
  rgbToHex,
  sampleCanvasAverage,
} from "@/lib/color";
import type { BrandId, RankedMatch, Shade } from "@/lib/types";
import { MatchColumns } from "./MatchColumns";
import { Disclaimer } from "./Disclaimer";

const shades = clientShades as Pick<
  Shade,
  | "brand"
  | "code"
  | "slug"
  | "name"
  | "hex"
  | "r"
  | "g"
  | "b"
  | "family"
  | "lab"
>[];

const byBrand: Record<BrandId, typeof shades> = {
  "asian-paints": shades.filter((shade) => shade.brand === "asian-paints"),
  "birla-opus": shades.filter((shade) => shade.brand === "birla-opus"),
};

function rankBoth(hex: string) {
  return {
    "asian-paints": rankShades(hex, byBrand["asian-paints"] as Shade[], 5),
    "birla-opus": rankShades(hex, byBrand["birla-opus"] as Shade[], 5),
  };
}

function EyedropperIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 22l5.5-5.5" />
      <path d="M18.37 3.63a2.12 2.12 0 0 1 3 3L8 20H5v-3Z" />
      <path d="m14 7 3 3" />
    </svg>
  );
}

export function ColorMatcher({
  initialHex = "#C4A484",
  showResults = true,
}: {
  initialHex?: string;
  showResults?: boolean;
}) {
  const start = normalizeHex(initialHex) ?? "#C4A484";
  const startRgb = hexToRgb(start)!;
  const [hex, setHex] = useState(start);
  const [r, setR] = useState(String(startRgb.r));
  const [g, setG] = useState(String(startRgb.g));
  const [b, setB] = useState(String(startRgb.b));
  const [hexField, setHexField] = useState(start);
  const [imageName, setImageName] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasImage, setHasImage] = useState(false);
  const [picker, setPicker] = useState<{ x: number; y: number } | null>(null);

  const applyHex = (next: string) => {
    const normalized = normalizeHex(next);
    if (!normalized) return;
    const rgb = hexToRgb(normalized);
    if (!rgb) return;
    setHex(normalized);
    setHexField(normalized);
    setR(String(rgb.r));
    setG(String(rgb.g));
    setB(String(rgb.b));
  };

  const applyRgb = (nr: number, ng: number, nb: number) => {
    const next = rgbToHex(nr, ng, nb);
    setHex(next);
    setHexField(next);
    setR(String(Math.round(nr)));
    setG(String(Math.round(ng)));
    setB(String(Math.round(nb)));
  };

  const sampleAt = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const sampled = sampleCanvasAverage(ctx, canvasX, canvasY, 3);
    if (sampled) applyHex(sampled);
    setPicker({
      x: (canvasX / canvas.width) * 100,
      y: (canvasY / canvas.height) * 100,
    });
  };

  const matches = useMemo(() => rankBoth(hex), [hex]);
  const hexSlug = hex.replace("#", "").toLowerCase();

  const onImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 720;
      const scale = Math.min(1, maxW / image.width);
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setHasImage(true);
      setImageName(file.name);
      sampleAt(canvas.width / 2, canvas.height / 2);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const onCanvasPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    sampleAt(x, y);
  };

  return (
    <div id="matcher" className="scroll-mt-24 space-y-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/75 shadow-[0_28px_80px_-40px_rgba(40,24,8,0.45)] backdrop-blur-sm">
        <div className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="relative min-h-56 md:min-h-[22rem]">
            <div className="absolute inset-0" style={{ backgroundColor: hex }} />
            <p className="absolute right-4 bottom-4 font-mono text-sm text-white/90 mix-blend-difference">
              {hex}
            </p>
          </div>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="block text-base">
                <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Hex
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-full border border-[var(--line)] shadow-inner">
                    <span
                      className="absolute inset-0"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                    <input
                      type="color"
                      value={hex}
                      onChange={(event) => applyHex(event.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Colour picker"
                    />
                  </label>
                  <input
                    value={hexField}
                    onChange={(event) => {
                      setHexField(event.target.value);
                      applyHex(event.target.value);
                    }}
                    className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 font-mono text-base"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["R", r, setR],
                    ["G", g, setG],
                    ["B", b, setB],
                  ] as const
                ).map(([label, value, setter]) => (
                  <label key={label} className="block text-base">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      {label}
                    </span>
                    <input
                      inputMode="numeric"
                      value={value}
                      onChange={(event) => {
                        setter(event.target.value);
                        const nr =
                          label === "R" ? Number(event.target.value) : Number(r);
                        const ng =
                          label === "G" ? Number(event.target.value) : Number(g);
                        const nb =
                          label === "B" ? Number(event.target.value) : Number(b);
                        if ([nr, ng, nb].every((n) => Number.isFinite(n))) {
                          applyRgb(nr, ng, nb);
                        }
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-2 py-2.5 font-mono text-base"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Photo
              </p>
              <label className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[var(--ink)] px-5 py-2.5 text-base font-medium text-[var(--paper)] shadow-[0_10px_24px_-12px_rgba(26,22,16,0.7)] transition-transform duration-200 hover:-translate-y-px sm:w-auto sm:text-sm">
                {imageName ?? "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImage(file);
                  }}
                />
              </label>
              {hasImage ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Tap the photo to pick a colour
                </p>
              ) : null}
              <div className={`relative mt-3 ${hasImage ? "block" : "hidden"}`}>
                <canvas
                  ref={canvasRef}
                  onPointerDown={onCanvasPointer}
                  className="h-auto max-h-64 w-full touch-none rounded-2xl border border-[var(--line)]"
                />
                {hasImage && picker ? (
                  <div
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-[70%]"
                    style={{ left: `${picker.x}%`, top: `${picker.y}%` }}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[var(--ink)] text-[var(--paper)] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.55)] ring-2 ring-black/20"
                      aria-hidden
                    >
                      <EyedropperIcon className="h-5 w-5" />
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={`/hex/${hexSlug}`}
          className="text-sm text-[var(--muted)] underline decoration-[var(--line)] underline-offset-4 transition-colors duration-200 hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          Open shareable match page
        </Link>
        <Disclaimer compact />
      </div>

      {showResults ? (
        <MatchColumns
          matches={
            matches as {
              "asian-paints": RankedMatch[];
              "birla-opus": RankedMatch[];
            }
          }
        />
      ) : null}
    </div>
  );
}
