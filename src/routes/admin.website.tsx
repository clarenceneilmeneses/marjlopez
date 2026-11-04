/**
 * Website — the boss's "cms on the website of marj" (2026-10-28): change what
 * the landing page and the four offer pages say and show, without code.
 *
 * Left, the page's sections as plain forms (lib/site-editor.ts says what's
 * in each). Right, the real page in a frame, redrawn with the unsaved words
 * as you type (state/site.ts, "PREVIEW"). Save puts it live; every earlier
 * save is kept, and Versions can bring any of them back — or the original
 * words — to look at and save again.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  History,
  ImagePlus,
  Loader2,
  Plus,
  Monitor,
  Smartphone,
  Trash2,
  Undo2,
} from "@/components/icons";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { PageHeader, TODAY_LINE } from "@/components/admin/page";
import { InlineLoading } from "@/components/loading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dateTime, timeAgo } from "@/lib/format";
import { mergeContent, SITE_PHOTOS } from "@/lib/site-content";
import { blankFor, EDITABLE_PAGES, type EditablePage, type Field } from "@/lib/site-editor";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { errorText } from "@/state/data";
import {
  uploadSitePhoto,
  useSaveSite,
  useSiteRow,
  useSiteVersions,
  useUploadedPhotos,
} from "@/state/site";

export const Route = createFileRoute("/admin/website")({
  validateSearch: (s: Record<string, unknown>): { page?: string } =>
    typeof s["page"] === "string" ? { page: s["page"] } : {},
  head: () => ({ meta: [{ title: "Website — Marj Lopez" }] }),
  component: WebsitePage,
});

// Malaya's chip strip, as on the Inbox.
const CHIP_STRIP =
  "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-level-1 no-scrollbar";
const CHIP =
  "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors";

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {};
const asList = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asText = (v: unknown) => (typeof v === "string" ? v : "");

function WebsitePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const page = EDITABLE_PAGES.find((p) => p.key === search.page) ?? EDITABLE_PAGES[0]!;
  const dirtyRef = useRef(false);

  const pick = (key: string) => {
    if (key === page.key) return;
    if (
      dirtyRef.current &&
      !window.confirm("Leave without saving? Your changes on this page will be lost.")
    )
      return;
    void navigate({ to: "/admin/website", search: { page: key } });
  };

  return (
    <AppShell title="Website">
      <PageHeader
        eyebrow={TODAY_LINE()}
        title="Website"
        sub="Change what the public pages say and show. The preview updates as you type; Save puts it live."
      />
      <div className={cn(CHIP_STRIP, "mt-5")}>
        {EDITABLE_PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => pick(p.key)}
            className={cn(
              CHIP,
              p.key === page.key
                ? "bg-secondary font-medium text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Editor key={page.key} page={page} dirtyRef={dirtyRef} />
    </AppShell>
  );
}

// ------------------------------------------------------------------- editor

function Editor({
  page,
  dirtyRef,
}: {
  page: EditablePage;
  dirtyRef: React.MutableRefObject<boolean>;
}) {
  const { staff, session } = useAuth();
  const row = useSiteRow(page.key);
  const save = useSaveSite();
  const [versionsOpen, setVersionsOpen] = useState(false);
  const versions = useSiteVersions(page.key, versionsOpen);

  const saved = useMemo(
    () => mergeContent(page.base, row.data?.content) as unknown as Obj,
    [page.base, row.data],
  );
  const [draft, setDraft] = useState<Obj | null>(null);
  const value = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    dirtyRef.current = dirty;
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, dirtyRef]);

  const onSave = () =>
    save.mutate(
      {
        key: page.key,
        content: value,
        by: session?.user.id ?? null,
        name: staff?.name ?? "Someone",
      },
      {
        onSuccess: () => {
          setDraft(null);
          toast.success("Saved — it's live");
        },
        onError: (e) => toast.error(errorText(e)),
      },
    );

  const load = (content: unknown, what: string) => {
    setDraft(mergeContent(page.base, content) as unknown as Obj);
    toast(`${what} loaded`, {
      description: "Look it over in the preview, then Save to put it live.",
    });
  };

  if (row.isLoading) return <InlineLoading className="mt-8" />;
  if (row.isError) {
    return (
      <div className="mt-6 flex gap-3 rounded-2xl bg-warning/10 p-4 text-sm">
        <AlertTriangle className="size-5 shrink-0 text-warning" />
        <p>
          The website editor isn&rsquo;t set up in the database yet. Run{" "}
          <code className="rounded bg-card px-1">
            supabase/migrations/2026-10-28-site-content.sql
          </code>{" "}
          in the Supabase SQL editor, then reload this page.
          <span className="mt-1 block text-muted-foreground">{errorText(row.error)}</span>
        </p>
      </div>
    );
  }

  const status = dirty
    ? "Unsaved changes"
    : row.data
      ? `Saved ${timeAgo(row.data.updated_at)}${row.data.updated_by_name ? ` by ${row.data.updated_by_name}` : ""}`
      : "Showing the original words";

  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-start">
      <div className="min-w-0">
        {/* The actions stay in reach while the form scrolls. */}
        <div className="sticky top-16 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-card/95 p-2 pl-4 shadow-level-2 backdrop-blur">
          <span className="mr-auto flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2 rounded-full",
                dirty ? "bg-warning" : row.data ? "bg-success" : "bg-muted-foreground",
              )}
            />
            <span className={dirty ? "font-medium" : "text-muted-foreground"}>{status}</span>
          </span>
          <DropdownMenu open={versionsOpen} onOpenChange={setVersionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
                <History className="size-4" /> Versions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Bring back an earlier save to look at. Nothing changes until you Save.
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {versions.isLoading && (
                <DropdownMenuItem disabled>
                  <Loader2 className="size-4 animate-spin" /> Loading…
                </DropdownMenuItem>
              )}
              {versions.data?.map((v) => (
                <DropdownMenuItem key={v.id} onSelect={() => load(v.content, "Earlier version")}>
                  <span className="flex flex-col">
                    <span>{dateTime(v.saved_at)}</span>
                    {v.saved_by_name && (
                      <span className="text-xs text-muted-foreground">by {v.saved_by_name}</span>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              {versions.data && !versions.data.length && (
                <DropdownMenuItem disabled>No earlier saves yet</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => load(null, "The original words")}>
                <Undo2 className="size-4" /> The original words
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <a href={page.path} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> View page
            </a>
          </Button>
          {dirty && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setDraft(null)}
            >
              Discard
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full px-5"
            disabled={!dirty || save.isPending}
            onClick={onSave}
          >
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>

        <Accordion type="multiple" defaultValue={[page.sections[0]!.title]} className="space-y-3">
          {page.sections.map((sec) => {
            const scope = sec.key ? asObj(value[sec.key]) : value;
            const set = (next: Obj) => setDraft(sec.key ? { ...value, [sec.key]: next } : next);
            return (
              <AccordionItem
                key={sec.title}
                value={sec.title}
                className="rounded-2xl border-0 bg-card px-4 shadow-level-1 sm:px-5"
              >
                <AccordionTrigger className="py-4 text-[15px] font-semibold hover:no-underline">
                  {sec.title}
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  {sec.hint && (
                    <p className="-mt-1 mb-4 text-xs text-muted-foreground">{sec.hint}</p>
                  )}
                  <Fields fields={sec.fields} value={scope} onChange={set} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <Preview page={page} draft={value} />
    </div>
  );
}

// ------------------------------------------------------------------- fields

function Fields({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Obj;
  onChange: (v: Obj) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <FieldRow
          key={f.key}
          f={f}
          value={value[f.key]}
          onChange={(v, extra) => onChange({ ...value, [f.key]: v, ...extra })}
        />
      ))}
    </div>
  );
}

function Label({ f, children }: { f: Field; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
        {f.hint && <p className="text-[11px] text-muted-foreground/80">{f.hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  f,
  value,
  onChange,
}: {
  f: Field;
  value: unknown;
  onChange: (v: unknown, extra?: Obj) => void;
}) {
  switch (f.kind) {
    case "text":
      return (
        <Label f={f}>
          <Input
            value={asText(value)}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Label>
      );
    case "textarea":
      return (
        <Label f={f}>
          <Textarea
            value={asText(value)}
            rows={f.rows ?? 3}
            onChange={(e) => onChange(e.target.value)}
          />
        </Label>
      );
    case "pair": {
      const pair = asList(value).map(asText);
      return (
        <Label f={f}>
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[11px] text-muted-foreground">
                  Line {i + 1}
                </span>
                <Input
                  value={pair[i] ?? ""}
                  onChange={(e) => {
                    const next = [pair[0] ?? "", pair[1] ?? ""];
                    next[i] = e.target.value;
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        </Label>
      );
    }
    case "lines": {
      const lines = asList(value).map(asText);
      return (
        <Label f={f}>
          <ul className="space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <Input
                  value={line}
                  onChange={(e) => onChange(lines.map((l, j) => (j === i ? e.target.value : l)))}
                />
                <MoveButtons i={i} n={lines.length} list={lines} onChange={onChange} />
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-primary"
            onClick={() => onChange([...lines, ""])}
          >
            <Plus className="size-4" /> {f.add}
          </Button>
        </Label>
      );
    }
    case "toggle":
      return (
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">{f.label}</span>
          <Switch checked={value === true} onCheckedChange={(v) => onChange(v)} />
        </label>
      );
    case "image":
      return (
        <Label f={f}>
          <ImageField
            value={asText(value)}
            onChange={(src) => onChange(src, f.clears ? { [f.clears]: "" } : undefined)}
          />
        </Label>
      );
    case "group":
      return (
        <div className="space-y-3 rounded-xl border border-border/70 p-3 sm:p-4">
          <div>
            <p className="text-sm font-semibold">{f.label}</p>
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          </div>
          <Fields fields={f.fields} value={asObj(value)} onChange={onChange} />
        </div>
      );
    case "items": {
      const items = asList(value);
      return (
        <Label f={f}>
          <ol className="space-y-3">
            {items.map((it, i) => (
              <li key={i} className="rounded-xl border border-border/70 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {f.item} {i + 1}
                  </span>
                  <MoveButtons
                    i={i}
                    n={items.length}
                    list={items}
                    onChange={onChange}
                    min={f.min}
                  />
                </div>
                <Fields
                  fields={f.fields}
                  value={asObj(it)}
                  onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))}
                />
              </li>
            ))}
          </ol>
          {(f.max === undefined || items.length < f.max) && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-primary"
              onClick={() =>
                onChange([...items, Object.fromEntries(f.fields.map((x) => [x.key, blankFor(x)]))])
              }
            >
              <Plus className="size-4" /> Add {f.item.toLowerCase()}
            </Button>
          )}
        </Label>
      );
    }
  }
}

function MoveButtons({
  i,
  n,
  list,
  onChange,
  min = 0,
}: {
  i: number;
  n: number;
  list: unknown[];
  onChange: (v: unknown) => void;
  min?: number | undefined;
}) {
  const move = (to: number) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  const btn = "size-8 shrink-0 rounded-full text-muted-foreground";
  return (
    <span className="flex shrink-0 items-center">
      <Button
        variant="ghost"
        size="icon"
        className={btn}
        disabled={i === 0}
        onClick={() => move(i - 1)}
        aria-label="Move up"
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={btn}
        disabled={i === n - 1}
        onClick={() => move(i + 1)}
        aria-label="Move down"
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(btn, "hover:text-destructive")}
        disabled={n <= min}
        onClick={() => onChange(list.filter((_, j) => j !== i))}
        aria-label="Remove"
      >
        <Trash2 className="size-4" />
      </Button>
    </span>
  );
}

// ------------------------------------------------------------------- photos

function ImageField({ value, onChange }: { value: string; onChange: (src: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const uploaded = useUploadedPhotos(open);
  const file = useRef<HTMLInputElement>(null);
  const name = value ? decodeURIComponent(value.split("/").pop() ?? value) : "No photo";

  const upload = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("That isn't a photo.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("That photo is over 8 MB. Try a smaller one.");
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadSitePhoto(f));
      void uploaded.refetch();
      setOpen(false);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };

  const pickable = [
    ...(uploaded.data ?? []).map((src) => ({ src, label: "Uploaded" })),
    ...SITE_PHOTOS,
  ];

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary">
          {value && <img src={value} alt="" className="size-full object-cover" />}
        </span>
        <span className="min-w-0 space-y-1.5">
          <span className="block truncate text-xs text-muted-foreground">{name}</span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <ImagePlus className="size-4" /> Change photo
          </Button>
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a photo</DialogTitle>
            <DialogDescription>
              Upload a new one, or pick one already on the site.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={file}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          <Button
            className="w-fit rounded-full"
            disabled={busy}
            onClick={() => file.current?.click()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            Upload a photo
          </Button>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pickable.map((p) => (
              <button
                key={p.src}
                type="button"
                onClick={() => {
                  onChange(p.src);
                  setOpen(false);
                }}
                className={cn(
                  "group overflow-hidden rounded-xl bg-secondary text-left ring-offset-2 transition hover:ring-2 hover:ring-primary/60",
                  p.src === value && "ring-2 ring-primary",
                )}
              >
                <img
                  src={p.src}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="block truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ------------------------------------------------------------------ preview

/** The real page in a frame, drawn with the draft. Laptop is scaled to fit. */
function Preview({ page, draft }: { page: EditablePage; draft: Obj }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"laptop" | "phone">("laptop");
  const [width, setWidth] = useState(600);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const post = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "site-draft", key: page.key, content: draftRef.current },
      window.location.origin,
    );

  // The page says hello when it loads (and again after any reload); answer it.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; key?: string } | null;
      if (d?.type === "site-preview-ready" && d.key === page.key) post();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(post, [draft]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const LAPTOP = 1280;
  const scale = mode === "laptop" ? width / LAPTOP : 1;

  return (
    <div className="hidden xl:sticky xl:top-20 xl:block">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Preview ·{" "}
          <Link to={page.path} target="_blank" className="hover:text-primary">
            {page.path}
          </Link>
        </p>
        <div className={cn(CHIP_STRIP, "p-0.5")}>
          {(["laptop", "phone"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-label={m === "laptop" ? "Laptop" : "Phone"}
              className={cn(
                "grid size-7 place-items-center rounded-full",
                mode === m ? "bg-secondary text-primary" : "text-muted-foreground",
              )}
            >
              {m === "laptop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={box}
        className="relative h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl bg-background shadow-level-2 ring-1 ring-border/70"
      >
        <iframe
          ref={frame}
          title="Preview"
          src={page.path}
          className={cn(
            "absolute top-0 border-0 bg-background",
            mode === "phone" && "left-1/2 -translate-x-1/2",
          )}
          style={
            mode === "laptop"
              ? {
                  left: 0,
                  width: LAPTOP,
                  height: `${100 / scale}%`,
                  transform: `scale(${scale})`,
                  transformOrigin: "0 0",
                }
              : { width: 390, height: "100%" }
          }
        />
      </div>
    </div>
  );
}
