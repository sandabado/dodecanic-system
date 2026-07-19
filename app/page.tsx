import type { Metadata } from "next";
import { ObserverConsole } from "@/components/ObserverConsole";

export const metadata: Metadata = {
  title: "Dodecanic AI — Observer Console",
  description: "Read eight signal currents, inspect their interactions, and resolve the system valve.",
};

export default function Home() {
  return <ObserverConsole />;
}
