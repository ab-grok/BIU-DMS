"use client";
import React, { useEffect, useRef, useState } from "react";
import RowHeader from "./(components)/rowheader";
import Row from "./(components)/row";
import { useLoading, useNotifyContext } from "@/app/layoutcall";
import { useRevalidate } from "@/lib/sessions";
import { db } from "@/lib/actions";

export default function DbLayout({ children }: { children: React.ReactNode }) {
  const { notify, setNotify } = useNotifyContext();
  const { isLoading, setIsLoading } = useLoading();
  const [db, setDb] = useState([] as db[] | null);

  useEffect(() => {
    setIsLoading(isLoading + ",databases");
    (async () => {
      const res = await fetch("/api/database");
      if (!res.ok) {
        setNotify({
          message: "Can't get to the server right now.",
          danger: true,
          exitable: true,
        });
        return;
      }

      const databases = await res.json();
      if (!databases) {
        useRevalidate("databases");
        setNotify({
          message: "Something's not right! Try reloading the page.",
          danger: true,
          exitable: true,
        });
        return;
      } else {
        setDb(databases);
        console.log("Database set: \n\n\n " + JSON.stringify(databases));
      }
      setIsLoading(isLoading.replace(",databases", ""));
    })();
  }, []);

  // function handleScroll() {
  //   thisComp &&
  //     setScrollPos((prev) => ({ ...prev, rowDb: thisComp.scrollLeft }));
  // }
  //scrolls from this component
  // const scrollRef = useRef<HTMLDivElement>(null);
  // const thisComp = scrollRef.current;
  // thisComp?.addEventListener("scroll", handleScroll);
  // let { setScrollPos, scrollPos } = useScroll();

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
        className="scrollbar-custom bg-sub-bg overflow-x-scroll border-b-2"
      >
        <RowHeader headerList={headerList} />
      </div>
      <main
        ref={rowRef}
        onScroll={(e) => handleScroll(e)}
        className="max-h-[90%] overflow-auto"
      >
        {db && db.map((a, i) => <Row key={i + 2} db={a} i={i} />)}
      </main>
    </div>
  );
}
