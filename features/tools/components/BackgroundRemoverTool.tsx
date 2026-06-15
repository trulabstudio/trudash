"use client";

import { ImageIcon, Upload, Wand2, X } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { consumeToolTokensAction } from "@/features/tools/actions/tool-token.action";
import type { UserRole } from "@/config/roles";

type SizeOption = "original" | "small" | "medium" | "large" | "custom";
type FormatOption = "png" | "webp" | "jpeg";
type BgOption = "transparent" | "solid" | "image";
type UpscaleOption = "none" | "hd" | "4k";
type ShadowOption = "none" | "soft" | "studio" | "floating";

const PRESETS = [
  { name: "Original", size: "original" as SizeOption },
  { name: "Instagram", size: "custom" as SizeOption, w: 1080, h: 1080 },
  { name: "Profile", size: "custom" as SizeOption, w: 512, h: 512 },
  { name: "Banner", size: "custom" as SizeOption, w: 1920, h: 1080 },
  { name: "4K Square", size: "custom" as SizeOption, w: 4096, h: 4096 }
];

type BackgroundRemoverToolProps = {
  initialTokens: number;
  role: UserRole;
  downloadCost: number;
};

export function BackgroundRemoverTool({ initialTokens, role, downloadCost }: BackgroundRemoverToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [originalUrl, setOriginalUrl] = useState("");
  const [removedBlob, setRemovedBlob] = useState<Blob | null>(null);
  const [removedUrl, setRemovedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [tokens, setTokens] = useState(initialTokens);
  const isClient = role === "client";

  const [size, setSize] = useState<SizeOption>("original");
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(1024);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<FormatOption>("png");
  const [quality, setQuality] = useState(0.9);
  const [upscale, setUpscale] = useState<UpscaleOption>("none");
  const [shadow, setShadow] = useState<ShadowOption>("none");

  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgImageUrl, setBgImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  function validateFiles(list: File[]) {
    const valid: File[] = [];

    for (const file of list) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not a valid image file.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is too large. Maximum file size is 15MB.`);
        continue;
      }

      valid.push(file);
    }

    return valid;
  }

  function loadFileAtIndex(list: File[], index: number) {
    const file = list[index];

    if (!file) return;

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    setOriginalUrl(URL.createObjectURL(file));
    setRemovedBlob(null);
    setRemovedUrl("");
    setActiveIndex(index);
  }

  function handleFilesSelected(selected: FileList | File[]) {
    const list = validateFiles(Array.from(selected));

    if (!list.length) return;

    setError("");
    setFiles(list);
    loadFileAtIndex(list, 0);
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      handleFilesSelected(event.target.files);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files) {
      handleFilesSelected(event.dataTransfer.files);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLElement>) {
    const items = event.clipboardData?.items;

    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();

        if (file) {
          handleFilesSelected([file]);
        }

        break;
      }
    }
  }

  function handleBgImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (bgImageUrl) URL.revokeObjectURL(bgImageUrl);

    setBgImageUrl(URL.createObjectURL(file));
  }

  async function generateImage() {
    const file = files[activeIndex];

    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress("Loading AI model...");
    setRemovedBlob(null);
    setRemovedUrl("");

    try {
      const result = await removeBackground(file, {
        progress: (key, current, total) => {
          if (key.includes("fetch") && total) {
            setProgress(`Loading model ${Math.round((current / total) * 100)}%`);
          } else {
            setProgress("Removing background...");
          }
        }
      });

      setRemovedBlob(result);
      setRemovedUrl(URL.createObjectURL(result));
    } catch (err) {
      console.error(err);
      setError("Failed to remove background. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  function resetAll() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);
    if (bgImageUrl) URL.revokeObjectURL(bgImageUrl);

    setFiles([]);
    setActiveIndex(0);
    setOriginalUrl("");
    setRemovedBlob(null);
    setRemovedUrl("");
    setBgImageUrl("");
    setError("");
    setProgress("");

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (bgInputRef.current) bgInputRef.current.value = "";
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    if (preset.size === "original") {
      setSize("original");
      return;
    }

    setSize("custom");
    setCustomWidth(preset.w!);
    setCustomHeight(preset.h!);
    setKeepAspect(false);
  }

  function getTargetDimensions(imgWidth: number, imgHeight: number) {
    let width = imgWidth;
    let height = imgHeight;

    if (size === "small") width = 512;
    if (size === "medium") width = 1024;
    if (size === "large") width = 2048;

    if (["small", "medium", "large"].includes(size)) {
      height = Math.round((imgHeight / imgWidth) * width);
    }

    if (size === "custom") {
      width = customWidth;
      height = keepAspect
        ? Math.round((imgHeight / imgWidth) * width)
        : customHeight;
    }

    const longestSide = Math.max(width, height);

    if (upscale === "hd" && longestSide < 2048) {
      const scale = 2048 / longestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    if (upscale === "4k" && longestSide < 4096) {
      const scale = 4096 / longestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    return { width, height };
  }

  function getPreviewFilter() {
    const base = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;

    if (shadow === "soft") {
      return `${base} drop-shadow(0 18px 24px rgba(0,0,0,.18))`;
    }

    if (shadow === "studio") {
      return `${base} drop-shadow(0 28px 35px rgba(0,0,0,.24))`;
    }

    if (shadow === "floating") {
      return `${base} drop-shadow(0 40px 45px rgba(0,0,0,.22))`;
    }

    return base;
  }

  function applyCanvasShadow(ctx: CanvasRenderingContext2D, scale: number) {
    if (shadow === "none") return;

    if (shadow === "soft") {
      ctx.shadowColor = "rgba(0,0,0,.18)";
      ctx.shadowBlur = 24 * scale;
      ctx.shadowOffsetY = 18 * scale;
    }

    if (shadow === "studio") {
      ctx.shadowColor = "rgba(0,0,0,.24)";
      ctx.shadowBlur = 35 * scale;
      ctx.shadowOffsetY = 28 * scale;
    }

    if (shadow === "floating") {
      ctx.shadowColor = "rgba(0,0,0,.22)";
      ctx.shadowBlur = 45 * scale;
      ctx.shadowOffsetY = 40 * scale;
    }
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  async function downloadImage() {
    if (!removedBlob) return;

    try {
      const tempUrl = URL.createObjectURL(removedBlob);
      const image = await loadImage(tempUrl);
      const target = getTargetDimensions(image.width, image.height);

      URL.revokeObjectURL(tempUrl);

      const shadowPadding =
        shadow === "none"
          ? 0
          : Math.round(Math.max(target.width, target.height) * 0.08);

      const canvasWidth = target.width + shadowPadding * 2;
      const canvasHeight = target.height + shadowPadding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const context = canvas.getContext("2d");

      if (!context) return;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      if (bgOption === "solid" || format === "jpeg") {
        context.fillStyle = bgOption === "solid" ? bgColor : "#ffffff";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      if (bgOption === "image" && bgImageUrl) {
        try {
          const bgImage = await loadImage(bgImageUrl);
          const scale = Math.max(
            canvasWidth / bgImage.width,
            canvasHeight / bgImage.height
          );

          const width = bgImage.width * scale;
          const height = bgImage.height * scale;
          const x = (canvasWidth - width) / 2;
          const y = (canvasHeight - height) / 2;

          context.drawImage(bgImage, x, y, width, height);
        } catch {
          // Ignore background image error.
        }
      }

      const scale = target.width / image.width;

      context.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
      applyCanvasShadow(context, scale);
      context.drawImage(
        image,
        shadowPadding,
        shadowPadding,
        target.width,
        target.height
      );

      const mime =
        format === "png"
          ? "image/png"
          : format === "webp"
            ? "image/webp"
            : "image/jpeg";

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mime, quality);
      });

      if (!blob) return;

      const tokenState = await consumeToolTokensAction("background_remover");

      if (tokenState.error) {
        setError(tokenState.error);
        return;
      }

      if (typeof tokenState.remainingTokens === "number") {
        setTokens(tokenState.remainingTokens);
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const originalName =
        files[activeIndex]?.name.replace(/\.[^/.]+$/, "") || "image";
      const upscaleName = upscale === "none" ? "" : `-${upscale}`;

      link.href = downloadUrl;
      link.download = `${originalName}-no-bg${upscaleName}.${format}`;
      link.click();

      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      setError("Failed to download image.");
    }
  }

  const activeFile = files[activeIndex];
  const activeFileSize = activeFile
    ? `${Math.max(1, Math.round(activeFile.size / 1024))} KB`
    : "";

  const checkerboardBg =
    "bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]";

  return (
    <section
      onPaste={handlePaste}
      className="overflow-hidden rounded-md border border-border bg-surface p-6 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2 text-primary">
          <Wand2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Background Remover
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Prepare images with transparent or solid backgrounds.
          </p>
          {isClient ? (
            <p className="mt-2 text-xs font-medium text-foreground">
              Token balance: {tokens} · {downloadCost} token{downloadCost === 1 ? "" : "s"} per download
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-foreground">
              Ready for internal project use
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)_minmax(18rem,22rem)]">
        <div className="min-w-0 space-y-5">
          <div
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`rounded-md border border-dashed p-6 transition ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />

            <div className="flex items-start gap-3">
              <Upload className="mt-1 h-5 w-5 shrink-0 text-primary" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  Upload image
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, or WEBP up to 15MB. Drag, drop, or paste supported.
                </p>

                <div className="mt-4 flex min-w-0 items-center overflow-hidden rounded-md border border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 border-r border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                  >
                    Choose File
                  </button>

                  <span className="min-w-0 flex-1 truncate px-3 text-sm text-muted-foreground">
                    {activeFile ? activeFile.name : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeFile ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-border bg-muted px-3 py-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Selected file
                </p>

                <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activeFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeFileSize}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted px-3 py-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Multiple files
                </p>

                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    {activeIndex + 1} of {files.length}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={activeIndex <= 0}
                      onClick={() => loadFileAtIndex(files, activeIndex - 1)}
                      className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-40"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      disabled={activeIndex >= files.length - 1}
                      onClick={() => loadFileAtIndex(files, activeIndex + 1)}
                      className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={generateImage}
              disabled={loading || !originalUrl}
            >
              {loading
                ? progress || "Processing..."
                : removedUrl
                  ? "Generate Again"
                  : "Remove Background"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={downloadImage}
              disabled={!removedBlob}
            >
              Download
            </Button>

            <Button type="button" variant="ghost" onClick={resetAll}>
              Reset
            </Button>
          </div>

          {loading ? (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full animate-pulse bg-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {progress || "Processing image..."}
              </p>
            </div>
          ) : null}
        </div>

        <PreviewPanel title="Original" src={originalUrl} />

        <div className="min-w-0 rounded-md border border-border bg-muted p-3">
          <p className="mb-3 text-sm font-medium text-foreground">Result</p>

          <div
            className={`flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-surface ${
              removedUrl && bgOption === "transparent" ? checkerboardBg : ""
            }`}
            style={
              removedUrl && bgOption === "solid"
                ? { backgroundColor: bgColor }
                : removedUrl && bgOption === "image" && bgImageUrl
                  ? {
                      backgroundImage: `url(${bgImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }
                  : undefined
            }
          >
            {removedUrl ? (
              <img
                src={removedUrl}
                alt="Removed background"
                className="max-h-full max-w-full object-contain"
                style={{ filter: getPreviewFilter() }}
              />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border bg-surface p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Presets</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="Size">
            <select
              value={size}
              onChange={(event) => setSize(event.target.value as SizeOption)}
              className="input"
            >
              <option value="original">Original</option>
              <option value="small">Small · 512px</option>
              <option value="medium">Medium · 1024px</option>
              <option value="large">Large · 2048px</option>
              <option value="custom">Custom</option>
            </select>
          </Field>

          <Field label="Format">
            <select
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as FormatOption)
              }
              className="input"
            >
              <option value="png">PNG</option>
              <option value="webp">WEBP</option>
              <option value="jpeg">JPEG</option>
            </select>
          </Field>

          <Field label="Upscale">
            <select
              value={upscale}
              onChange={(event) =>
                setUpscale(event.target.value as UpscaleOption)
              }
              className="input"
            >
              <option value="none">None</option>
              <option value="hd">HD · 2048px</option>
              <option value="4k">4K · 4096px</option>
            </select>
          </Field>

          <Field label="Background">
            <select
              value={bgOption}
              onChange={(event) => setBgOption(event.target.value as BgOption)}
              className="input"
            >
              <option value="transparent">Transparent</option>
              <option value="solid">Solid color</option>
              <option value="image">Custom image</option>
            </select>
          </Field>

          <Field label="Shadow">
            <select
              value={shadow}
              onChange={(event) =>
                setShadow(event.target.value as ShadowOption)
              }
              className="input"
            >
              <option value="none">None</option>
              <option value="soft">Soft</option>
              <option value="studio">Studio</option>
              <option value="floating">Floating</option>
            </select>
          </Field>

          <Field label={`Quality ${Math.round(quality * 100)}%`}>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <Field label="Width">
            <input
              type="number"
              value={customWidth}
              disabled={size !== "custom"}
              onChange={(event) => setCustomWidth(Number(event.target.value))}
              className="input disabled:bg-muted disabled:text-muted-foreground"
            />
          </Field>

          <Field label="Height">
            <input
              type="number"
              value={customHeight}
              disabled={size !== "custom" || keepAspect}
              onChange={(event) => setCustomHeight(Number(event.target.value))}
              className="input disabled:bg-muted disabled:text-muted-foreground"
            />
          </Field>

          <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={keepAspect}
              disabled={size !== "custom"}
              onChange={(event) => setKeepAspect(event.target.checked)}
              className="h-4 w-4 accent-primary disabled:opacity-40"
            />
            Keep aspect ratio
          </label>

          <Field label="Background color">
            <div className="flex h-10 overflow-hidden rounded-md border border-border bg-surface">
              <input
                type="color"
                value={bgColor}
                onChange={(event) => setBgColor(event.target.value)}
                className="h-10 w-12 cursor-pointer border-0 bg-transparent p-1"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(event) => setBgColor(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </div>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Field label="Background image">
            <div className="flex min-w-0 items-center overflow-hidden rounded-md border border-border bg-surface">
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                onChange={handleBgImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                className="shrink-0 border-r border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
              >
                Choose File
              </button>

              <span className="min-w-0 flex-1 truncate px-3 text-sm text-muted-foreground">
                {bgImageUrl ? "Background image selected" : "No file chosen"}
              </span>
            </div>
          </Field>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Field label={`Contrast ${contrast}%`}>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={contrast}
              onChange={(event) => setContrast(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </Field>

          <Field label={`Brightness ${brightness}%`}>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={brightness}
              onChange={(event) => setBrightness(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </Field>

          <Field label={`Saturation ${saturation}%`}>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={saturation}
              onChange={(event) => setSaturation(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function PreviewPanel({ title, src }: { title: string; src: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-muted p-3">
      <p className="mb-3 text-sm font-medium text-foreground">{title}</p>

      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
        {src ? (
          <img
            src={src}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <Label className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
