import React from "react";
import LayoutContext from "./layoutcontext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex h-screen max-h-screen w-full max-w-screen flex-col`}>
      <LayoutContext children={children} />
    </div>
  );
}
