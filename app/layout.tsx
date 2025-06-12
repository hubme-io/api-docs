import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Managefy API",
  description: "Created with Managefy",
  generator: "Managefy API",
};

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
