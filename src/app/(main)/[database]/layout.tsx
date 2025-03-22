import React, { useContext } from "react";
import LayoutDb from "./layoutdb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <LayoutDb children={children} />
    </div>
  );
}
