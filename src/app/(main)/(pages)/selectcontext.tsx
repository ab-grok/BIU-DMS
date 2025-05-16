import { createContext, Dispatch, useContext, useState } from "react";

const selectionContext = createContext({} as selections);
export function useSelection() {
  const context = useContext(selectionContext);
  return context;
}

type routes = {
  tbUsers: string[];
};
export type createTbCol = {
  //title - tbName/desc/column, name - SchoolTable,
  name: string;
  unique?: number;
  primary?: number;
  notnull?: number;
  ai?: number;
  defaultStr?: string;
  defaultNum?: number;
  type: number; //1- text, 2- number, 3- boolean, 4- date, 5-file
}[];

export type createTbMeta = {
  dbName: string;
  tbName: string;
  createdBy: string;
  desc: string | undefined;
  editors: string;
  viewers: string;
};

export type views = {
  db: number;
  tb: number;
};
export type selectedTbUsers = {
  //replacing a user: sameTable - userid1?db1/tb1, userid2?db1/tb1 : otherTable - userid1?db2/tb2
  viewers: string;
  editors: string;
};

type selections = {
  // colorState: string;
  // setColorState: Dispatch<React.SetStateAction<string>>;

  selectedTbUsers: selectedTbUsers;
  setSelectedTbUsers: Dispatch<React.SetStateAction<selectedTbUsers>>; //users can be editors or viewers
  views: views;
  setViews: Dispatch<React.SetStateAction<views>>; //number of views seen on the users page header
  edits: views;
  setEdits: Dispatch<React.SetStateAction<views>>;
  selectedTb: string;
  setSelectedTb: Dispatch<React.SetStateAction<string>>;
  create: string;
  setCreate: Dispatch<React.SetStateAction<string>>;
  selectedRecords: string;
  setSelectedRecords: Dispatch<React.SetStateAction<string>>;
  quickA: string;
  setQuickA: Dispatch<React.SetStateAction<string>>;
  createTbMeta: createTbMeta;
  setCreateTbMeta: Dispatch<React.SetStateAction<createTbMeta>>;
  createTbCol: createTbCol;
  setCreateTbCol: Dispatch<React.SetStateAction<createTbCol>>;
};

export default function SelectionContext({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [colorState, setColorState] = useState<string>("");
  const [selectedRecords, setSelectedRecords] = useState<string>("");
  const [selectedTb, setSelectedTb] = useState<string>("");
  const [create, setCreate] = useState<string>("");
  const [quickA, setQuickA] = useState<string>("");
  const [createTbMeta, setCreateTbMeta] = useState({} as createTbMeta);
  const [createTbCol, setCreateTbCol] = useState({} as createTbCol);
  const [views, setViews] = useState({ tb: 0, db: 0 });
  const [edits, setEdits] = useState({ tb: 0, db: 0 });
  const [selectedTbUsers, setSelectedTbUsers] = useState({
    viewers: "",
    editors: "",
  });
  return (
    <selectionContext.Provider
      value={{
        selectedTbUsers,
        setSelectedTbUsers,
        views,
        setViews,
        edits,
        setEdits,
        createTbMeta,
        setCreateTbMeta,
        createTbCol,
        setCreateTbCol,
        create,
        setCreate,
        selectedRecords,
        setSelectedRecords,
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
