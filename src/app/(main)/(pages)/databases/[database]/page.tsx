"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TableCard from "./(components)/tbcard";
import { validateSession } from "@/lib/sessions";
import Loading from "@/components/loading";
import { useAddUsers, useLoading, useNotifyContext } from "@/app/dialogcontext";
import { listTables, Tb, ListTbsType } from "@/lib/actions";
import CreateTb from "./(components)/createtb";
import { useSelection } from "../../selectcontext";
import AddUsers from "@/app/(main)/(components)/addusers";
import { useFetchContext } from "../../fetchcontext";

export default function Database() {
  const currDb = useParams()?.database as string;
  const { isLoading, setIsLoading } = useLoading();
  const { setNotify, notify } = useNotifyContext();
  const { create, created } = useSelection();
  const { addUsers } = useAddUsers();
  const { allTbs, setAllTbs, uData } = useFetchContext();

  // onclick of addEditors/users set the state blank?

  useEffect(() => {
    console.log("in [database], useLoading: " + isLoading);

    for (const [j, { dbName }] of allTbs.entries()) {
      if (dbName == currDb) break;
      else if (j == allTbs.length - 1) setIsLoading((p) => p + currDb + ",");
    }

    if (allTbs.entries())
      console.log("in [database], useLoading: after reset " + isLoading);
    (async () => {
      const { tbArr, error } = await listTables(currDb);
      if (error) {
        setNotify({
          message: error,
          danger: true,
          exitable: true,
        });
      } else
        setAllTbs((p) => {
          if (!p) {
            console.log("in [database] in setAllTbs !p ");
            return [{ dbName: currDb, tbList: tbArr as Tb[] }];
          } else {
            for (const [i, { dbName, tbList }] of p.entries()) {
              console.log(
                "in [database] in setAllTbs loop, dbName: ",
                dbName,
                " ...  tbList:",
                tbList,
              );

              if (currDb == dbName && tbList?.length != tbArr?.length) {
                const currP = [
                  ...p.slice(0, i),
                  { dbName: currDb, tbList: tbArr as Tb[] },
                  ...p.slice(i + 1),
                ];
                return currP;
              }
            }
            return [...p, { dbName: currDb, tbList: tbArr as Tb[] }];
          }
        });

      setIsLoading((p) => p.replace(currDb + ",", ""));
    })();

    return () => {};
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
        {allTbs?.find(({ dbName }) => dbName == currDb)?.dbName ? (
          allTbs
            ?.find(({ dbName }) => dbName == currDb)
            ?.tbList.map((a, i) => (
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
        )}
      </section>
    </div>
  );
}
