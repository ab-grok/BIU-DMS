import { createContext, Dispatch, useContext, useState } from "react";

const selectionContext = createContext({} as selections);
export function useSelection() {
  return useContext(selectionContext);
}

type routes = { tbUsers: string[] };

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
}
export type createDbMeta = {
  createdBy: string;
  editors: string[];
  viewers: string[];
};

export type views = { db: number; tb: number };

type selectUsers = {
  viewers: string; // userId?dbName/tbName,,
  editors: string;
};

type created = { db: string; tb: string; rc: string; rh: string };
export type orderType = { db: orderObj; tb: orderObj; rc: orderObj }; //col&$asc

const orderObj = { col: "", order: "asc", new: false };
type orderObj = { col: string; order: string; new: boolean };

export type selectedRc = {
  path: string; //dbName/tbName
  rows: string[]; //[[col1, val1], [col2, val2]]
};

type selections = {
  selectedTbUsers: selectUsers;
  setSelectedTbUsers: Dispatch<React.SetStateAction<selectUsers>>;
  selectedDbUsers: selectUsers;
  setSelectedDbUsers: Dispatch<React.SetStateAction<selectUsers>>; //db userId?dbName
  views: views;
  setViews: Dispatch<React.SetStateAction<views>>; //count of viewers seen on the users_page header
  edits: views;
  setEdits: Dispatch<React.SetStateAction<views>>;
  selectedTb: string[];
  setSelectedTb: Dispatch<React.SetStateAction<string[]>>;
  selectedRc: selectedRc[];
  setSelectedRc: Dispatch<React.SetStateAction<selectedRc[]>>;
  create: string;
  setCreate: Dispatch<React.SetStateAction<string>>; //db/tb
  created: created;
  setCreated: Dispatch<React.SetStateAction<created>>; // for retriggering effects (can be used for )
  setOrderBy: Dispatch<React.SetStateAction<orderType>>; //
  orderBy: orderType;
  hideQA: boolean;
  setHideQA: Dispatch<React.SetStateAction<boolean>>;
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
  const [selectedTb, setSelectedTb] = useState([] as string[]);
  const [selectedRc, setSelectedRc] = useState([] as selectedRc[]);
  const [create, setCreate] = useState<string>("");
  const [created, setCreated] = useState({ db: "", tb: "", rc: "", rh: "" });
  const [orderBy, setOrderBy] = useState({
    db: orderObj,
    tb: orderObj,
    rc: orderObj,
  });
  const [hideQA, setHideQA] = useState(false);
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
        selectedTb,
        setSelectedTb,
        selectedRc,
        setSelectedRc,
        hideQA,
        setHideQA,
        orderBy,
        setOrderBy,
      }}
    >
      {children}
    </selectionContext.Provider>
  );
}

//is not currently in use
