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
  rdVal,
  rowData,
} from "@/lib/actions";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import { tbRcs, uAccess, useFetchContext } from "../../../fetchcontext";
import { Rows } from "./(components)/rows";
import { NewRow } from "./(components)/newrow";
import { useSideContext } from "@/app/(main)/layoutcontext";

export default function TableRows() {
  const { database: dbName, table: tbName } = useParams() as Record<
    string,
    string
  >;
  const { created, setCreated, create, orderBy, setOrderBy } = useSelection();
  const tbPath = dbName + "/" + tbName;
  const { setNotify } = useNotifyContext();
  const { rc, setRc, setUAccess, uAccess, uData } = useFetchContext();
  const { setIsLoading, isLoading } = useLoading();
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [canEdit, setCanEdit] = React.useState(false);
  const [updatedRc, setUpdatedRc] = React.useState<[string, rdVal]>();
  const nrcRef = React.useRef<HTMLDivElement | null>(null);
  const { showToolbar } = useSideContext().context;
  const thisTb = rc?.find((a) => a.tbPath == tbPath);

  React.useEffect(() => {
    console.log("in TableRows, dbName: ", dbName, " ...tbName: ", tbName);
    (async () => {
      setIsLoading((p) => p + "tbData");
      const { tbSchema, error1 } = await getTableSchema(dbName, tbName);
      const { tbData, error } = await getTableData(dbName, tbName, orderBy.rc);
      console.log("in getTb rc currTb,: ", tbPath, " created.rc: ", created.rc);
      // console.log("in [table] got tbSchema: ", tbSchema, " . Error1: ", error1);
      // console.log("in [table] got tbData: ", tbData, " . Error: ", error);

      if (error || error1) {
        setNotify({ message: error1 || error, danger: true });
        return;
      }
      let currTb: tbRcs | undefined = rc?.find((a) => (a.tbPath = tbPath));
      const placeTb = {
        tbPath: tbPath,
        tbRows: [] as rowData[],
        tbHeader: [] as colSchema[],
      };
      setRc((p) => {
        let updRc = [] as tbRcs[];
        let rcFound = false;
        for (const [i, a] of p.entries()) {
          if (a.tbPath == tbPath) {
            rcFound = true;
            if (a.tbHeader.length != tbSchema?.length || created.rh) {
              currTb = {
                ...(currTb || placeTb),
                tbHeader: tbSchema as colSchema[],
              };
              updRc = [...p.filter((rc) => rc.tbPath != tbPath), currTb].filter(
                Boolean,
              );
              setCreated((p) => ({ ...p, rh: "" }));
            }
            if (
              a.tbRows.length != tbData?.length ||
              created.rc ||
              orderBy.rc?.new
            ) {
              currTb = {
                ...(currTb || placeTb),
                tbRows: tbData as rowData[],
              };
              updRc = [...p.filter((rc) => rc.tbPath != tbPath), currTb].filter(
                Boolean,
              );
              created.rc && setUpdatedRc(JSON.parse(created.rc));
              setCreated((p) => ({ ...p, rc: "" }));
              setOrderBy((p) => ({ ...p, rc: { ...p.rc, new: false } }));
            }
          }
        }
        if (!rcFound) {
          currTb = {
            ...(currTb || placeTb),
            tbRows: tbData as rowData[],
            tbHeader: tbSchema as colSchema[],
          };
          updRc = [...p, { ...(currTb as tbRcs) }].filter(Boolean);
        }
        if (updRc.length) return updRc;
        else return p;
      });
      // console.log("in [table] got past setRc, currTb: ", currTb);
      setIsLoading((p) => p.replaceAll("tbData", ""));
    })();
  }, [created.rc, created.rh, JSON.stringify(orderBy.rc)]);

  React.useEffect(() => {
    const d = tbPath.split("/")[0];
    const t = tbPath.split("/")[1];
    let currUA: uAccess | undefined;
    if (uAccess) {
      //did not work with just uAccess?.find() -- why??
      currUA = uAccess?.find((a) => a.db == d && a.tb == t);
    }
    if (!currUA) {
      (async () => {
        const { edit, view, level } = await getUA(dbName, tbName);
        const UA = { tb: t, db: d, edit: edit };
        console.log(
          "in !currUA (uAccess not found): tb: ",
          t,
          " db: ",
          d,
          " edit:",
          edit,
        );
        setUAccess((p) => {
          return [...p, UA];
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
    <div className="flex h-full w-full flex-col">
      <header className="h-[3rem] w-full">
        <RowHeader
          rhScroll={scrolling}
          canEdit={canEdit}
          tbPath={tbPath}
          ref={headerRef}
          thisTb={thisTb as tbRcs}
        />
      </header>
      <main
        className={` ${showToolbar ? "h-[33.9rem]" : "h-[36.9rem]"} relative flex w-full flex-col`}
        // className={` ${showToolbar ? "h-[33.9rem]" : "h-[36.9rem]"} relative flex w-full flex-col`}
      >
        {create == "record" && (
          <NewRow
            nRcScroll={scrolling}
            tbPath={tbPath}
            ref={nrcRef}
            thisTb={thisTb as tbRcs}
            nRc={create == "record"}
            uData={uData}
          />
        )}
        <Rows
          canEdit={canEdit}
          tbPath={tbPath}
          scrolling={scrolling}
          ref={rowRef}
          nRc={create == "record"}
          thisTb={thisTb as tbRcs}
          uData={uData}
          updatedRc={updatedRc}
        />
      </main>
    </div>
  );
}
