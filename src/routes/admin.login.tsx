import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "@/components/icons";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: `Team sign in — ${BRAND.name}` }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { session, staff, roleReady, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session && roleReady && staff) return <Navigate to="/admin/inbox" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="grid min-h-screen place-items-center bg-surface-muted px-4 malaya-grain">
      <div className="w-full max-w-sm rounded-2xl bg-card p-7 shadow-level-2">
        <p className="font-display text-[15px] tracking-[0.18em] text-foreground">
          {BRAND.wordmark}
        </p>
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Inquiry Inbox
        </p>
        <h1 className="mt-6 font-display text-2xl font-semibold">Team sign in</h1>
        {session && roleReady && !staff ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-muted-foreground">
              {session.user.email} isn&apos;t on the team. Ask Marj to add you, or sign in with your
              team account.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={(e) => void submit(e)}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="h-11 w-full rounded-full"
              disabled={busy || !email || !password}
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Sign in
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
