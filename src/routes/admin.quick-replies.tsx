/**
 * Quick replies — PRD §9.6. Saved answers to the questions every inquiry
 * asks, and the four thank-yous the form sends on its own (one per request
 * type, `auto_for_type`). `{first_name}` fills in the person's first name.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Zap } from "@/components/icons";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { InlineLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TYPE_ORDER, TYPES } from "@/lib/inquiry";
import type { LeadType, QuickReply } from "@/lib/types";
import { errorText, useDeleteQuickReply, useQuickReplies, useSaveQuickReply } from "@/state/data";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/admin/quick-replies")({
  head: () => ({ meta: [{ title: "Quick replies — Marj Lopez" }] }),
  component: QuickRepliesPage,
});

function QuickRepliesPage() {
  const { staff } = useAuth();
  const replies = useQuickReplies(Boolean(staff));
  const del = useDeleteQuickReply();
  const [editing, setEditing] = useState<Partial<QuickReply> | null>(null);

  return (
    <AppShell title="Quick replies">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Quick replies</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Saved answers for the questions everyone asks. Pick one from the &ldquo;+&rdquo; in any
            conversation. <code className="rounded bg-secondary px-1">{"{first_name}"}</code>{" "}
            becomes their first name.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setEditing({ title: "", body: "" })}>
          <Plus className="size-4" /> New quick reply
        </Button>
      </div>

      {replies.isLoading ? (
        <InlineLoading className="mt-6" />
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {(replies.data ?? []).map((q) => (
            <Card key={q.id} className="border-border/70 bg-surface shadow-level-1">
              <CardContent className="flex h-full flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{q.title}</p>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-full"
                      aria-label="Edit"
                      onClick={() => setEditing(q)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-full text-destructive"
                      aria-label="Delete"
                      onClick={() =>
                        del.mutate(q.id, {
                          onSuccess: () => toast.success("Deleted"),
                          onError: (e) => toast.error(errorText(e)),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {q.auto_for_type && (
                  <p className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Zap className="size-3" /> Sent automatically after a &ldquo;
                    {TYPES[q.auto_for_type].short}&rdquo; request
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{q.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && <EditDialog reply={editing} onClose={() => setEditing(null)} />}
    </AppShell>
  );
}

function EditDialog({ reply, onClose }: { reply: Partial<QuickReply>; onClose: () => void }) {
  const save = useSaveQuickReply();
  const [title, setTitle] = useState(reply.title ?? "");
  const [body, setBody] = useState(reply.body ?? "");
  const [auto, setAuto] = useState<LeadType | "none">(reply.auto_for_type ?? "none");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{reply.id ? "Edit quick reply" : "New quick reply"}</DialogTitle>
          <DialogDescription>Write it the way you&apos;d say it in a DM.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, e.g. How much to start?"
            className="rounded-xl"
          />
          <Textarea
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hi {first_name}! …"
            className="rounded-xl"
          />
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Send it automatically after a request?
            </span>
            <Select value={auto} onValueChange={(v) => setAuto(v as LeadType | "none")}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No, only when picked</SelectItem>
                {TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>
                    After a &ldquo;{TYPES[t].label}&rdquo; request
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            disabled={!title.trim() || !body.trim() || save.isPending}
            onClick={() =>
              save.mutate(
                {
                  ...(reply.id ? { id: reply.id } : {}),
                  title: title.trim(),
                  body: body.trim(),
                  auto_for_type: auto === "none" ? null : auto,
                },
                {
                  onSuccess: () => {
                    toast.success("Saved");
                    onClose();
                  },
                  onError: (e) => toast.error(errorText(e)),
                },
              )
            }
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
