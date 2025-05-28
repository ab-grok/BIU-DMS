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

export interface createTbMeta {
  dbName: string;
  tbName: string;
  desc: string | undefined;
  // createdBy: string; //uid&ttl&fname
  // editors: string; //not needed
  // viewers: string;
}
export type createDbMeta = {
  createdBy: string;
  editors: string[];
  viewers: string[];
};

export type views = {
  db: number;
  tb: number;
};

type selectUsers = {
  viewers: string; // userId?dbName/tbName,,
  editors: string;
};

type selections = {
  // colorState: string;
  // setColorState: Dispatch<React.SetStateAction<string>>;

  selectedTbUsers: selectUsers;
  setSelectedTbUsers: Dispatch<React.SetStateAction<selectUsers>>;
  selectedDbUsers: selectUsers;
  setSelectedDbUsers: Dispatch<React.SetStateAction<selectUsers>>; //db userId?dbName
  views: views;
  setViews: Dispatch<React.SetStateAction<views>>; //count of viewers seen on the users_page header
  edits: views;
  setEdits: Dispatch<React.SetStateAction<views>>;
  selectedTb: string;
  setSelectedTb: Dispatch<React.SetStateAction<string>>;
  // multiSelectedTb: string;
  // setMultiSelectedTb: Dispatch<React.SetStateAction<string>>;
  create: string;
  setCreate: Dispatch<React.SetStateAction<string>>; //db/tb
  created: { db: string; tb: string };
  setCreated: Dispatch<React.SetStateAction<{ db: string; tb: string }>>; // for retriggering ListTables
  selectedRecords: string;
  setSelectedRecords: Dispatch<React.SetStateAction<string>>;
  quickA: string;
  setQuickA: Dispatch<React.SetStateAction<string>>;
  createTbMeta: createTbMeta;
  setCreateTbMeta: Dispatch<React.SetStateAction<createTbMeta>>;
  createTbCol: createTbCol;
  setCreateTbCol: Dispatch<React.SetStateAction<createTbCol>>;
  createDbMeta: createDbMeta;
  setCreateDbMeta: Dispatch<React.SetStateAction<createDbMeta>>;
};

export default function SelectionContext({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [multiSelectedTb, setMultiSelectedTb] = useState<string>("");
  const [selectedRecords, setSelectedRecords] = useState<string>("");
  const [selectedTb, setSelectedTb] = useState<string>("");
  const [create, setCreate] = useState<string>("");
  const [created, setCreated] = useState({ db: "", tb: "" });
  const [quickA, setQuickA] = useState<string>("");
  const [createTbMeta, setCreateTbMeta] = useState({} as createTbMeta);
  const [createDbMeta, setCreateDbMeta] = useState({} as createDbMeta);
  const [createTbCol, setCreateTbCol] = useState({} as createTbCol);
  const [views, setViews] = useState({ tb: 0, db: 0 });
  const [edits, setEdits] = useState({ tb: 0, db: 0 });
  const [selectedTbUsers, setSelectedTbUsers] = useState({} as selectUsers);
  const [selectedDbUsers, setSelectedDbUsers] = useState({} as selectUsers);

  return (
    <selectionContext.Provider
      value={{
        // multiSelectedTb,
        // setMultiSelectedTb,
        selectedTbUsers,
        setSelectedTbUsers,
        selectedDbUsers,
        setSelectedDbUsers,
        views,
        setViews,
        edits,
        setEdits,
        createDbMeta,
        setCreateDbMeta,
        createTbMeta,
        setCreateTbMeta,
        createTbCol,
        setCreateTbCol,
        create,
        setCreate,
        created,
        setCreated,
        selectedRecords,
        setSelectedRecords,
        selectedTb,
        setSelectedTb,
        quickA,
        setQuickA,
      }}
    >
      {children}
    </selectionContext.Provider>
  );
}

//is not currently in use
