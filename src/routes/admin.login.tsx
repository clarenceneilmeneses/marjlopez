/**
 * The team's sign-in (Clarence, 2026-10-26: "improve the admin login ui").
 * A two-panel card: Marj on the left with what the inbox is for, the form on
 * the right in the public sign-in's fields. On a phone the photo becomes a
 * band over the form. The landing page's Sign in takes team logins too and
 * sends them on to the dashboard, so this page is the bookmark, not the only
 * door.
 */
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, LogOut, MessagesSquare } from "@/components/icons";
import { useState } from "react";

import { PasswordInput } from "@/components/site/auth-panel";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: `Team sign in — ${BRAND.name}` }] }),
  component: AdminLogin,
});

const FIELD = "h-12 rounded-full border-input bg-card px-5 text-base focus-visible:border-ring";

function AdminLogin() {
  const { session, staff, roleReady, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session && roleReady && staff) return <Navigate to="/admin" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err)
      setError(
        err.message === "Invalid login credentials"
          ? "That email and password don't match."
          : err.message,
      );
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-surface-muted p-3 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] bg-card shadow-level-3 md:grid-cols-[1.05fr_1fr]">
        {/* Marj, and what this is */}
        <div className="relative min-h-44 overflow-hidden bg-[#141313] md:min-h-[560px]">
          <img
            src="/brand/marj.webp"
            alt=""
            className="absolute inset-0 size-full object-cover object-[70%_20%] md:object-[62%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          <div className="relative flex h-full flex-col justify-between gap-6 p-6 text-white sm:p-8">
            <div className="leading-tight">
              <p className="font-display text-[15px] tracking-[0.18em]">{BRAND.wordmark}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/70">Inquiry Inbox</p>
            </div>
            <div className="hidden md:block">
              <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                <MessagesSquare className="size-5" />
              </span>
              <p className="site-display mt-4 text-3xl leading-tight">
                Every inquiry, from first message to closed deal.
              </p>
              <p className="mt-3 max-w-sm text-sm text-white/75">
                Reply, book the call, send the proposal and see how many close — in one place for{" "}
                {BRAND.team}.
              </p>
            </div>
          </div>
        </div>

        {/* The form */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Team only
          </p>
          <h1 className="site-display mt-2 text-3xl text-brand-heading">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in with your team account to open the dashboard.
          </p>

          {session && roleReady && !staff ? (
            <div className="mt-6 space-y-4 rounded-2xl bg-secondary/70 p-5 text-sm">
              <p>
                <span className="font-semibold">{session.user.email}</span>{" "}
                <span className="text-muted-foreground">
                  is a client account, not a team one. Ask Marj to add you, or sign in with your
                  team account.
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive-outline"
                  className="rounded-full"
                  onClick={() => void signOut()}
                >
                  <LogOut className="size-4" /> Sign out
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/messages">My messages</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form noValidate className="mt-7 space-y-4" onSubmit={(e) => void submit(e)}>
              <FormField id="team-email" label="Email">
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
              <FormField id="team-password" label="Password">
                {(aria) => (
                  <PasswordInput
                    {...aria}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                  />
                )}
              </FormField>
              {error && (
                <p
                  role="alert"
                  className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full justify-between rounded-full px-6 text-base"
              >
                <span>{busy ? "Signing in…" : "Sign in"}</span>
                {busy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ArrowRight className="size-5" />
                )}
              </Button>
            </form>
          )}

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to the site
          </Link>
        </div>
      </div>
    </div>
  );
}
