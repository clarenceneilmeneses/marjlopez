/**
 * The inquiry form — PRD §7. Malaya's checkout, reused for a different
 * question (villas.$code_.book.tsx there):
 *
 *   1            What do you need help with?        four cards
 *   2 … n+1      the type's own screens              cards and dropdowns
 *   n+2          About you                           name, mobile, where from
 *   n+3          Everything look right?              every answer with Edit,
 *                                                    sign in if needed, Send
 *
 * - One screen per subject; Next in a bar pinned to the bottom of a phone.
 * - The step is in the URL (`?step=3`), so a phone's back button goes back.
 * - Edit on the review screen opens a sheet over it and closes back to it.
 * - Browse freely, sign in at the end. The answers live in sessionStorage
 *   until Send, so a sign-in, a refresh or an email confirmation keeps them.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Pencil } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AuthPanel } from "@/components/site/auth-panel";
import { Wordmark } from "@/components/site/chrome";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MobileInput } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/lib/brand";
import {
  answerLabel,
  type Answers,
  type Question,
  type Screen,
  SCREENS,
  screenDone,
  SOURCES,
  TYPE_ORDER,
  TYPES,
} from "@/lib/inquiry";
import type { LeadType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mobileProblem } from "@/lib/validation";
import { useAuth } from "@/state/auth";
import { errorText, useSubmitInquiry } from "@/state/data";

interface Search {
  type?: LeadType;
  step?: number;
}

export const Route = createFileRoute("/inquire")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const t = search["type"];
    const s = Number(search["step"]);
    return {
      ...(typeof t === "string" && (TYPE_ORDER as string[]).includes(t)
        ? { type: t as LeadType }
        : {}),
      ...(s >= 1 && s <= 9 ? { step: Math.trunc(s) } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: `Work with me — ${BRAND.name}` },
      { name: "description", content: "Tell Marj's team what you need. It takes about a minute." },
    ],
  }),
  component: InquirePage,
});

interface About {
  fullName: string;
  mobile: string;
  source: string;
  note: string;
  consent: boolean;
}

interface Draft {
  type: LeadType | null;
  answers: Answers;
  about: About;
}

const STORE = "marj:inquiry:v1";
const EMPTY: Draft = {
  type: null,
  answers: {},
  about: { fullName: "", mobile: "", source: "", note: "", consent: false },
};

function readDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(STORE);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* blocked storage: start empty */
  }
  return EMPTY;
}

function InquirePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, staff, profile, ready } = useAuth();
  const submit = useSubmitInquiry();

  // The type from the link renders on the server too, so "Build my Airbnb"
  // opens on its own first question rather than flashing the type picker.
  const [draft, setDraft] = useState<Draft>({ ...EMPTY, type: search.type ?? null });
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [showProblems, setShowProblems] = useState(false);

  // sessionStorage after mount, so the server and the first client render agree.
  useEffect(() => {
    const d = readDraft();
    // A link from a card ("Build my Airbnb") starts that request fresh.
    if (search.type && search.type !== d.type) {
      d.type = search.type;
      d.answers = {};
    }
    setDraft(d);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft, loaded]);

  // A returning client: fill "About you" from the account.
  useEffect(() => {
    if (!profile) return;
    setDraft((d) => ({
      ...d,
      about: {
        ...d.about,
        fullName: d.about.fullName || profile.full_name,
        mobile: d.about.mobile || profile.mobile || "",
        source: d.about.source || profile.source || "",
      },
    }));
  }, [profile]);

  const type = draft.type;
  const screens: Screen[] = type ? SCREENS[type] : [];
  const LAST = screens.length + 3;
  const aboutStep = screens.length + 2;
  const requested = search.step ?? 1;
  const stage = !type ? 1 : Math.min(requested, LAST);

  const setAnswer = (key: string, value: string | string[]) =>
    setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: value } }));
  const setAbout = (patch: Partial<About>) =>
    setDraft((d) => ({ ...d, about: { ...d.about, ...patch } }));

  const mobileIssue = mobileProblem(draft.about.mobile);
  const aboutDone =
    draft.about.fullName.trim().length >= 2 &&
    !mobileIssue &&
    Boolean(draft.about.source) &&
    draft.about.consent;

  const complete = (s: number): boolean => {
    if (s === 1) return Boolean(type);
    if (s >= 2 && s < aboutStep) {
      const screen = screens[s - 2];
      return screen ? screenDone(screen, draft.answers) : false;
    }
    if (s === aboutStep) return aboutDone;
    return true;
  };

  const goTo = (s: number) => {
    setShowProblems(false);
    void navigate({
      to: "/inquire",
      search: (prev: Search) => ({ ...prev, step: s, ...(type ? { type } : {}) }),
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const advance = () => {
    if (!complete(stage)) {
      setShowProblems(true);
      return;
    }
    if (stage < LAST) goTo(stage + 1);
  };

  const pickType = (t: LeadType) => {
    setDraft((d) => ({ ...d, type: t, answers: d.type === t ? d.answers : {} }));
    void navigate({ to: "/inquire", search: { type: t, step: 2 } });
  };

  const send = async () => {
    if (!type) return;
    try {
      await submit.mutateAsync({
        type,
        answers: draft.answers,
        fullName: draft.about.fullName.trim(),
        mobile: draft.about.mobile.trim(),
        source: draft.about.source,
        note: draft.about.note.trim(),
      });
      try {
        sessionStorage.removeItem(STORE);
      } catch {
        /* ignore */
      }
      toast.success("Sent! Marj's team will reply here.");
      void navigate({ to: "/messages", search: { sent: 1 } });
    } catch (e) {
      toast.error(errorText(e, "We couldn't send that. Try again."));
    }
  };

  const titles: Record<number, { title: string; lead?: string }> = {
    1: {
      title: "What do you need help with?",
      lead: "Pick one. It takes about a minute, and the team replies in your inbox here.",
    },
    [aboutStep]: { title: "About you", lead: "So the team knows who they're talking to." },
    [LAST]: { title: "Everything look right?", lead: "Check your answers, then send." },
  };
  screens.forEach((s, i) => {
    titles[i + 2] = { title: s.title, ...(s.lead ? { lead: s.lead } : {}) };
  });
  const question = titles[stage] ?? { title: "" };

  const summary = useMemo(
    () => (type ? summaryRows(type, draft.answers) : []),
    [type, draft.answers],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <Link to="/" aria-label={`${BRAND.name} home`}>
            <Wordmark />
          </Link>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> About a minute
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-36 pt-6 sm:px-8 md:pb-16 md:pt-10">
        <div className="flex items-center gap-3">
          {stage === 1 ? (
            <Link
              to="/"
              aria-label="Back home"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
            >
              <ArrowLeft className="size-5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => goTo(stage - 1)}
              aria-label="Previous question"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <p className="text-xs font-medium text-muted-foreground">
            {stage} of {type ? LAST : "…"}
          </p>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border" aria-hidden>
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${type ? (stage / LAST) * 100 : 8}%` }}
          />
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-16">
          <form
            key={stage}
            className="min-w-0 animate-in fade-in slide-in-from-right-4 duration-300"
            onSubmit={(e) => {
              e.preventDefault();
              if (stage < LAST) advance();
            }}
          >
            <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {question.title}
            </h1>
            {question.lead && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{question.lead}</p>
            )}

            <div className="mt-7">
              {stage === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {TYPE_ORDER.map((t) => {
                    const meta = TYPES[t];
                    const Icon = meta.icon;
                    const on = type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => pickType(t)}
                        className={cn(
                          "flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition hover:border-primary/60 hover:shadow-level-1",
                          on ? "border-primary ring-2 ring-primary/20" : "border-border/70",
                        )}
                      >
                        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                          <Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-base font-semibold text-foreground">
                            {meta.label}
                          </span>
                          <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                            {meta.blurb}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {stage >= 2 && stage < aboutStep && screens[stage - 2] && (
                <ScreenFields
                  screen={screens[stage - 2]!}
                  answers={draft.answers}
                  onAnswer={setAnswer}
                  showProblems={showProblems}
                />
              )}

              {stage === aboutStep && (
                <AboutFields
                  about={draft.about}
                  onChange={setAbout}
                  mobileIssue={mobileIssue}
                  showProblems={showProblems}
                />
              )}

              {stage === LAST && type && (
                <div className="space-y-6">
                  <dl className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card">
                    <ReviewRow label="What you need" onEdit={() => goTo(1)}>
                      {TYPES[type].label}
                    </ReviewRow>
                    {screens.map((s, i) => (
                      <ReviewRow key={s.short} label={s.short} onEdit={() => setEditing(i + 2)}>
                        {s.questions
                          .map((q) =>
                            draft.answers[q.key] ? answerLabel(q, draft.answers[q.key]) : null,
                          )
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </ReviewRow>
                    ))}
                    <ReviewRow label="About you" onEdit={() => setEditing(aboutStep)}>
                      {draft.about.fullName} · {draft.about.mobile}
                      {draft.about.source
                        ? ` · via ${SOURCES.find((s) => s.value === draft.about.source)?.label}`
                        : ""}
                      {draft.about.note ? (
                        <span className="mt-1 block text-muted-foreground">
                          &ldquo;{draft.about.note}&rdquo;
                        </span>
                      ) : null}
                    </ReviewRow>
                  </dl>

                  {!ready ? null : staff ? (
                    <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-foreground">
                      You&apos;re signed in as the team. Sign out to send an inquiry as a client.
                    </p>
                  ) : !session ? (
                    <div className="rounded-2xl border border-border/70 bg-surface p-5">
                      <p className="font-semibold text-foreground">
                        Last step: an account, so we can reply
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your conversation with the team lives here, not in a DM that gets buried.
                        Your answers are saved.
                      </p>
                      <AuthPanel className="mt-4" fullName={draft.about.fullName} />
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-success" /> Sending as {session.user.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            {stage > 1 && (
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                  <div className="min-w-0 text-sm md:hidden">
                    <span className="block font-semibold text-foreground">
                      {type ? TYPES[type].short : ""}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Step {stage} of {LAST}
                    </span>
                  </div>
                  {stage < LAST ? (
                    <Button
                      type="submit"
                      className="h-12 shrink-0 rounded-xl px-8 text-base md:w-full md:justify-between md:px-6"
                    >
                      <span>Next</span>
                      <ArrowRight className="size-5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void send()}
                      className="h-12 shrink-0 rounded-xl px-6 text-base md:h-14 md:w-full md:justify-between"
                      disabled={!session || Boolean(staff) || submit.isPending || !aboutDone}
                    >
                      <span>{submit.isPending ? "Sending" : "Send to Marj's team"}</span>
                      {submit.isPending ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <ArrowRight className="size-5" />
                      )}
                    </Button>
                  )}
                </div>
                {stage === LAST && (
                  <p className="mt-2 hidden items-center justify-center gap-2 text-xs text-muted-foreground md:flex">
                    <Lock className="size-3.5" /> Only Marj&apos;s team sees this.
                  </p>
                )}
              </div>
            )}
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-2xl border border-border/70 bg-card p-5 shadow-level-1">
              <p className="brand-eyebrow text-[10px] text-muted-foreground">Your request</p>
              {type ? (
                <>
                  <p className="mt-3 flex items-center gap-2 font-semibold">
                    {(() => {
                      const Icon = TYPES[type].icon;
                      return <Icon className="size-4 text-primary" />;
                    })()}
                    {TYPES[type].label}
                  </p>
                  <dl className="mt-4 space-y-2.5 text-sm">
                    {summary.map((r) => (
                      <div key={r.label}>
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {r.label}
                        </dt>
                        <dd className="font-medium">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {!summary.length && (
                    <p className="mt-3 text-sm text-muted-foreground">Your answers show up here.</p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Pick what you need to get started.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-3xl sm:mx-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">
              {editing !== null ? titles[editing]?.title : ""}
            </SheetTitle>
            <SheetDescription>Change it and you&apos;re back on the review.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editing !== null && editing >= 2 && editing < aboutStep && screens[editing - 2] && (
              <ScreenFields
                screen={screens[editing - 2]!}
                answers={draft.answers}
                onAnswer={setAnswer}
                showProblems
              />
            )}
            {editing === aboutStep && (
              <AboutFields
                about={draft.about}
                onChange={setAbout}
                mobileIssue={mobileIssue}
                showProblems
              />
            )}
            <Button
              className="mt-6 h-12 w-full rounded-xl text-base"
              disabled={editing !== null && !complete(editing)}
              onClick={() => setEditing(null)}
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function summaryRows(type: LeadType, answers: Answers) {
  return SCREENS[type]
    .flatMap((s) => s.questions)
    .filter((q) => {
      const v = answers[q.key];
      return Array.isArray(v) ? v.length > 0 : Boolean(v);
    })
    .map((q) => ({ label: q.label, value: answerLabel(q, answers[q.key]) }));
}

function ReviewRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm text-foreground">{children}</dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <Pencil className="size-3.5" /> Edit
      </button>
    </div>
  );
}

function Label({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean | undefined;
}) {
  return (
    <p className="mb-2.5 block text-sm font-semibold text-foreground">
      {children}
      {optional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
    </p>
  );
}

function ScreenFields({
  screen,
  answers,
  onAnswer,
  showProblems,
}: {
  screen: Screen;
  answers: Answers;
  onAnswer: (key: string, value: string | string[]) => void;
  showProblems: boolean;
}) {
  const many = screen.questions.length > 1;
  return (
    <div className="space-y-7">
      {screen.questions.map((q) => (
        <div key={q.key}>
          {(many || q.control !== "cards") && q.label !== screen.title && (
            <Label optional={q.optional}>{q.label}</Label>
          )}
          <QuestionControl q={q} value={answers[q.key]} onChange={(v) => onAnswer(q.key, v)} />
          {showProblems && !q.optional && !hasValue(answers[q.key]) && (
            <p className="mt-2 text-sm text-destructive">
              Please pick one{q.control === "chips" ? " or more" : ""}.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function hasValue(v: string | string[] | undefined) {
  return Array.isArray(v) ? v.length > 0 : Boolean(v && v.trim());
}

function QuestionControl({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  if (q.control === "cards") {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {q.options?.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={on}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition hover:border-primary/60",
                on ? "border-primary ring-2 ring-primary/20" : "border-border/70",
              )}
            >
              <span>
                <span className="block text-[15px] font-medium text-foreground">{o.label}</span>
                {o.hint && <span className="block text-xs text-muted-foreground">{o.hint}</span>}
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {on && <Check className="size-3" />}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (q.control === "chips") {
    const list = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {q.options?.map((o) => {
          const on = list.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? list.filter((v) => v !== o.value) : [...list, o.value])}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-[15px] transition",
                on
                  ? "border-primary bg-secondary font-medium text-primary"
                  : "border-border/70 bg-card text-foreground hover:border-primary/60",
              )}
            >
              {on && <Check className="size-4" />}
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  if (q.control === "select") {
    return (
      <Select value={typeof value === "string" ? value : ""} onValueChange={onChange}>
        <SelectTrigger className="h-14 rounded-2xl bg-card px-4 text-base">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectContent>
          {q.options?.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (q.control === "textarea") {
    return (
      <Textarea
        rows={5}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        className="rounded-2xl bg-card px-4 py-3 text-base"
      />
    );
  }
  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder}
      className="h-14 rounded-2xl bg-card px-4 text-base"
    />
  );
}

function AboutFields({
  about,
  onChange,
  mobileIssue,
  showProblems,
}: {
  about: About;
  onChange: (patch: Partial<About>) => void;
  mobileIssue: string | null;
  showProblems: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label>Full name</Label>
        <Input
          autoComplete="name"
          value={about.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Juan Dela Cruz"
          className="h-14 rounded-2xl bg-card px-4 text-lg"
        />
        {showProblems && about.fullName.trim().length < 2 && (
          <p className="mt-2 text-sm text-destructive">Please give your name.</p>
        )}
      </div>
      <div>
        <Label>Mobile</Label>
        <MobileInput
          value={about.mobile}
          onChange={(v) => onChange({ mobile: v })}
          placeholder="0995 516 6278"
          className="h-14 rounded-2xl bg-card px-4 text-lg"
        />
        {showProblems && mobileIssue && (
          <p className="mt-2 text-sm text-destructive">{mobileIssue}</p>
        )}
      </div>
      <div>
        <Label>Where did you find Marj?</Label>
        <Select value={about.source} onValueChange={(v) => onChange({ source: v })}>
          <SelectTrigger className="h-14 rounded-2xl bg-card px-4 text-base">
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectContent>
            {SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showProblems && !about.source && (
          <p className="mt-2 text-sm text-destructive">Please pick one.</p>
        )}
      </div>
      <div>
        <Label optional>Anything else we should know?</Label>
        <Textarea
          rows={3}
          value={about.note}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="Questions, links, anything."
          className="rounded-2xl bg-card px-4 py-3 text-base"
        />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={about.consent}
          onCheckedChange={(v) => onChange({ consent: v === true })}
          className="mt-0.5"
        />
        <span>
          I agree to the{" "}
          <Link
            to="/privacy"
            target="_blank"
            className="font-medium text-primary underline underline-offset-2"
          >
            Privacy Notice
          </Link>{" "}
          and to Marj&apos;s team contacting me about this request.
        </span>
      </label>
      {showProblems && !about.consent && (
        <p className="-mt-3 text-sm text-destructive">Please tick the box to continue.</p>
      )}
    </div>
  );
}
