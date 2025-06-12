"use client";
import { useFetchContext } from "@/app/(main)/(pages)/fetchcontext";
import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import { colSchema, getTableSchema } from "@/lib/actions";
import { getTbSchema } from "@/lib/server";
import * as React from "react";

type rowHeader = {
  dbName: string;
  tbName: string;
};

export function RowHeader({ dbName, tbName }: rowHeader) {
  const { notify, setNotify } = useNotifyContext();
  const { created } = useSelection();
  const { rc, setRc } = useFetchContext();
  const { setIsLoading } = useLoading();
  const currTb = dbName + "/" + tbName;
  const currRc = rc.find((a) => a.tbPath == currTb);
  const tbPath = currRc?.tbPath;
  const currRh = currRc?.rcHeader;

  type rcType = {
    tbPath: string; //dbName/tbName
    rcRows: any[];
    rcHeader: string[];
  }[];

  React.useEffect(() => {
    if (!currRc) setIsLoading((p) => p + "tbData");
    console.log("in rowHeader, currTb: ", currTb);
    console.log("in rowHeader, tbPath: ", tbPath);
    // (async () => {
    //   console.log(
    //     "in getTb rowHeader dbName,: ",
    //     dbName,
    //     " ...tbName: ",
    //     tbName,
    //   );
    //   const { tbSchema, error } = await getTableSchema(dbName, tbName);
    //   if (error) {
    //     setNotify({ message: error, danger: true });
    //     return;
    //   }
    //   setRc((p) => {
    //     let rcFound = false;
    //     for (const [i, a] of p.entries()) {
    //       if (a.tbPath == currTb) {
    //         rcFound = true;
    //         if (a.rcHeader.length != tbSchema?.length) {
    //           const currRc = { ...a, rcHeader: tbSchema as colSchema[] };
    //           return [...p.slice(0, i), currRc, ...p.slice(i + 1)];
    //         }
    //       }
    //     }
    //     if (rcFound) return p;
    //     else return [
    //       ...p,
    //       { tbPath: currTb, rcHeader: tbSchema as colSchema[], rcRows: []},
    //     ];
    //   });
    // })();
  }, [created.rh, tbPath]);

  return (
    <div className="h-[3rem] w-full overflow-hidden bg-amber-300/70">
      <div className="scrollbar-custom h-full min-w-full overflow-scroll bg-cyan-300">
        {currRh &&
          currRh?.map((a, i) => (
            <RowItem
              key={i + a.colName}
              name={a.colName}
              type={a.type}
              keys={[...(a.keys || []), !a.nullable ? "Not Null" : ""].filter(
                Boolean,
              )}
              i={i}
            />
          ))}
      </div>
    </div>
  );
}

type rowItem = {
  name: string;
  type: string;
  keys: string[]; //["PRIMARY KEY", "UNIQUE"]
  i: number;
};

function RowItem({ name, type, keys, i }: rowItem) {
  return (
    <div
      className={`w-full min-w-[10.75rem] ${i == 0 ? "bg-tb-row1" : "bg-tb-row2"} flex justify-between px-0.5`}
    >
      <p className="h-full w-[8rem] truncate bg-violet-500"> {name}</p>
      <div className="h-full w-[2rem] bg-slate-700"> </div>
    </div>
  );
}
