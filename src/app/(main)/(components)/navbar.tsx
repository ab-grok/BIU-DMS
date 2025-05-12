"use client";
import React from "react";
import { IoBulb, IoBulbSharp } from "react-icons/io5";
import { useTheme } from "next-themes";
import { GalleryHorizontal, RectangleEllipsis } from "lucide-react";
import { useSideContext } from "../layoutcontext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { setSidebarState, sidebarState } = useSideContext().context;

  function menuClicked() {
    setSidebarState((prev) => ({
      ...prev,
      sbExpanded:
        typeof sidebarState.sbExpanded == "boolean"
          ? !sidebarState.sbExpanded
          : false,
    }));
  }
  function switchMode() {
    theme == "light" ? setTheme("dark") : setTheme("light");
  }

  return (
    <div className="bg-main-fg absolute top-0 z-5 flex h-[3rem] w-[90%] flex-none items-center justify-between self-center rounded-[5px]">
      <div className="flex h-full w-1/3 flex-none items-center bg-amber-300 px-1">
        {" "}
        <span
          onClick={menuClicked}
          title="Menu"
          className="group/menu stroke-mainbg flex h-[3rem] w-[3rem] cursor-pointer items-center justify-center bg-cyan-500 lg:hidden"
        >
          {sidebarState.sbExpanded ? (
            <GalleryHorizontal className="fill-main-bg animate-in size-6 rounded-xl transition-all group-hover/menu:rounded-none group-hover/menu:shadow-md" />
          ) : (
            <RectangleEllipsis className="fill-main-fg rotate-90 group-hover/menu:shadow-md" />
          )}
        </span>
        logo far right
      </div>
      <div className="z-6 w-1/3 flex-none"> search bar w-dynamic</div>
      <div className="flex h-full w-[10rem] items-center justify-end bg-green-500 px-2">
        {" "}
        <div
          onClick={() => switchMode()}
          title="Theme"
          className="group shadow-bw flex h-[90%] w-[3rem] items-center justify-center rounded-full bg-white hover:bg-slate-200 hover:shadow-xs"
        >
          {theme == "light" ? (
            <IoBulb
              title="Light mode"
              size={25}
              className="fill-amber-500 stroke-amber-300 group-hover:fill-amber-300"
            />
          ) : (
            <IoBulbSharp
              title="Dark Mode"
              size={25}
              className="fill-neutral-800 stroke-neutral-500 group-hover:fill-black"
            />
          )}
        </div>
      </div>
    </div>
  );
}
