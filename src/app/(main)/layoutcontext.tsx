"use client";

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import Navbar from "./(components)/navbar";
import SideBar from "./(components)/sidebar";

type sideContextType = {
  database: string;
  sidebarClicked: boolean;
  route: string;
  sbExpanded: boolean;
};

export type sideContextState = {
  sbState: sideContextType;
  setSidebarState: Dispatch<SetStateAction<sideContextType>>;
};

export const sideContext = createContext({} as sideContextState);
export function useSideContext() {
  const context = useContext(sideContext);
  const db = context.sbState.database;
  return { context, db };
}

export default function LayoutContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sbState, setSidebarState] = useState({
    sbExpanded: true,
  } as sideContextType);
  return (
    <sideContext.Provider value={{ sbState, setSidebarState }}>
      <Navbar />
      <div className="relative top-[4rem] flex h-screen max-h-[90%] w-screen max-w-[100%] space-x-2">
        {" "}
        <SideBar />
        {children}
      </div>
    </sideContext.Provider>
  );
}

//client calls not secure -- safe: calls are clients themselves
