import type { Metadata } from "next";
import "./globals.css";
import icon from "../assets/images/biu-trans.png";

import localFont from "next/font/local";

export const montserrat = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-montserrat",
  weight: "100 900",
});

export const geist = localFont({
  src: "../../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist-pro",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | BIU ",
    default: "Students Records Management System",
  },
  description: "Computer Science records management system",
  icons: { icon: "/biu-trans.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}
