"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  Dispatch,
} from "react";

import Loading from "@/components/loading";

type isLoading = string;
type loadingType = {
  isLoading: isLoading;
  setIsLoading: Dispatch<SetStateAction<isLoading>>;
  sidebarEditable: boolean;
  setSidebarEditable: Dispatch<SetStateAction<boolean>>;
};
export const loadingContext = createContext({} as loadingType);

export function useLoading() {
  const context = useContext(loadingContext);
  console.log("isLoading from loading function: " + context.isLoading);
  return context;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState("");
  const [sidebarEditable, setSidebarEditable] = useState(false);
  return (
    <loadingContext.Provider
      value={{ isLoading, setIsLoading, sidebarEditable, setSidebarEditable }}
    >
      {children}
    </loadingContext.Provider>
  );
}
