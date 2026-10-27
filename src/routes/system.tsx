import { createFileRoute } from "@tanstack/react-router";

import { OfferPage } from "@/components/site/offer-page";
import { BRAND } from "@/lib/brand";
import { OFFERS } from "@/lib/offers";

const offer = OFFERS.system;

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [{ title: `${offer.name} — ${BRAND.name}` }, { name: "description", content: offer.sub }],
  }),
  component: () => <OfferPage slug="system" />,
});
