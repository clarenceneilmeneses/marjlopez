import { createFileRoute, redirect } from "@tanstack/react-router";

/** The seminar became 1-on-1 Coaching (2026-11-03); old links land there. */
export const Route = createFileRoute("/seminar")({
  beforeLoad: () => {
    throw redirect({ to: "/coaching", statusCode: 301 });
  },
});
