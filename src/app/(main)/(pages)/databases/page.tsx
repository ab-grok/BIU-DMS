"use client";
import React, { useEffect, useRef, useState } from "react";
import RowHeader from "./(components)/rowheader";
import Row from "./(components)/row";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import { db, listDatabases } from "@/lib/actions";
import Loading from "@/components/loading";

export default function DbLayout({ children }: { children: React.ReactNode }) {
  const { notify, setNotify } = useNotifyContext();
  const { isLoading, setIsLoading } = useLoading();
  const [db, setDb] = useState([] as db[] | null);

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
      <div
        ref={headerRef}
        className="scrollbar-custom bg-sub-bg relative overflow-x-scroll border-b-2"
      >
        <RowHeader headerList={headerList} />
      </div>
      <main
        ref={rowRef}
        onScroll={(e) => handleScroll(e)}
        className="max-h-[43.2rem] overflow-auto pb-3"
      >
        {isLoading.includes("databases") && <Loading />}
        {db && db.map((a, i) => <Row key={i + 2} db={a} i={i} />)}
      </main>
    </div>
  );
}
