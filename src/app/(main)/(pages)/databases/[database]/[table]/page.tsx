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
  getUA,
  rowData,
} from "@/lib/actions";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import { rcData, useFetchContext } from "../../../fetchcontext";
import { Rows } from "./(components)/rows";
import { NewRow } from "./(components)/newrow";
import { useSideContext } from "@/app/(main)/layoutcontext";

export default function TableRows() {
  const { created, create } = useSelection();
  const { database: dbName, table: tbName } = useParams() as Record<
    string,
    string
  >;
  const tbPath = dbName + "/" + tbName;
  const { notify, setNotify } = useNotifyContext();
  const { rc, setRc, setUAccess, uAccess } = useFetchContext();
  const { setIsLoading, isLoading } = useLoading();
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [canEdit, setCanEdit] = React.useState(false);
  const nrcRef = React.useRef<HTMLDivElement | null>(null);
  const { showToolbar } = useSideContext().context;
  const thisRc = rc.find((a) => a.tbPath == tbPath);

  console.log("in TableRows, dbName: ", dbName, " ...tbName: ", tbName);

  React.useEffect(() => {
    (async () => {
      setIsLoading((p) => p + "tbData");
      const { tbSchema, error1 } = await getTableSchema(dbName, tbName);
      const { tbData, error } = await getTableData(dbName, tbName);
      console.log("in getTb rowHeader currTb,: ", tbPath);
      console.log("in [table] got tbSchema: ", tbSchema, " . Error1: ", error1);
      console.log("in [table] got tbData: ", tbData, " . Error: ", error);

      // const modTbSchema = tbSchema?.find((a, i) => {
      //   a.colName == "ID" && (idPos = i);
      //   return a.colName !== "ID";
      // });-------------------------------------  // can exclude ID while mapping in RcRows

      if (error || error1) {
        setNotify({ message: error1 || error, danger: true });
        return;
      }
      let currTb: rcData | undefined = rc.find((a) => (a.tbPath = tbPath));
      const placeTb = {
        tbPath: tbPath,
        rcRows: [] as rowData[],
        rcHeader: [] as colSchema[],
      };
      setRc((p) => {
        let updRc = [] as rcData[];
        let rcFound = false;
        for (const [i, a] of p.entries()) {
          if (a.tbPath == tbPath) {
            rcFound = true;
            if (a.rcHeader.length != tbSchema?.length) {
              currTb = {
                ...(currTb || placeTb),
                rcHeader: tbSchema as colSchema[],
              };
              updRc = [...p.filter((rc) => rc.tbPath != tbPath), currTb].filter(
                Boolean,
              );
            }
            if (a.rcRows.length != tbData?.length) {
              currTb = {
                ...(currTb || placeTb),
                rcRows: tbData as rowData[],
              };
              updRc = [...p.filter((rc) => rc.tbPath != tbPath), currTb].filter(
                Boolean,
              );
            }
          }
        }
        if (!rcFound) {
          currTb = {
            ...(currTb || placeTb),
            rcRows: tbData as rowData[],
            rcHeader: tbSchema as colSchema[],
          };
          updRc = [...p, { ...(currTb as rcData) }].filter(Boolean);
        }
        if (updRc.length) return updRc;
        else return p;
      });
      console.log("in [table] got past setRc, currTb: ", currTb);
      getRc();
      setIsLoading((p) => p.replaceAll("tbData", ""));
    })();
  }, [created.rc, created.rh]);

  function getRc() {
    console.log("got rc from [tables]: ", rc);
  }
  React.useEffect(() => {
    const currUA = uAccess.tb?.find((a) => a.tbPath == tbPath);
    if (!currUA) {
      (async () => {
        const { edit, view, level } = await getUA(dbName, tbName);
        const UA = { tbPath, edit };

        setUAccess((p) => {
          return { ...p, tb: [...(p.tb || []), UA].filter(Boolean) };
        });
        setCanEdit(edit);
      })();
    } //set dependency for access changed elsewhere (approved/removed)
  }, [tbPath]);

  function scrolling(e: React.MouseEvent<HTMLDivElement>) {
    const scrollPos = e.currentTarget.scrollLeft;
    const scrollId = e.currentTarget.id;
    console.log("scrolling ran, scrollPos: ", scrollPos);
    console.log("scroll id, scrollId: ", scrollId);

    if (scrollId == "rowScroll") {
      if (headerRef.current) headerRef.current.scrollLeft = scrollPos;
      if (nrcRef.current) nrcRef.current.scrollLeft = scrollPos;
    }
    if (scrollId == "nrcScroll") {
      if (headerRef.current) headerRef.current.scrollLeft = scrollPos;
      if (rowRef.current) rowRef.current.scrollLeft = scrollPos;
    }
    if (scrollId == "rhScroll") {
      if (rowRef.current) rowRef.current.scrollLeft = scrollPos;
      if (nrcRef.current) nrcRef.current.scrollLeft = scrollPos;
    }
  }

  return (
    <div className="h-full w-full">
      <header className="h-[3rem] w-full">
        <RowHeader
          rhScroll={scrolling}
          canEdit={canEdit}
          tbPath={tbPath}
          ref={headerRef}
          thisRc={thisRc as rcData}
        />
      </header>
      <main
        className={` ${showToolbar ? "h-[33.9rem]" : "h-[36.9rem]"} relative flex w-full flex-col`}
      >
        {create == "record" && (
          <NewRow
            nRcScroll={scrolling}
            tbPath={tbPath}
            ref={nrcRef}
            thisRc={thisRc as rcData}
            nRc={create == "record"}
          />
        )}
        <Rows
          canEdit={canEdit}
          tbPath={tbPath}
          scrolling={scrolling}
          ref={rowRef}
          nRc={create == "record"}
          thisRc={thisRc as rcData}
        />
      </main>
    </div>
  );
}
