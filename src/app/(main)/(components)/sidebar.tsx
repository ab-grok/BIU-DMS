"use client";
import React, { useState } from "react";
import { sideContextState, useSideContext } from "../layoutcontext";
import DbCard from "@/app/(main)/(components)/dbcard";
import {
  ArrowBigDown,
  ArrowRight,
  Box,
  CircleArrowRight,
  IndentDecrease,
  MenuIcon,
  MenuSquare,
  MenuSquareIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SideBar() {
  const { sidebarState, setSidebarState } = useSideContext().context;
  const [expand, setExpand] = useState(false);
  function clicked() {
    setExpand(!expand);
    setSidebarState((prev) => ({ ...prev, sbExpanded: !expand }));
  }
  return (
    <div
      className={` ${expand && sidebarState.database ? "relative left-[5%] w-[15rem] max-w-[15rem]" : sidebarState.database ? "relative left-[5%] w-[3rem] max-w-[3rem] lg:w-[15rem] lg:max-w-[15rem]" : "absolute left-[5%] w-[30rem] md:left-[25%] lg:left-[33.3%]"} bg-card-background z-5 flex h-[40rem] max-h-[100%] items-center justify-center overflow-hidden rounded-[5px] shadow-xl shadow-black/50 transition-all duration-500`}
    >
      <main className="bg-card-foreground relative flex h-[99%] w-[98%] flex-col overflow-hidden rounded-[5px]">
        <section className="group relative top-0 h-[15%] w-full bg-red-500/20">
          <div
            onClick={() => clicked()}
            className={`hover:bg-card-foreground/20 relative top-[2px] left-[4px] flex h-10 w-10 items-center justify-center rounded-xl hover:shadow-2xl lg:hidden ${expand ? "scale-[1.1]" : ""} `}
          >
            <MenuIcon
              className="hover:animate-menuarrow min-h-[30px] stroke-green-500 transition-all duration-500 hover:scale-[1.2]"
              size={30}
            />
          </div>
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />

        <section className="relative top-0 h-[60%] w-full flex-none">
          {" "}
          <DbCard />{" "}
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />
        <section className="relative top-0 h-[25%] w-full bg-amber-500/20">
          {" "}
          List of users with the db tag (get current db route)
        </section>
      </main>
    </div>
  );
}
