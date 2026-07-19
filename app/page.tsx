import type { Metadata } from "next";
import { BirthPortal } from "@/components/BirthPortal";

export const metadata: Metadata = {
  title: "Birth Portal",
  description: "Enter your birth date, birth time, and birthplace to orient the Dodecanic living field.",
};

export default function Home() {
  return <BirthPortal />;
}
