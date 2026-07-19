import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = new URL("/og.jpg", `${protocol}://${host}`).toString();

  return {
    title: {
      default: "Dodecanic AI — Observer Console",
      template: "%s / Dodecanic AI",
    },
    description: "A testable whole-body observer tracing prompts through twelve faces, thirty edges, five pillars, and Position 9.",
    openGraph: {
      title: "Dodecanic AI — Whole-Body Observer",
      description: "One prompt. Twelve faces. Thirty edges. A fully inspectable coherence model.",
      images: [{ url: imageUrl, width: 1200, height: 800, alt: "Dodecanic AI whole-body observer" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Dodecanic AI — Whole-Body Observer",
      description: "One prompt. Twelve faces. Thirty edges. Position 9 observes the whole.",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
