"use client";
import { db, Tb } from "@/lib/actions";
import React, { createContext, useContext } from "react";

type tbArr = {
  dbName: string;
  tbList: Tb[];
}[];

type rc = {
  tbPath: string; //dbName/tbName
  rcData: string; //
};

type rcArr = {
  rcPath: string; //dbName/tbName
  rcArr: string;
};

type fetchContext = {
  dbs: db[];
  setDbs: React.Dispatch<React.SetStateAction<db[]>>;
  allTbs: tbArr;
  setAllTbs: React.Dispatch<React.SetStateAction<tbArr>>;
  uData: string; //uid&title&fname
  setUdata: React.Dispatch<React.SetStateAction<string>>;
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

  return (
    <fetchContext.Provider
      value={{
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
