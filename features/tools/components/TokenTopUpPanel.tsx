"use client";

import { Check, MessageCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { ToolSettings } from "@/features/tools/lib/tool-settings";
import { cn } from "@/lib/helpers/cn";

type TokenTopUpPanelProps = {
  tokens: number;
  settings: ToolSettings;
  compact?: boolean;
};

const topUpTokenOptions = [10, 20, 50];

function formatPrice(value: number) {
  return `RM${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;
}

export function TokenTopUpPanel({ tokens, settings, compact = false }: TokenTopUpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState(topUpTokenOptions[0]);
  const selectedPrice = (selectedTokens / 10) * settings.pricePer10TokensRm;
  const selectedPriceLabel = formatPrice(selectedPrice);
  const whatsappUrl = useMemo(() => {
    const message = [
      "Hi TRULAB, saya nak topup token.",
      `Package: ${selectedTokens} tokens (${selectedPriceLabel})`,
      `Saya sudah transfer ke ${settings.bankName} ${settings.bankAccountNumber} - ${settings.bankAccountName}.`,
      "Saya akan hantar bukti pembayaran selepas mesej ini."
    ].join("\n");

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [selectedPriceLabel, selectedTokens, settings.bankAccountName, settings.bankAccountNumber, settings.bankName, settings.whatsappNumber]);

  return (
    <section className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Token balance</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{tokens}</p>
        </div>
        {!compact ? (
          <Button type="button" variant="secondary" onClick={() => setIsOpen((value) => !value)}>
            <Plus className="mr-2 h-4 w-4" />
            Top Up
          </Button>
        ) : (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground">
            10 tokens = {formatPrice(settings.pricePer10TokensRm)}
          </div>
        )}
      </div>

      {!compact && isOpen ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {topUpTokenOptions.map((tokenOption) => {
              const priceLabel = formatPrice((tokenOption / 10) * settings.pricePer10TokensRm);

              return (
              <button
                key={tokenOption}
                type="button"
                onClick={() => setSelectedTokens(tokenOption)}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2 text-left transition",
                  selectedTokens === tokenOption
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-foreground">{tokenOption} tokens</span>
                  <span className="block text-xs text-muted-foreground">{priceLabel}</span>
                </span>
                {selectedTokens === tokenOption ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-md border border-border bg-muted p-3 text-sm">
            <p className="font-semibold text-foreground">Manual transfer</p>
            <dl className="mt-2 grid gap-1 text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Bank</dt>
                <dd className="font-medium text-foreground">{settings.bankName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Account</dt>
                <dd className="font-medium text-foreground">{settings.bankAccountNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Name</dt>
                <dd className="font-medium text-foreground">{settings.bankAccountName}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Transfer {selectedPriceLabel}, then send proof of payment through WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Payment Proof
            </a>
          </div>
        </>
      ) : null}
    </section>
  );
}
