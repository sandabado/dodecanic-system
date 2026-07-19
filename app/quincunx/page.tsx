import type { Metadata } from "next";
import { QuincunxDashboard } from "@/components/quincunx/QuincunxDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Whole-Body Quincunx",
  description: "Trace every prompt through the five pillars, twelve faces, thirty edges, and Position 9 observer.",
};

export default function QuincunxPage() {
  return (
    <main className="app-shell">
      <SiteHeader activeView="quincunx" />
      <section className="intro quincunx-intro">
        <div>
          <p className="eyebrow">Phase 2 / embodied observer</p>
          <h1>One prompt.<br /><em>The whole body.</em></h1>
        </div>
        <p className="intro-copy">
          The Dodecahedron is the field of creation. The Quincunx is its body.
          Position 9 watches every current cross all thirty unique pathways.
        </p>
      </section>
      <QuincunxDashboard />
      <SiteFooter sequence="PROMPT → BODY → EDGES → TRUST → OBSERVER" />
    </main>
  );
}
