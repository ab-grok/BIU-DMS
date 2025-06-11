"use client";
import Loading from "@/components/loading";
import { useParams } from "next/navigation";
import * as React from "react";
import { useSelection } from "../../../selectcontext";
import { RowHeader } from "./(components)/rowHeader";
import {
  colSchema,
  getTableData,
  getTableSchema,
  rowData,
} from "@/lib/actions";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import { rcData, useFetchContext } from "../../../fetchcontext";

export default function TableRows() {
  const { created } = useSelection();
  const dbName = useParams().database as string;
  const tbName = useParams().table as string;
  const { notify, setNotify } = useNotifyContext();
  const { rc, setRc } = useFetchContext();
  const { setIsLoading } = useLoading();
  const tbPath = dbName + "/" + tbName;
  const currRh = rc.find((a) => a.tbPath == tbPath)?.rcHeader;

  console.log("in TableRows, dbName: ", dbName, " ...tbName: ", tbName);

  React.useEffect(() => {
    (async () => {
      console.log("in getTb rowHeader currTb,: ", tbPath);
      // const { tbSchema, error1 } = await getTableSchema(dbName, tbName);
      // console.log("in [table] got tbSchema: ", tbSchema);
      // const { tbData, error } = await getTableData(dbName, tbName);
      // console.log("in [table] got tbData: ", tbData);
      // if (error || error1) {
      //   setNotify({ message: error1 || error, danger: true });
      //   return;
      // }
      // let currTb: rcData | undefined = rc.find((a) => (a.tbPath = tbPath));
      // const placeTb = {
      //   tbPath: tbPath,
      //   rcRows: [] as rowData[],
      //   rcHeader: [] as colSchema[],
      // };
      // setRc((p) => {
      //   let updRc = [] as rcData[];
      //   let rcFound = false;
      //   for (const [i, a] of p.entries()) {
      //     if (a.tbPath == tbPath) {
      //       rcFound = true;
      //       if (a.rcHeader.length != tbSchema?.length) {
      //         currTb = {
      //           ...(currTb || placeTb),
      //           rcHeader: tbSchema as colSchema[],
      //         };
      //         updRc = [...p.slice(0, i), currTb, ...p.slice(i + 1)].filter(
      //           Boolean,
      //         );
      //       }
      //       if (a.rcRows.length != tbData?.length) {
      //         currTb = {
      //           ...(currTb || placeTb),
      //           rcRows: tbData as rowData[],
      //         };
      //         updRc = [...p.slice(0, i), currTb, ...p.slice(i + 1)].filter(
      //           Boolean,
      //         );
      //       }
      //     }
      //   }
      //   if (!rcFound) {
      //     currTb = {
      //       ...(currTb || placeTb),
      //       rcRows: tbData as rowData[],
      //       rcHeader: tbSchema as colSchema[],
      //     };
      //     updRc = [...p, { ...(currTb as rcData) }].filter(Boolean);
      //   }
      //   if (updRc.length) return updRc;
      //   else return p;
      // });
      // console.log("in [table] got past setRc, currTb: ", currTb);
    })();
  }, [created.rc, created.rh]);

  return (
    <div className="">
      <header className="h-[3rem]">
        <RowHeader dbName={dbName} tbName={tbName} />
      </header>
      <main>
        <Loading />{" "}
      </main>
    </div>
  );
}
