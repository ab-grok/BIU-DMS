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
  }, [created.rh]);

  return (
    <div className="w-full bg-amber-300">
      {currRh &&
        currRh?.map((a, i) => (
          <div key={a + "rh"}>
            <RowItem
              name={a.colName}
              type={a.type}
              keys={[...(a.keys || []), !a.nullable ? "Not Null" : ""].filter(
                Boolean,
              )}
            />
          </div>
        ))}
    </div>
  );
}

type rowItem = {
  name: string;
  type: string;
  keys: string[]; //["PRIMARY KEY", "UNIQUE"]
};

function RowItem({ name, keys }: rowItem) {
  return (
    <div>
      <tr></tr>
    </div>
  );
}
