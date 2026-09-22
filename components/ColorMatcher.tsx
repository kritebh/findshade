"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import clientShades from "@/data/client-shades.json";
import {
  hexToRgb,
  normalizeHex,
  rankShades,
  rgbToHex,
  sampleCanvasAverage,
} from "@/lib/color";
import type { BrandId, RankedMatch, Shade } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { MatchColumns } from "./MatchColumns";

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
    "asian-paints": rankShades(hex, byBrand["asian-paints"] as Shade[], 4),
    "birla-opus": rankShades(hex, byBrand["birla-opus"] as Shade[], 4),
  };
}

function sampleRadiusForPointer(pointerType: string) {
  return pointerType === "touch" || pointerType === "pen" ? 7 : 3;
}

function eyedropperSupported() {
  return "EyeDropper" in window;
}

function subscribeEyedropper() {
  return () => {};
}

const iconButton =
  "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] transition-colors duration-200 hover:bg-white";

function Icon({
  children,
  className = "h-4 w-4",
}: {
  children: ReactNode;
  className?: string;
}) {
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
      {children}
    </svg>
  );
}

function ImageGlyph() {
  return (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 15-5-5L5 19" />
    </>
  );
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
  const canEyedrop = useSyncExternalStore(
    subscribeEyedropper,
    eyedropperSupported,
    () => false,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const sampleRadiusRef = useRef(3);
  const coarseRef = useRef(false);
  const pendingSampleRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [picker, setPicker] = useState<{
    x: number;
    y: number;
    coarse: boolean;
  } | null>(null);

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

  const clientToCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = Math.min(
      canvas.width - 1,
      Math.max(0, ((clientX - rect.left) / rect.width) * canvas.width),
    );
    const y = Math.min(
      canvas.height - 1,
      Math.max(0, ((clientY - rect.top) / rect.height) * canvas.height),
    );
    return { x, y };
  };

  const sampleAt = (
    canvasX: number,
    canvasY: number,
    radius = sampleRadiusRef.current,
    coarse = false,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const sampled = sampleCanvasAverage(ctx, canvasX, canvasY, radius);
    if (sampled) applyHex(sampled);
    setPicker({
      x: (canvasX / canvas.width) * 100,
      y: (canvasY / canvas.height) * 100,
      coarse,
    });
  };

  const flushPendingSample = (force = false) => {
    if (!pendingSampleRef.current) return;
    if (!force && rafRef.current != null) return;
    const run = () => {
      rafRef.current = null;
      const next = pendingSampleRef.current;
      if (!next) return;
      pendingSampleRef.current = null;
      sampleAt(next.x, next.y, sampleRadiusRef.current, coarseRef.current);
    };
    if (force) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      run();
      return;
    }
    rafRef.current = requestAnimationFrame(run);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pickScreen = async () => {
    const EyeDropperCtor = (
      window as Window & {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
      }
    ).EyeDropper;
    if (!EyeDropperCtor) return;
    try {
      const result = await new EyeDropperCtor().open();
      applyHex(result.sRGBHex);
    } catch {
      // The user dismissed the eyedropper.
    }
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
      sampleRadiusRef.current = 3;
      coarseRef.current = false;
      sampleAt(canvas.width / 2, canvas.height / 2, 3, false);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const onCanvasPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    draggingRef.current = true;
    sampleRadiusRef.current = sampleRadiusForPointer(event.pointerType);
    coarseRef.current = event.pointerType === "touch";
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic events may lack an active pointer id.
    }
    const point = clientToCanvas(event.clientX, event.clientY);
    if (!point) return;
    sampleAt(point.x, point.y, sampleRadiusRef.current, coarseRef.current);
  };

  const onCanvasPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const point = clientToCanvas(event.clientX, event.clientY);
    if (!point) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    coarseRef.current = event.pointerType === "touch";
    setPicker({
      x: (point.x / canvas.width) * 100,
      y: (point.y / canvas.height) * 100,
      coarse: coarseRef.current,
    });
    pendingSampleRef.current = point;
    flushPendingSample(false);
  };

  const endCanvasPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const canvas = canvasRef.current;
    try {
      if (canvas?.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer may already be released.
    }
    const point = clientToCanvas(event.clientX, event.clientY);
    if (point) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingSampleRef.current = null;
      sampleAt(
        point.x,
        point.y,
        sampleRadiusRef.current,
        event.pointerType === "touch",
      );
    } else {
      flushPendingSample(true);
    }
  };

  return (
    <div id="matcher" className="scroll-mt-24 space-y-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/75 shadow-[0_28px_80px_-40px_rgba(40,24,8,0.45)] backdrop-blur-sm">
        {hasImage ? null : (
          <label
            className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 bg-[var(--ink)] px-5 py-8 text-base font-medium text-[var(--paper)] sm:min-h-44"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event: DragEvent<HTMLLabelElement>) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file?.type.startsWith("image/")) onImage(file);
            }}
          >
            <Icon className="h-6 w-6">
              <ImageGlyph />
            </Icon>
            Upload image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImage(file);
              }}
            />
          </label>
        )}
        <div
          className={
            hasImage
              ? "md:grid md:grid-cols-[auto_minmax(18rem,1fr)] md:items-center"
              : undefined
          }
        >
        <div
          className={
            hasImage
              ? "flex justify-center px-4 pt-4 md:justify-start md:py-5 md:pr-0 md:pl-5"
              : "hidden"
          }
        >
          <div className="relative w-fit max-w-full">
            <canvas
              ref={canvasRef}
              onPointerDown={onCanvasPointerDown}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={endCanvasPointer}
              onPointerCancel={endCanvasPointer}
              className="block h-auto max-h-72 w-auto max-w-full touch-none cursor-crosshair md:max-h-80 md:max-w-[42rem]"
            />
            {hasImage && picker ? (
              <div
                className={`pointer-events-none absolute -translate-x-1/2 ${
                  picker.coarse ? "-translate-y-[120%]" : "-translate-y-[70%]"
                }`}
                style={{ left: `${picker.x}%`, top: `${picker.y}%` }}
              >
                <span
                  className={`flex items-center justify-center rounded-full border-2 border-white bg-[var(--ink)] text-[var(--paper)] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.55)] ring-2 ring-black/20 ${
                    picker.coarse ? "h-14 w-14" : "h-11 w-11"
                  }`}
                  aria-hidden
                >
                  <EyedropperIcon
                    className={picker.coarse ? "h-6 w-6" : "h-5 w-5"}
                  />
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="block min-w-44 flex-1 text-base">
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
                  aria-label="Hex"
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
                <label key={label} className="block w-16 text-base sm:w-[4.5rem]">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    {label}
                  </span>
                  <input
                    inputMode="numeric"
                    value={value}
                    aria-label={label}
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
            <div className="flex items-center gap-2 pb-0.5">
              {hasImage ? (
                <label className={iconButton}>
                  <span className="sr-only">Change image</span>
                  <Icon>
                    <ImageGlyph />
                  </Icon>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onImage(file);
                    }}
                  />
                </label>
              ) : null}
              {canEyedrop ? (
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Sample from screen"
                  onClick={pickScreen}
                >
                  <EyedropperIcon className="h-4 w-4" />
                </button>
              ) : null}
              <CopyButton
                value={`/hex/${hexSlug}`}
                label="Copy link"
                absolute
                icon="link"
              />
              <CopyButton value={hex} label="Copy hex" />
            </div>
          </div>
        </div>
        </div>
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
