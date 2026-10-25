import { createFileRoute, redirect } from "@tanstack/react-router";

/** The team's home is the Inbox — it is the whole product. */
export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/inbox" });
  },
});
