/**
 * Airbnb's reply box, as Malaya has it: one rounded field, the "+" menu and
 * the tools under the text, the send arrow on the right. Enter adds a line;
 * Ctrl/⌘+Enter sends (on a phone, the arrow).
 */
import { ArrowUp, Camera, ImagePlus, Loader2, Plus } from "@/components/icons";
import { useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ReplyingToBar } from "./thread";

export function Composer({
  draft,
  onDraftChange,
  onSend,
  busy,
  replyingTo,
  onClearReply,
  onAttach,
  attaching,
  menuItems,
  tools,
  placeholder = "Write a message…",
  rows = 3,
  className,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
  replyingTo: Message | null;
  onClearReply: () => void;
  onAttach: (files: File[]) => void;
  attaching: number;
  /** Extra items for the "+" menu — the team's quick replies and calls. */
  menuItems?: ReactNode;
  /** Extra round buttons beside "+". */
  tools?: ReactNode;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (files.length) onAttach(files);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-background focus-within:border-foreground/50",
        className,
      )}
    >
      {replyingTo && (
        <ReplyingToBar message={replyingTo} onClear={onClearReply} className="m-2 mb-0" />
      )}
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && draft.trim() && !busy) {
            e.preventDefault();
            onSend();
          }
        }}
        className="min-h-[60px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 sm:min-h-[84px]"
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-9 rounded-full" aria-label="More">
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-64 rounded-2xl p-2">
              {menuItems}
              <DropdownMenuItem
                className="gap-3 rounded-xl py-2.5"
                disabled={busy || attaching > 0}
                onSelect={() => fileRef.current?.click()}
              >
                <ImagePlus className="size-4" /> Add photo or video
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 rounded-xl py-2.5"
                disabled={busy || attaching > 0}
                onSelect={() => cameraRef.current?.click()}
              >
                <Camera className="size-4" /> Camera
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {tools}
          <Button
            size="icon"
            variant="ghost"
            className="size-9 rounded-full"
            aria-label="Add photo or video"
            title="Add photo or video"
            disabled={busy || attaching > 0}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="size-4" />
          </Button>
          {attaching > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Sending {attaching}…
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <Button
          size="icon"
          className="size-9 rounded-full"
          aria-label="Send"
          disabled={!draft.trim() || busy}
          onClick={onSend}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
