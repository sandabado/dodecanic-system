import type { Metadata } from "next";
import { BirthLoading } from "@/components/BirthLoading";

export const metadata: Metadata = {
  title: "Entering the Living Field",
  description: "Your birth coordinates are being placed at the center of the Dodecanic living field.",
};

export default function LoadingPage() {
  return <BirthLoading />;
}
