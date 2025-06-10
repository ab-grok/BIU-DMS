"use client";
import { colSchema, db, Tb, rowData } from "@/lib/actions";
import React, { createContext, useContext } from "react";

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

type test = Array<string | number>;

type fetchContext = {
  dbs: db[];
  setDbs: React.Dispatch<React.SetStateAction<db[]>>;
  allTbs: tbArr;
  setAllTbs: React.Dispatch<React.SetStateAction<tbArr>>;
  uData: string; //uid&title&fname
  setUdata: React.Dispatch<React.SetStateAction<string>>;
  rc: rcType;
  setRc: React.Dispatch<React.SetStateAction<rcType>>;
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
  const [rc, setRc] = React.useState({} as rcType);

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
      }}
    >
      {children}
    </fetchContext.Provider>
  );
}
