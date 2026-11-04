/**
 * Sign in or create an account — asked as late as possible (PRD §7.1): the
 * inquiry form's last screen, or the header's Sign in. The answers already
 * given survive it (they are in sessionStorage, see routes/inquire.tsx).
 *
 * Malaya's guest panel (components/public/guest-auth-panel.tsx there), in this
 * site's type (Clarence, 2026-10-26: "improve the sign in sign up"): the two
 * modes as a segmented control ABOVE the fields, so the button at the bottom
 * is never a surprise; labelled fields, a show-password eye, the rule stated
 * before it is broken, and a way back in for a forgotten password.
 *
 * No Google button: the provider is off on this Supabase project, and a button
 * that cannot work has no place on a demo.
 */
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "@/components/icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";

export type AuthMode = "signup" | "signin";
type View = AuthMode | "forgot";

const FIELD = "h-12 rounded-full border-input bg-card px-5 text-base focus-visible:border-ring";

/** Supabase's auth errors, in words a person can act on. The rest pass through. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) {
    return "Confirm your email first — open the link we sent you, then sign in.";
  }
  if (m.includes("rate limit") || m.includes("security purposes")) {
    return "Too many tries for now. Wait a minute, then try again.";
  }
  if (m.includes("password") && m.includes("6")) return "Passwords need at least 6 characters.";
  if (m.includes("email") && m.includes("invalid")) return "That doesn't look like an email.";
  return message;
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function PasswordInput({
  newPassword,
  ...props
}: React.ComponentProps<typeof Input> & { newPassword?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        autoComplete={newPassword ? "new-password" : "current-password"}
        placeholder={newPassword ? "Create a password" : "Your password"}
        className={cn(FIELD, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-1 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <Button
      type="submit"
      disabled={busy}
      className="h-12 w-full justify-between rounded-full px-6 text-base"
    >
      <span>{children}</span>
      {busy ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
    </Button>
  );
}

export function AuthPanel({
  defaultMode = "signup",
  fullName,
  onDone,
  onModeChange,
  className,
}: {
  defaultMode?: AuthMode;
  /** Saved on the new account, from the form's "About you". Asked for when absent. */
  fullName?: string;
  onDone?: () => void;
  /** For a surrounding heading that follows the tab. */
  onModeChange?: (mode: View) => void;
  className?: string;
}) {
  const [view, setViewState] = useState<View>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState<"confirm" | "reset" | null>(null);
  const [tried, setTried] = useState(false);
  const navigate = useNavigate();

  const setView = (v: View) => {
    setViewState(v);
    setError(null);
    setNotice(null);
    setTried(false);
    onModeChange?.(v);
  };

  const askName = view === "signup" && !fullName;
  const problems = {
    name: askName && !name.trim() ? "Tell us what to call you." : null,
    email: !email.trim()
      ? "Enter your email."
      : !emailOk(email)
        ? "That doesn't look like an email."
        : null,
    password:
      view === "forgot"
        ? null
        : !password
          ? "Enter a password."
          : view === "signup" && password.length < 6
            ? "At least 6 characters."
            : null,
  };
  const show = (field: keyof typeof problems) => tried && Boolean(problems[field]);

  const submit = async () => {
    setTried(true);
    if (problems.name || problems.email || problems.password) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const address = email.trim();

    if (view === "forgot") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: window.location.origin,
      });
      setBusy(false);
      if (err) setError(friendly(err.message));
      else setSent("reset");
      return;
    }

    if (view === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: address,
        password,
        options: {
          data: { full_name: (fullName ?? name).trim() },
          emailRedirectTo: window.location.href,
        },
      });
      setBusy(false);
      // With confirmations on, Supabase doesn't say an address is taken: it
      // answers with a user that has no identities. Either way, it's a sign in.
      if (err?.message.includes("already registered") || data.user?.identities?.length === 0) {
        setView("signin");
        setNotice("That email already has an account — sign in instead.");
        return;
      }
      if (err) {
        setError(friendly(err.message));
        return;
      }
      if (!data.session) {
        setSent("confirm");
        return;
      }
      onDone?.();
      return;
    }

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    if (err) {
      setBusy(false);
      setError(friendly(err.message));
      return;
    }
    // One door for everyone (Clarence, 2026-10-26: "login from the user
    // landing page as well while entering admin credentials"): a team login
    // here goes straight on to the admin.
    const { data: team } = await supabase
      .from("staff")
      .select("name")
      .eq("user_id", data.user.id)
      .eq("active", true)
      .maybeSingle();
    setBusy(false);
    onDone?.();
    if (team) {
      toast.success(`Welcome back, ${String(team.name).split(" ")[0]}`, {
        description: "Taking you to the team dashboard.",
      });
      void navigate({ to: "/admin" });
    }
  };

  if (sent) {
    return (
      <div className={cn("space-y-3 rounded-2xl bg-secondary/60 p-5", className)}>
        <span className="grid size-10 place-items-center rounded-full bg-card text-primary shadow-level-1">
          <MailCheck className="size-5" />
        </span>
        <p className="font-display text-lg font-semibold text-foreground">Check your email</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sent === "confirm" ? (
            <>
              We sent a link to <strong className="text-foreground">{email.trim()}</strong>. Open it
              on this device and you&apos;ll come straight back here — your answers are saved.
            </>
          ) : (
            <>
              If <strong className="text-foreground">{email.trim()}</strong> has an account, a link
              to set a new password is on its way.
            </>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => {
            setSent(null);
            if (sent === "reset") setView("signin");
          }}
        >
          {sent === "reset" ? "Back to sign in" : "Use a different email"}
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className={cn("space-y-4", className)}
    >
      {view === "forgot" ? (
        <button
          type="button"
          onClick={() => setView("signin")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </button>
      ) : (
        <div
          role="tablist"
          aria-label="Sign in or create an account"
          className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1"
        >
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={view === m}
              onClick={() => setView(m)}
              className={cn(
                "h-10 rounded-full text-sm transition-all",
                view === m
                  ? "bg-card font-semibold text-primary shadow-level-1"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}

      {notice && (
        <p className="rounded-2xl bg-secondary/70 px-4 py-2.5 text-sm text-foreground">{notice}</p>
      )}

      {askName && (
        <FormField id="auth-name" label="Your name" problem={problems.name} show={show("name")}>
          {(aria) => (
            <Input
              {...aria}
              autoComplete="name"
              placeholder="Juan dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              className={FIELD}
            />
          )}
        </FormField>
      )}

      <FormField id="auth-email" label="Email" problem={problems.email} show={show("email")}>
        {(aria) => (
          <Input
            {...aria}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className={FIELD}
          />
        )}
      </FormField>

      {view !== "forgot" && (
        <div className="relative">
          {view === "signin" && (
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="absolute right-1 top-0 z-10 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          )}
          <FormField
            id="auth-password"
            label="Password"
            hint={view === "signup" ? "At least 6 characters." : undefined}
            problem={problems.password}
            show={show("password")}
          >
            {(aria) => (
              <PasswordInput
                {...aria}
                newPassword={view === "signup"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            )}
          </FormField>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <SubmitButton busy={busy}>
        {view === "forgot"
          ? busy
            ? "Sending…"
            : "Send me a reset link"
          : view === "signup"
            ? busy
              ? "Creating your account…"
              : "Create account"
            : busy
              ? "Signing in…"
              : "Sign in"}
      </SubmitButton>

      {view === "signup" && (
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you accept our{" "}
          <Link
            to="/privacy"
            target="_blank"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy notice
          </Link>
          .
        </p>
      )}
    </form>
  );
}

const HEADINGS: Record<View, { title: string; blurb: string }> = {
  signin: { title: "Welcome back", blurb: `Sign in to see your messages from ${BRAND.team}.` },
  signup: {
    title: "Create your account",
    blurb: `Your conversation with ${BRAND.team} lives here, not in a DM that gets buried.`,
  },
  forgot: { title: "Reset your password", blurb: "We'll email you a link to set a new one." },
};

/** The mark the dialogs open with — the chat header's "M". */
function Mark() {
  return (
    <span className="mx-auto mb-2 grid size-11 place-items-center rounded-full bg-primary font-display text-base text-primary-foreground shadow-level-2">
      M
    </span>
  );
}

function AuthHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <DialogHeader className="text-center sm:text-center">
      <Mark />
      <DialogTitle className="site-display text-2xl text-brand-heading">{title}</DialogTitle>
      <DialogDescription>{blurb}</DialogDescription>
    </DialogHeader>
  );
}

export function SignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [view, setView] = useState<View>("signin");
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setView("signin");
      }}
    >
      <DialogContent className="gap-5 p-7 sm:max-w-[400px]">
        <AuthHeader {...HEADINGS[view]} />
        {/* Keyed on open, so a reopened dialog starts clean. */}
        <AuthPanel
          key={String(open)}
          defaultMode="signin"
          onModeChange={setView}
          onDone={() => onOpenChange(false)}
        />
        {view === "signin" && (
          <p className="-mt-1 text-center text-xs text-muted-foreground">
            On Marj&apos;s team? Sign in here too — you&apos;ll go straight to the dashboard.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Where a reset link lands. Supabase signs the person in from the link and
 * fires PASSWORD_RECOVERY on whichever page that is, so this sits in the root
 * rather than on a page of its own.
 */
export function NewPasswordDialog() {
  const { recovering, endRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const save = async () => {
    if (password.length < 6) {
      setError("At least 6 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(friendly(err.message));
    else setDone(true);
  };

  return (
    <Dialog open={recovering} onOpenChange={(o) => !o && endRecovery()}>
      <DialogContent className="gap-5 p-7 sm:max-w-[400px]">
        <AuthHeader
          title={done ? "Password saved" : "Set a new password"}
          blurb={done ? "You're signed in — use it next time." : "Pick one you'll remember."}
        />
        {done ? (
          <Button className="h-12 rounded-full text-base" onClick={endRecovery}>
            Done
          </Button>
        ) : (
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <FormField
              id="new-password"
              label="New password"
              hint="At least 6 characters."
              problem={error}
            >
              {(aria) => (
                <PasswordInput
                  {...aria}
                  newPassword
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              )}
            </FormField>
            <SubmitButton busy={busy}>{busy ? "Saving…" : "Save password"}</SubmitButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
