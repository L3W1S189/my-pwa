import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lewis’ iPhone App",
  description: "My first iPhone-style web app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* iOS PWA settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lewis’ iPhone App" />

        {/* Viewport for notch / safe areas */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>

      <body className="bg-black text-white">{children}</body>
    </html>
  );
}