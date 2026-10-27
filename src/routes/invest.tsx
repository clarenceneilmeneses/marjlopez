import { createFileRoute } from "@tanstack/react-router";

import { OfferPage } from "@/components/site/offer-page";
import { BRAND } from "@/lib/brand";
import { fetchSiteContent, landingFrom, offerFrom, offerKey } from "@/lib/site-content";
import { usePreviewDraft } from "@/state/site";

export const Route = createFileRoute("/invest")({
  // The saved words for this page (and the landing's numbers), before it renders.
  loader: () => fetchSiteContent([offerKey("invest"), "landing"]),
  head: ({ loaderData }) => {
    const offer = offerFrom("invest", loaderData ?? {});
    return {
      meta: [
        { title: `${offer.name} — ${BRAND.name}` },
        { name: "description", content: offer.sub },
      ],
    };
  },
  component: Page,
});

function Page() {
  const saved = Route.useLoaderData();
  // In Admin → Website's preview frame, the unsaved words instead.
  const draft = usePreviewDraft(offerKey("invest"));
  const rows = draft === undefined ? saved : { ...saved, [offerKey("invest")]: draft };
  return <OfferPage offer={offerFrom("invest", rows)} landing={landingFrom(rows)} />;
}
