/**
 * Sign in or create an account — asked as late as possible (PRD §7.1): the
 * inquiry form's last screen, or the header's Sign in. The answers already
 * given survive it (they are in sessionStorage, see routes/inquire.tsx).
 */
import { Loader2, MailCheck } from "@/components/icons";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function AuthPanel({
  defaultMode = "signup",
  fullName,
  onDone,
  className,
}: {
  defaultMode?: "signup" | "signin";
  /** Saved on the new account, from the form's "About you". */
  fullName?: string;
  onDone?: () => void;
  className?: string;
}) {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName ?? "" },
          ...(typeof window !== "undefined" ? { emailRedirectTo: window.location.href } : {}),
        },
      });
      setBusy(false);
      if (err) {
        setError(
          err.message.includes("already registered")
            ? "That email already has an account — sign in instead."
            : err.message,
        );
        return;
      }
      if (!data.session) {
        setCheckEmail(true);
        return;
      }
      onDone?.();
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (err) {
        setError(
          err.message === "Invalid login credentials"
            ? "That email and password don't match."
            : err.message,
        );
        return;
      }
      onDone?.();
    }
  };

  if (checkEmail) {
    return (
      <div className={cn("rounded-2xl border border-border/70 bg-card p-5 text-sm", className)}>
        <MailCheck className="size-6 text-primary" />
        <p className="mt-2 font-semibold">Check your email</p>
        <p className="mt-1 text-muted-foreground">
          We sent a link to {email}. Open it on this device and you&apos;ll come straight back here
          — your answers are saved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className={cn("space-y-3", className)}>
      <div className="inline-flex rounded-full border border-border/70 bg-card p-1 shadow-level-1">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "h-8 rounded-full px-4 text-sm transition-colors",
              mode === m
                ? "bg-secondary font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "signup" ? "New here" : "I have an account"}
          </button>
        ))}
      </div>
      <Input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-14 rounded-2xl px-4 text-base"
      />
      <Input
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        placeholder={mode === "signup" ? "Create a password (6+ characters)" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-14 rounded-2xl px-4 text-base"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base"
        disabled={busy || !email || password.length < 6}
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}

export function SignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="brand-caps text-xl text-primary">Sign in</DialogTitle>
          <DialogDescription>To see your messages from Marj&apos;s team.</DialogDescription>
        </DialogHeader>
        <AuthPanel defaultMode="signin" onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
