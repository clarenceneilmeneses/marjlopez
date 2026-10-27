/**
 * One offer's own page (the boss, 2026-10-28). Each offer has a layout of its
 * own — hero to footer — so the four don't read as one template with the
 * words swapped (Clarence, 2026-10-28: "to avoid the ai slop feel"):
 *
 *   management  a well-run property: night photo, an "included" card, a
 *               ruled hand-off list, the catch as a pull quote
 *   seminar     an event with Marj: light page, his portrait in an arch, a
 *               ticket, pinned photos, a printed programme
 *   invest      a prospectus: split hero with an at-a-glance table, the risk
 *               boxed before the pitch, a project strip ending in "yours"
 *   system      a product page: the real admin in a browser frame, a tabbed
 *               tour with screenshots, the payment partners
 *
 * The words are the same fields on every page (lib/offers.ts, editable in
 * Admin → Website); only how they're laid out differs.
 */
import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import type { Offer, OfferSlug } from "@/lib/offers";
import type { LandingContent } from "@/lib/site-content";

import { InvestLayout } from "./offers/invest";
import { ManagementLayout } from "./offers/management";
import { SeminarLayout } from "./offers/seminar";
import { SystemLayout } from "./offers/system";

const LAYOUTS: Record<OfferSlug, (p: { o: Offer; landing: LandingContent }) => React.ReactNode> = {
  management: ManagementLayout,
  seminar: SeminarLayout,
  invest: InvestLayout,
  system: SystemLayout,
};

export function OfferPage({ offer, landing }: { offer: Offer; landing: LandingContent }) {
  const Layout = LAYOUTS[offer.slug];
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content" className="pb-6">
        <Layout o={offer} landing={landing} />
      </main>
      <PublicFooter />
    </div>
  );
}
