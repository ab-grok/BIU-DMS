"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TableCard from "./(components)/tbcard";
import { validateSession } from "@/lib/sessions";
import Loading from "@/components/loading";
import { useAddUsers, useLoading, useNotifyContext } from "@/app/dialogcontext";
import { ListTables, Tb } from "@/lib/actions";
import CreateTb from "./(components)/createtb";
import { useSelection } from "../../selectcontext";
import AddUsers from "@/app/(main)/(components)/addusers";

export default function Database() {
  const currDb = useParams()?.database as string;
  const [tbData, setTbData] = useState([] as Tb[] | null);
  const userId = useRef<string>("");
  const { isLoading, setIsLoading } = useLoading();
  const { setNotify, notify } = useNotifyContext();
  const { create } = useSelection();
  //onclick of addEditors/users set the state blank
  const { addUsers, setAddUsers } = useAddUsers();

  useEffect(() => {
    console.log("isLoading start: " + isLoading);
    setIsLoading((p) => p + currDb + ",");
    (async () => {
      const nav = performance.getEntriesByType(
        "navigation",
      ) as PerformanceNavigationTiming[];
      // if (nav.length > 0 && nav[0].type == "reload") {
      //   useRevalidate("tables");
      //   useRevalidate("session");
      // }

      const user = await validateSession(true);
      console.log("User from [database]'s validateSession call", user);
      const res = await ListTables(currDb);
      if (!res) {
        setNotify({
          message: "Couldn't reach the server.",
          danger: true,
          exitable: true,
        });
        return;
      }
      setTbData(res);
      userId.current = user?.userId ?? "";
      setIsLoading((p) => p.replace(currDb + ",", ""));
    })();

    return () => {};
  }, []);

  //get tables: author, created at, lastUpdate, lastUpdated by, viewers, editors, rows
  return (
    <div className="relative flex h-full w-full flex-col">
      {isLoading.includes(currDb) && <Loading />}
      {addUsers.type == "newTb" && <AddUsers />}
      <CreateTb u={userId.current} db={currDb} i={0} />
      <section
        className={`${create == "table" ? "mt-[14.2rem] h-[56.6%]" : "h-[92.4%]"} w-full overflow-y-auto scroll-smooth transition-all`}
      >
        {tbData &&
          tbData.map((a, i) => (
            <TableCard
              key={i}
              u={userId.current}
              Tb={a}
              i={i + 1}
              db={currDb}
            />
          ))}
      </section>
    </div>
  );
}
