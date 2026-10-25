/**
 * The thin bar along the top of the window while something is loading.
 *
 * Clarence, 2026-10-01: "add proper loading animations on stuff so it doesnt
 * leave users with bad ux". The worst of it was the click that does nothing
 * visible: a link whose page code or data has not arrived yet, or a Save
 * that takes a second. This answers every one of those, everywhere, from one
 * place — the admin, the guest site and the portals all mount under the root.
 *
 * WHAT COUNTS AS LOADING
 *   - the router is resolving a navigation (page code, loaders);
 *   - a query is fetching for the FIRST time (no data yet) — not the bell's
 *     once-a-minute refresh, which would flash the bar forever;
 *   - a mutation is running (a Save, a Verify, an upload).
 *
 * It waits 150ms before appearing, so instant actions don't flicker, and
 * stays at least 300ms once shown, so it never blinks. Indeterminate: it
 * cannot honestly know how far along a request is, so it does not pretend.
 */
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const SHOW_AFTER_MS = 150;
const MIN_VISIBLE_MS = 300;

export function TopProgress() {
  const navigating = useRouterState({ select: (s) => s.status === "pending" });
  const firstLoads = useIsFetching({ predicate: (q) => q.state.data === undefined });
  const saving = useIsMutating();
  const busy = navigating || firstLoads > 0 || saving > 0;

  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (busy) {
      const t = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, SHOW_AFTER_MS);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    const left = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const t = setTimeout(() => setVisible(false), left);
    return () => clearTimeout(t);
  }, [busy, visible]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="malaya-progress h-full w-1/3 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
    </div>
  );
}
