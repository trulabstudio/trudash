"use client";

import { Copy, Share2 } from "lucide-react";
import { useActionState, useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { createShareLinkAction, type ShareActionState } from "@/features/sharing/actions/share.action";
import type { ShareResourceType } from "@/types/database.type";

type ShareLinkFormProps = {
  resourceType: ShareResourceType;
  resourceId: string;
  label?: string;
};

const initialState: ShareActionState = {};

export function ShareLinkForm({ resourceType, resourceId, label = "Share" }: ShareLinkFormProps) {
  const [state, action, isPending] = useActionState(createShareLinkAction, initialState);
  const shareUrl = useMemo(() => {
    if (!state.sharePath || typeof window === "undefined") {
      return state.sharePath ?? "";
    }

    return `${window.location.origin}${state.sharePath}`;
  }, [state.sharePath]);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="resourceType" value={resourceType} />
      <input type="hidden" name="resourceId" value={resourceId} />
      <Button type="submit" variant="secondary" disabled={isPending}>
        <Share2 className="mr-2 h-4 w-4" />
        {isPending ? "Preparing" : label}
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {shareUrl ? (
        <div className="rounded-md border border-border bg-muted p-3 text-xs">
          <a href={shareUrl} target="_blank" rel="noreferrer" className="break-all font-medium text-primary">
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="mt-2 inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </button>
        </div>
      ) : null}
      {state.success && !shareUrl ? <p className="text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
