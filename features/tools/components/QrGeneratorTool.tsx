"use client";

import { Link2, QrCode } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { consumeToolTokensAction } from "@/features/tools/actions/tool-token.action";
import type { UserRole } from "@/config/roles";

type Format = "png" | "jpg" | "svg";

type QrGeneratorToolProps = {
  initialTokens: number;
  role: UserRole;
  downloadCost: number;
};

async function loadQRCode() {
  return import("qrcode");
}

export function QrGeneratorTool({ initialTokens, role, downloadCost }: QrGeneratorToolProps) {
  const [url, setUrl] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [format, setFormat] = useState<Format>("png");
  const [size, setSize] = useState(2048);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transparent, setTransparent] = useState(false);
  const [tokens, setTokens] = useState(initialTokens);
  const isClient = role === "client";

  const qrColor = {
    dark: "#000000",
    light: transparent && format !== "jpg" ? "#0000" : "#FFFFFF"
  };

  async function generatePreview() {
    setError("");

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Enter a link first.");
      return;
    }

    setLoading(true);

    try {
      const QRCode = await loadQRCode();
      const qr = await QRCode.toDataURL(cleanUrl, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: "H",
        color: qrColor
      });

      setQrPreview(qr);
    } catch {
      setError("Failed to generate QR.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadQR() {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Enter a link first.");
      return;
    }

    try {
      const QRCode = await loadQRCode();

      if (format === "svg") {
        const svg = await QRCode.toString(cleanUrl, {
          type: "svg",
          width: size,
          margin: 2,
          errorCorrectionLevel: "H",
          color: qrColor
        });

        const blob = new Blob([svg], {
          type: "image/svg+xml"
        });

        const objectUrl = URL.createObjectURL(blob);
        const tokenState = await consumeToolTokensAction("qr_generator");

        if (tokenState.error) {
          URL.revokeObjectURL(objectUrl);
          setError(tokenState.error);
          return;
        }

        if (typeof tokenState.remainingTokens === "number") {
          setTokens(tokenState.remainingTokens);
        }

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "qr-code.svg";
        link.click();

        URL.revokeObjectURL(objectUrl);
        return;
      }

      const pngDataUrl = await QRCode.toDataURL(cleanUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: qrColor
      });

      if (format === "png") {
        const tokenState = await consumeToolTokensAction("qr_generator");

        if (tokenState.error) {
          setError(tokenState.error);
          return;
        }

        if (typeof tokenState.remainingTokens === "number") {
          setTokens(tokenState.remainingTokens);
        }

        const link = document.createElement("a");
        link.href = pngDataUrl;
        link.download = `qr-code-${size}${transparent ? "-transparent" : ""}.png`;
        link.click();
        return;
      }

      const image = new Image();

      image.onload = async () => {
        const canvas = document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) return;

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);

        const jpg = canvas.toDataURL("image/jpeg", 1);
        const tokenState = await consumeToolTokensAction("qr_generator");

        if (tokenState.error) {
          setError(tokenState.error);
          return;
        }

        if (typeof tokenState.remainingTokens === "number") {
          setTokens(tokenState.remainingTokens);
        }

        const link = document.createElement("a");
        link.href = jpg;
        link.download = `qr-code-${size}.jpg`;
        link.click();
      };

      image.src = pngDataUrl;
    } catch {
      setError("Failed to download QR.");
    }
  }

  const displayUrl = url.trim().replace(/^https?:\/\//, "");

  return (
    <section className="rounded-md border border-border bg-surface p-6 shadow-soft overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2 text-primary">
          <QrCode className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            QR Generator
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Convert project URLs into downloadable QR codes.
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="grid gap-4 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="qrUrl">Link</Label>

            <Input
              id="qrUrl"
              type="url"
              placeholder="https://example.com"
              value={url}
              className="w-full min-w-0"
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void generatePreview();
                }
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="qrFormat">Format</Label>

              <select
                id="qrFormat"
                value={format}
                onChange={(event) => {
                  const selected = event.target.value as Format;

                  setFormat(selected);

                  if (selected === "jpg") {
                    setTransparent(false);
                  }
                }}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="svg">SVG</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrSize">Resolution</Label>

              <select
                id="qrSize"
                value={size}
                disabled={format === "svg"}
                onChange={(event) => setSize(Number(event.target.value))}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value={1024}>1024 px</option>
                <option value={2048}>2048 px</option>
                <option value={4096}>4096 px</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={transparent}
              disabled={format === "jpg"}
              onChange={(event) => setTransparent(event.target.checked)}
              className="h-4 w-4"
            />

            Transparent background
          </label>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={generatePreview}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={downloadQR}
              disabled={!qrPreview}
            >
              Download {format.toUpperCase()}
            </Button>
          </div>

          {displayUrl && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground min-w-0">
              <Link2 className="h-4 w-4 shrink-0" />

              <span className="truncate min-w-0 font-mono">
                {displayUrl}
              </span>
            </div>
          )}
        </div>

        <div
          aria-label="Generated QR preview"
          className="
            aspect-square
            w-full
            rounded-md
            border
            border-border
            bg-muted
            bg-contain
            bg-center
            bg-no-repeat
            overflow-hidden
          "
          style={
            qrPreview
              ? {
                  backgroundImage: `url(${qrPreview})`
                }
              : undefined
          }
        />
      </div>
    </section>
  );
}
