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
    description: "A living twelve-House field built around the person, their natal origin, the current sky, and the Dodecanic observer.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: "Dodecanic — The Living Field",
      description: "Your origin at the center. Twelve Houses in motion around you.",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "Dodecanic AI living dodecahedral field" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Dodecanic — The Living Field",
      description: "Your origin at the center. Twelve Houses in motion around you.",
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
