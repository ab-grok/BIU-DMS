"use client";
import React, { useEffect, useRef, useState } from "react";
import RowHeader from "./(components)/rowheader";
import Db from "./(components)/db";
import { useAddUsers, useLoading, useNotifyContext } from "@/app/dialogcontext";
import { db, listDatabases } from "@/lib/actions";
import Loading from "@/components/loading";
import { useSelection } from "../selectcontext";
import AddUsers from "../../(components)/addusers";
import NewDb from "./(components)/newdb";
import { validateSession, validateSessionType } from "@/lib/sessions";

export default function DbLayout() {
  const { notify, setNotify } = useNotifyContext();
  const { addUsers } = useAddUsers();
  const { isLoading, setIsLoading } = useLoading();
  const { create } = useSelection();
  const [db, setDb] = useState([] as db[] | null);
  const [user, setUser] = useState({} as validateSessionType);

  console.log("current isLoading: ", isLoading);
  useEffect(() => {
    setIsLoading((p) => p + "databases,");
    (async () => {
      const res = await listDatabases();
      if (!res) {
        setNotify({
          message: "Can't get to the server right now.",
          danger: true,
          exitable: true,
        });
        return;
      } else {
        setDb(res);
        console.log("got data about to validateSession");
        const user = await validateSession();
        if (!user) {
          setNotify({
            danger: true,
            message: "Couldn't authenticate you. Please log in again.",
          });
          return;
        }
        // console.log("Database set: \n\n\n " + JSON.stringify(res));
      }
      setIsLoading((p) => p.replace("databases,", ""));
    })();
  }, []);

  const headerList = [
    "Database",
    "Description",
    "Author",
    "Viewers",
    "Editors",
  ];
  const headerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef(null);
  const headerScroll = headerRef.current;

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    const currScroll = e.currentTarget.scrollLeft;
    headerScroll && (headerScroll.scrollLeft = currScroll);
  }

  return (
    <div className="">
      <div className="scrollbar-custom relative border-b-2">
        <RowHeader ref={headerRef} headerList={headerList} />
      </div>
      <div className="scrollbar-custom relative overflow-x-scroll">
        <NewDb uid={user?.userId || ""} />
      </div>
      <main
        ref={rowRef}
        onScroll={(e) => handleScroll(e)}
        className={`${create == "db" ? "mt-2 h-[31.3rem]" : "h-[43.2rem]"} overflow-auto pb-3 transition-transform`}
      >
        {addUsers.type == "newDb" && <AddUsers height="h-[76%]" />}

        {isLoading.includes("databases") && <Loading />}
        {db && db.map((a, i) => <Db key={i + 2} db={a} i={i} />)}
      </main>
    </div>
  );
}
