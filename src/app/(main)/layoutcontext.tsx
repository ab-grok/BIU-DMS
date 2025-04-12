"use client";

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import Navbar from "./(components)/navbar";
import SideBar from "./(components)/sidebar";
import { useRouter } from "next/navigation";
import { validateSession } from "@/lib/sessions";

type sideContextType = {
  database: string;
  sidebarClicked: boolean;
  dbExpanded: boolean;
  sbExpanded: boolean;
};

export type sideContextState = {
  sidebarState: sideContextType;
  setSidebarState: Dispatch<SetStateAction<sideContextType>>;
};

export const sideContext = createContext({} as sideContextState);
export function useSideContext() {
  const context = useContext(sideContext);
  const db = context.sidebarState.database;
  return { context, db };
}

export default function LayoutContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarState, setSidebarState] = useState({} as sideContextType);
  return (
    <sideContext.Provider value={{ sidebarState, setSidebarState }}>
      <Navbar />
      <div className="relative top-[4rem] flex h-screen max-h-[90%] w-screen max-w-[100%] space-x-2">
        {" "}
        <SideBar />
        {children}
      </div>
    </sideContext.Provider>
  );
}
