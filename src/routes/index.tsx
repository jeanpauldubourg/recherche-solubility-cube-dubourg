import { createFileRoute } from "@tanstack/react-router";
import { DSCExplorer } from "@/components/dsc/DSCExplorer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSC Explorer V5.3.1 — Espace de raisonnement" },
      {
        name: "description",
        content:
          "Observation locale, hypothèses DSC, stratigraphie et revue entre pairs en conservation-restauration, sans prescription chimique.",
      },
      { property: "og:title", content: "DSC Explorer V5.3.1 — Espace de raisonnement" },
      {
        property: "og:description",
        content:
          "Un espace pédagogique pour documenter observations, incertitudes, sources et contradictions en conservation-restauration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DSCExplorer,
});
