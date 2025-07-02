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

export type rcDim = {
  w: "sm" | "md" | "lg";
  h: "sm" | "md" | "lg";
};

export type sideContextState = {
  rcSize: rcDim;
  setRcSize: Dispatch<SetStateAction<rcDim>>;
  sbState: sideContextType;
  setSbState: Dispatch<SetStateAction<sideContextType>>;
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
  showToolbar: boolean;
  setShowToolbar: Dispatch<SetStateAction<boolean>>;
  showTag: boolean;
  setShowTag: Dispatch<SetStateAction<boolean>>;
};

export function useRcConfig() {
  const { rcSize, setRcSize, editMode, setEditMode } = useContext(sideContext);
  return { rcSize, setRcSize, editMode, setEditMode };
}

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
  const [sbState, setSbState] = useState({
    sbExpanded: true,
  } as sideContextType);
  const [rcSize, setRcSize] = useState({ w: "md", h: "sm" } as rcDim);
  const [editMode, setEditMode] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showTag, setShowTag] = useState(false);
  return (
    <sideContext.Provider
      value={{
        showTag,
        setShowTag,
        showToolbar,
        setShowToolbar,
        editMode,
        setEditMode,
        rcSize,
        setRcSize,
        sbState,
        setSbState,
      }}
    >
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
