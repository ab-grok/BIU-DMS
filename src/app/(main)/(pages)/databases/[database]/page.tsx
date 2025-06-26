"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import TableCard from "./(components)/tbcard";
import Loading from "@/components/loading";
import {
  useAddUsers,
  useConfirmDialog,
  useLoading,
  useNotifyContext,
} from "@/app/dialogcontext";
import { listTables, Tb, ListTbsType } from "@/lib/actions";
import CreateTb from "./(components)/createtb";
import { useSelection } from "../../selectcontext";
import AddUsers from "@/app/(main)/(components)/addusers";
import { useFetchContext } from "../../fetchcontext";
import ConfirmDialog from "@/app/(main)/(components)/confirmdialog";

export default function Database() {
  const currDb = useParams()?.database as string;
  const { isLoading, setIsLoading } = useLoading();
  const { setNotify, notify } = useNotifyContext();
  const { create, setCreated, created } = useSelection();
  const { addUsers } = useAddUsers();
  const { allTbs, setAllTbs, uData } = useFetchContext();
  const { confirmDialog } = useConfirmDialog();
  const currTbs = useMemo(() => {
    // using as condition to show alternative to list tbs. dbName should be defined even when tblist is []
    return allTbs.find((t) => t.dbName == currDb);
  }, [allTbs]);

  // onclick of addEditors/users set the state blank?

  useEffect(() => {
    console.log("in [database], useLoading: " + isLoading);
    console.log("allTbs.length: ", allTbs.length);
    !currTbs &&
      setIsLoading((p) => (!p.includes(currDb) ? p + currDb + "," : p));

    let tbFound = false;
    (async () => {
      const { tbArr, error } = await listTables(currDb);
      if (error) {
        setNotify({
          message: error,
          danger: true,
          exitable: true,
        });
      } else {
        setAllTbs((p) => {
          for (const [i, { dbName, tbList }] of p?.entries()) {
            if (dbName == currDb) {
              tbFound = true;
              console.log(
                "in [database] in setAllTbs loop, dbName: ",
                dbName,
                "\n ... tbList: ",
                tbList,
              );
              if (tbList?.length != tbArr?.length) {
                const currP = [
                  ...p?.slice(0, i),
                  { dbName: currDb, tbList: tbArr as Tb[] },
                  ...p?.slice(i + 1),
                ];
                return currP;
              } else return p;
            }
          }
          return [...p, { dbName: currDb, tbList: tbArr as Tb[] }];
        });
      }
      setIsLoading((p) => p.replace(currDb + ",", ""));
    })();

    return () => {
      created.tb && setCreated((p) => ({ ...p, tb: "" }));
    };
  }, [created.tb]);

  //get tables: author, created at, lastUpdate, lastUpdated by, viewers, editors, rows
  return (
    <div className="relative flex h-full w-full flex-col">
      {isLoading.includes(currDb) && <Loading />}
      {(addUsers.type?.includes("tb") ||
        addUsers.type?.includes("New Table")) && <AddUsers />}
      <CreateTb uData={uData} db={currDb} i={0} />
      <section
        className={`${create == "table" ? "mt-[14.2rem] h-[56.6%]" : "h-[92.4%]"} w-full overflow-y-auto scroll-smooth transition-all`}
      >
        {confirmDialog.type == "table" && <ConfirmDialog />}
        {currTbs &&
          (currTbs.tbList?.length ? (
            currTbs.tbList.map((a, i) => (
              <TableCard
                key={i}
                uData={uData}
                Tb={a}
                i={i + 1}
                dbName={currDb}
              />
            ))
          ) : !(create == "table") ? (
            <div className="p-6 text-4xl italic">
              {" "}
              No tables yet. Create a table
            </div>
          ) : (
            <div className="p-6 text-4xl italic"> Creating a table...</div>
          ))}
      </section>
    </div>
  );
}
