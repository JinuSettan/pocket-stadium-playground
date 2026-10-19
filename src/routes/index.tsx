import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GameCanvas = lazy(() => import("@/components/game/GameCanvas"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Real Football Simulator 3D — Training Ground" },
      { name: "description", content: "Browser 3D football prototype: stadium, physics ball and a controllable player with touch and keyboard controls." },
      { property: "og:title", content: "Real Football Simulator 3D" },
      { property: "og:description", content: "Run a player around a floodlit 3D stadium and push a physics ball." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Suspense fallback={<div className="overlay"><p className="eyebrow">Loading stadium…</p></div>}>
      <GameCanvas />
    </Suspense>
  ),
});
