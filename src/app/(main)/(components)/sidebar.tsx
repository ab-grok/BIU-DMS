"use client";
import React, { useState } from "react";
import { useSideContext } from "../layoutcontext";
import DbCard from "@/app/(main)/(components)/dbcard";

export default function SideBar() {
  const { sidebarState, setSidebarState } = useSideContext().context;
  const db = sidebarState.database;
  const [expand, setExpand] = useState(false);
  function clicked() {
    setExpand(!expand);
  }
  return (
    <div
      onMouseDown={clicked}
      className={` ${expand && db ? "absolute left-[5%] w-[15rem] max-w-[20rem] md:relative md:w-[20rem]" : db ? "relative left-[5%] w-[3rem] md:w-[20rem]" : "absolute left-[5%] w-[30rem] md:left-[25%] lg:left-[33.3%]"} bg-card-background z-5 flex h-[40rem] max-h-[100%] items-center justify-center overflow-hidden rounded-[5px] shadow-xl shadow-black/50 transition-all duration-500`}
    >
      <main className="bg-card-foreground relative flex h-[99%] w-[98%] flex-col overflow-hidden rounded-[5px]">
        <section className="relative top-0 h-[15%] w-full flex-none bg-red-500"></section>
        <section className="relative top-0 h-[60%] w-full flex-none">
          {" "}
          <DbCard />{" "}
        </section>
        <section className="relative top-0 h-[25%] w-full flex-none bg-yellow-400"></section>
      </main>
    </div>
  );
}
