import type { Metadata } from "next";
import { QuincunxDashboard } from "@/components/quincunx/QuincunxDashboard";

export const metadata: Metadata = {
  title: "Whole-Body Quincunx",
  description: "Meet yourself at the center of a modeled Sphere, torus, twelve-face dodecahedron, and Position 9 system axis.",
};

export default function QuincunxPage() {
  return <QuincunxDashboard />;
}
