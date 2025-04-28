import { createContext, Dispatch, useContext, useState } from "react";

const selectionContext = createContext({} as selections);
export function useSelection() {
  const context = useContext(selectionContext);
  return context;
}

type routes = {
  tbUsers: string[];
};
type users = {
  viewers: string;
  editors: string;
};
const users = {
  //selectedUsers, editors: name!?table, viewers: name?table,
};

type selections = {
  colorState: string;
  setColorState: Dispatch<React.SetStateAction<string>>;
  selectedUsers: string;
  setSelectedUsers: Dispatch<React.SetStateAction<string>>;
  selectedTb: string;
  setSelectedTb: Dispatch<React.SetStateAction<string>>;
  quickA: string;
  setQuickA: Dispatch<React.SetStateAction<string>>;
};

export default function SelectionContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string>("");
  const [colorState, setColorState] = useState<string>("");
  const [selectedTb, setSelectedTb] = useState<string>("no slecton");
  const [quickA, setQuickA] = useState<string>("");
  return (
    <selectionContext.Provider
      value={{
        selectedUsers,
        setSelectedUsers,
        colorState,
        setColorState,
        selectedTb,
        setSelectedTb,
        quickA,
        setQuickA,
      }}
      children={children}
    />
  );
}

//is not currently in use
