"use client";
import { Divide } from "lucide-react";
import React from "react";
import { useSideContext } from "../layoutcontext";

export default function LayoutDb({ children }: { children: React.ReactNode }) {
  const { db } = useSideContext();
  return (
    <div
      className={` ${db ? "scale-100" : "scale-0"} bg-card-background relative right-[-3rem] left-[6%] flex h-[40rem] max-h-screen w-[88%] max-w-[90%] items-center justify-center rounded-[5px] shadow-xl shadow-black/50 transition-all delay-400 sm:right-[3rem] lg:w-[87.75%]`}
    >
      {" "}
      <div className="bg-card-foreground h-[99%] w-[99%] overflow-hidden rounded-[5px]">
        {children}
      </div>
    </div>
  );
}
