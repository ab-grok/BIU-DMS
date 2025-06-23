"use client";
// import { colSchema, db, Tb, rowData } from "@/lib/actions";
import { colSchema, db, rowData, Tb } from "@/lib/actions";
import React, { createContext, SetStateAction, useContext } from "react";

type tbArr = {
  dbName: string;
  tbList: Tb[];
}[];

export type rcData = {
  tbPath: string; //dbName/tbName
  rcRows: rowData[];
  rcHeader: colSchema[];
};

type rcType = rcData[];

export type uAccess = {
  tb: { tbPath: string; edit: boolean }[];
  // db: {dbPath: string, edit: boolean, view: boolean}[] // -- not needed
};

type fetchContext = {
  dbs: db[];
  setDbs: React.Dispatch<React.SetStateAction<db[]>>;
  allTbs: tbArr;
  setAllTbs: React.Dispatch<React.SetStateAction<tbArr>>;
  uData: string; //uid&title&fname
  setUdata: React.Dispatch<React.SetStateAction<string>>;
  rc: rcType;
  setRc: React.Dispatch<React.SetStateAction<rcType>>;
  uAccess: uAccess;
  setUAccess: React.Dispatch<SetStateAction<uAccess>>;
};

export function useFetchContext() {
  return useContext(fetchContext);
}

const fetchContext = createContext({} as fetchContext);
export default function FetchContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dbs, setDbs] = React.useState([] as db[]);
  const [allTbs, setAllTbs] = React.useState([] as tbArr);
  const [uData, setUdata] = React.useState("");
  const [rc, setRc] = React.useState([] as rcType);
  const [uAccess, setUAccess] = React.useState({} as uAccess);

  return (
    <fetchContext.Provider
      value={{
        rc,
        setRc,
        dbs,
        setDbs,
        allTbs,
        setAllTbs,
        uData,
        setUdata,
        uAccess,
        setUAccess,
      }}
    >
      {children}
    </fetchContext.Provider>
  );
}
