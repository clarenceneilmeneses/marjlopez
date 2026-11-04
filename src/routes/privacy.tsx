import { createFileRoute } from "@tanstack/react-router";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: `Privacy notice — ${BRAND.name}` }] }),
  component: Privacy,
});

/** A plain-language notice for the Data Privacy Act (RA 10173). Draft — for Marj to review. */
function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
        <h1 className="site-display text-3xl text-brand-heading">Privacy notice</h1>
        <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-foreground">
          <p>
            When you send an inquiry, {BRAND.name}&apos;s team collects your name, mobile number,
            email, the answers you give in the form, and the messages and files you send in the
            conversation.
          </p>
          <p>
            We use them only to reply to your request, to schedule calls with you, and to follow up
            on the work you asked about. We don&apos;t sell them or share them with anyone outside
            the team, except service providers that host this site and its database.
          </p>
          <p>
            We keep your conversation for as long as you&apos;re working with us and up to two years
            after, unless you ask us to delete it sooner.
          </p>
          <p>
            Under the Data Privacy Act of 2012 (RA 10173) you can ask to see, correct or delete your
            information. Write to us in your conversation and we&apos;ll act on it within 15 days.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
