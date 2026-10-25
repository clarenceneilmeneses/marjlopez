/**
 * Quick replies — PRD §9.6, in the dashboard's look. Saved answers to the
 * questions every inquiry asks, and the four thank-yous the form sends on its
 * own (one per request type, `auto_for_type`). `{first_name}` fills in the
 * person's first name.
 */
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareText, Pencil, Plus, Search, Sparkles, Trash2, Zap } from "@/components/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { Empty, PageHeader, Panel, Stat, TODAY_LINE } from "@/components/admin/page";
import { InlineLoading } from "@/components/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/state/auth";
import { errorText, useDeleteQuickReply, useQuickReplies, useSaveQuickReply } from "@/state/data";

export const Route = createFileRoute("/admin/quick-replies")({
  head: () => ({ meta: [{ title: "Quick replies — Marj Lopez" }] }),
  component: QuickRepliesPage,
});

function QuickRepliesPage() {
  const { staff } = useAuth();
  const replies = useQuickReplies(Boolean(staff));
  const del = useDeleteQuickReply();
  const [editing, setEditing] = useState<Partial<QuickReply> | null>(null);
  const [deleting, setDeleting] = useState<QuickReply | null>(null);
  const [q, setQ] = useState("");

  const all = replies.data ?? [];
  const autos = useMemo(
    () => new Map(all.filter((r) => r.auto_for_type).map((r) => [r.auto_for_type!, r])),
    [all],
  );
  const saved = all.filter((r) => !r.auto_for_type);
  const shown = saved.filter((r) =>
    `${r.title} ${r.body}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <AppShell title="Quick replies">
      <PageHeader
        eyebrow={TODAY_LINE()}
        title="Quick replies"
        sub="Saved answers for the questions everyone asks. Pick one from the + in any conversation."
        action={
          <Button className="rounded-full" onClick={() => setEditing({ title: "", body: "" })}>
            <Plus className="size-4" /> New quick reply
          </Button>
        }
      />

      {replies.isLoading ? (
        <InlineLoading className="mt-8" />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Stat
              icon={MessageSquareText}
              label="Saved replies"
              value={String(saved.length)}
              foot="Ready in every chat"
            />
            <Stat
              icon={Zap}
              label="Automatic thank-yous"
              value={`${autos.size}/${TYPE_ORDER.length}`}
              foot={
                autos.size === TYPE_ORDER.length
                  ? "Every request type covered"
                  : "Some requests get none"
              }
              footTone={autos.size === TYPE_ORDER.length ? "up" : "alert"}
            />
            <div className="col-span-2 rounded-xl bg-primary/5 p-4 text-sm shadow-level-1 sm:p-5 lg:col-span-1">
              <p className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="size-4 text-primary" /> Fill-ins
              </p>
              <p className="mt-1.5 text-muted-foreground">
                <code className="rounded bg-card px-1 text-foreground">{"{first_name}"}</code>{" "}
                becomes their first name,{" "}
                <code className="rounded bg-card px-1 text-foreground">{"{my_name}"}</code> yours.
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <Panel
              className="lg:col-span-2"
              title="Automatic thank-yous"
              aside="Sent the moment a form arrives"
            >
              <ul className="-mx-2 space-y-0.5">
                {TYPE_ORDER.map((t) => {
                  const r = autos.get(t);
                  const Icon = TYPES[t].icon;
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() =>
                          setEditing(
                            r ?? {
                              title: `Auto-reply · ${TYPES[t].short}`,
                              body: "",
                              auto_for_type: t,
                            },
                          )
                        }
                        className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{TYPES[t].label}</span>
                          <span className="line-clamp-2 block text-xs text-muted-foreground">
                            {r ? r.body : "None set — they get no thank-you."}
                          </span>
                        </span>
                        <Pencil className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel className="lg:col-span-3" title="Saved replies" aside={`${saved.length}`}>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search replies"
                  className="h-9 rounded-full pl-9"
                />
              </div>
              {shown.length === 0 ? (
                <Empty>{saved.length ? "No reply matches that." : "No saved replies yet."}</Empty>
              ) : (
                <ul className="-mx-2 space-y-0.5">
                  {shown.map((r) => (
                    <li
                      key={r.id}
                      className="group flex items-start gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-sm font-semibold">{r.title}</span>
                        <span className="line-clamp-2 block whitespace-pre-line text-xs text-muted-foreground">
                          {r.body}
                        </span>
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 rounded-full"
                        aria-label={`Edit ${r.title}`}
                        onClick={() => setEditing(r)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 rounded-full text-destructive"
                        aria-label={`Delete ${r.title}`}
                        onClick={() => setDeleting(r)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

      {editing && <EditDialog reply={editing} onClose={() => setEditing(null)} />}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears from everyone&apos;s quick replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleting &&
                del.mutate(deleting.id, {
                  onSuccess: () => toast.success("Deleted"),
                  onError: (e) => toast.error(errorText(e)),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
