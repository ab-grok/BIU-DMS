"use client";
import { Divide } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSideContext } from "../layoutcontext";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarState } = useSideContext().context;
  return (
    <div
      className={` ${sidebarState.database ? "scale-100" : "scale-0"} bg-card-background absolute left-[18%] ${sidebarState.sbExpanded ? "bg-black md:max-w-[63%]" : "md:max-w-[84%]"} flex h-[40rem] max-h-screen w-full max-w-[78%] items-center justify-center rounded-[5px] shadow-xl shadow-black/50 transition-all delay-[00ms] duration-500 md:relative md:left-[5%] lg:max-w-[71%] xl:max-w-[74%]`}
    >
      {" "}
      <div className="bg-card-foreground h-[99%] w-[99%] overflow-hidden rounded-[5px]">
        <section className="h-full max-h-[6rem] min-h-[6rem] bg-indigo-600"></section>
        <Separator className="bg-card-background w-99% h-2" />
        <section className="bg-radial-gradient h-full w-full">
          {children}
        </section>
      </div>
    </div>
  );
}
