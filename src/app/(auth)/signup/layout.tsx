import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="relative h-full w-full">{children}</div>;
}
