"use client";
import { Icon } from "@/components/Icons";
import { ChevronDown, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { useSelection } from "../../selectcontext";
import { useButtonAnim } from "@/components/count";
import { useAddUsers } from "@/app/dialogcontext";

export default function RowHeader({
  headerList,
  ref,
}: {
  headerList: Array<string>;
  ref: React.RefObject<HTMLDivElement | null>;
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
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { create, setCreate } = useSelection();
  const { setAddUsers } = useAddUsers();

  function handleClick(i: number) {
    if (dbClicked == i) setdbClicked(0);
    else setdbClicked(i);
  }

  function createDb() {
    if (create == "db") {
      setCreate("");
      setAddUsers((p) => ({ ...p, type: "" }));
    }
    setCreate("db");

    setPressAnim("newDb");
  }

  return (
    <div
      ref={ref}
      className="scrollbar-custom z-5 flex h-[3rem] w-[100%] items-center overflow-x-scroll p-1 select-none"
    >
      <div className="bg-row-bgd2/70 absolute left-0 flex h-full w-[2.55rem] items-center backdrop-blur-2xl">
        <div
          onClick={createDb}
          title={` ${create == "db" ? "Cancel" : "Create new database"} `}
          className={` ${pressAnim == "newDb" && "scale-95 shadow-none"} ${create == "db" && "ring-bw/50 ring-2"} bg-row-bg1 hover:bg-main-fg ml-[10%] flex size-8 cursor-pointer items-center justify-center rounded-[5px] hover:shadow-md`}
        >
          <PlusIcon
            className={`${create == "db" && "rotate-45"} transition-all`}
          />
        </div>
      </div>
      <div className="ml-[2.6rem] flex">
        {headerList.map((a, i) => (
          <div
            key={i}
            onClick={() => handleClick(i + 1)}
            className={`${i % 2 == 0 ? "bg-row-bg1" : "bg-row-bg2"} ${i == 0 && "cursor-pointer"}text-md flex h-[3rem] min-w-[10.75rem] items-center justify-center space-x-3 font-medium`}
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
