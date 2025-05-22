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
  type userType = {
    fname: string | undefined;
    ttl: string | undefined;
    id: string | undefined;
  };
  const [user, setUser] = useState({} as userType);
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

      const u = await validateSession();
      console.log("User from [database]'s validateSession call", u);
      const res = await ListTables(currDb);
      if (!res) {
        setNotify({
          message: "Couldn't reach the server.",
          danger: true,
          exitable: true,
        });
        return;
      }
      setUser({ id: u?.userId, fname: u?.firstname, ttl: u?.title });
      setTbData(res);
      setIsLoading((p) => p.replace(currDb + ",", ""));
    })();

    return () => {};
  }, []);

  //get tables: author, created at, lastUpdate, lastUpdated by, viewers, editors, rows
  return (
    <div className="relative flex h-full w-full flex-col">
      {isLoading.includes(currDb) && <Loading />}
      {addUsers.type == "newTb" && <AddUsers />}
      <CreateTb uid={user.id || ""} db={currDb} i={0} />
      <section
        className={`${create == "table" ? "mt-[14.2rem] h-[56.6%]" : "h-[92.4%]"} w-full overflow-y-auto scroll-smooth transition-all`}
      >
        {tbData &&
          tbData.map((a, i) => (
            <TableCard
              key={i}
              uid={user.id || ""}
              Tb={a}
              i={i + 1}
              db={currDb}
            />
          ))}
      </section>
    </div>
  );
}
