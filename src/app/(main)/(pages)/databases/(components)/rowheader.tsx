"use client";
import { Icon } from "@/components/Icons";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { arrayOutputType } from "zod";

export default function RowHeader({
  headerList,
}: {
  headerList: Array<string>;
}) {
  // const scrollRef = useRef<HTMLDivElement>(null);
  // const { setScrollPos, scrollPos } = useScroll();
  // const thisScroll = scrollRef.current;

  // thisScroll && (thisScroll.scrollLeft = scrollPos.pos);

  //  thisScroll?.addEventListener("scroll", handleScroll);

  // function handleScroll() {
  //   setSelf(false);
  // }

  // // function handleScroll() {
  // //   setScrollPos({ pos: thisScroll?.scrollLeft ?? 0, currRef: "rowHead" });
  // // }

  // useEffect(() => {
  //   if (scrollPos.currRef == "dbRow") {
  //     thisScroll && (thisScroll.scrollLeft = scrollPos.pos);
  //     setScrollPos((prev) => ({ ...prev, currRef: "" }));
  //     setSelf(true);
  //     return;
  //   }
  //   if (selfScroll == false)
  //     setScrollPos({ pos: thisScroll?.scrollLeft ?? 0, currRef: "rowHead" });
  // }, [scrollPos.currRef, selfScroll]);
  const [dbClicked, setdbClicked] = useState(0);
  function handleClick(i: number) {
    if (dbClicked == i) setdbClicked(0);
    else setdbClicked(i);
  }
  return (
    <div className="flex min-h-full w-[100%] items-center select-none">
      <div className="bg-sub-fg/60 border-main-fg/30 absolute h-[3rem] min-w-[2.53rem] border-r-1"></div>
      <div className="ml-[3rem] flex">
        {headerList.map((a, i) => (
          <div
            key={i}
            onClick={() => handleClick(i + 1)}
            className={`${i % 2 == 0 ? "bg-sub-fg" : "bg-sub-fg/10"} ${i == 0 && "cursor-pointer"}text-md flex h-[3rem] min-w-[10.75rem] items-center justify-center space-x-3 font-medium`}
          >
            <Icon name={a} />
            <span>{a}</span>
            {i == 0 && (
              <ChevronDown
                size={17}
                className={`${dbClicked == 1 ? "-rotate-180" : ""} transition-all`}
              />
            )}
          </div>
        ))}
        <div
          className={`bg-sub-bg text-s mr-6 flex h-[3rem] w-fit min-w-[8.1rem] items-center justify-center space-x-3 font-medium`}
        >
          <Icon name="actions" />
          <span>Actions</span>
        </div>
      </div>
    </div>
  );
}
