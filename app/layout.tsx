import type { Metadata } from "next";
import { headers } from "next/headers";
import "./design-system.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = new URL("/og.png", `${protocol}://${host}`).toString();

  return {
    title: {
      default: "Dodecanic — The Living Field",
      template: "%s / Dodecanic",
    },
    description: "A modeled Sphere of twelve Houses built around the person, their supplied origin, and a Position 9 system witness.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "Dodecanic — The Living Field",
      description: "You at the center. A Sphere, torus, and twelve Houses in modeled motion around you.",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Dodecanic AI living dodecahedral field" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Dodecanic — The Living Field",
      description: "You at the center. A Sphere, torus, and twelve Houses in modeled motion around you.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
