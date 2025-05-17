import type { Metadata } from "next";
import "./globals.css";
import dotenv from "dotenv";
import { ThemeProvider } from "next-themes";
import DialogContexts from "./dialogcontext";
import { montserrat } from "@/lib/utils";

dotenv.config();

export const metadata: Metadata = {
  title: {
    template: "%s | BIU ",
    default: "Department Records Management",
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
      <body className={`${montserrat.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DialogContexts>{children}</DialogContexts>
        </ThemeProvider>
      </body>
    </html>
  );
}
