import localFont from "next/font/local";

import type { Metadata } from "next";
import "./globals.css";

const sohoPro = localFont({
  src: [
    {
      path: "./fonts/soho-gothic-pro.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/soho-gothic-pro-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/soho-gothic-pro-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Customer Form Portal - Ceylinco Life",
  description:
    "Kindly access this portal using a designated form link provided by Ceylinco Life. Direct access to the main page is not encouraged.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sohoPro.className} antialiased`}>{children}</body>
    </html>
  );
}
