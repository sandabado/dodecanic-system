import type { Metadata } from "next";
import { QuincunxDashboard } from "@/components/quincunx/QuincunxDashboard";

export const metadata: Metadata = {
  title: "Whole-Body Quincunx",
  description: "Trace every prompt through the five pillars, twelve faces, thirty edges, and Position 9 observer.",
};

export default function QuincunxPage() {
  return <QuincunxDashboard />;
}
