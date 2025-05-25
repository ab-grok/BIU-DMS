"use client";
import React from "react";
import { IoBulb, IoBulbSharp } from "react-icons/io5";
import { useTheme } from "next-themes";
import { GalleryHorizontal, Menu, RectangleEllipsis } from "lucide-react";
import { useSideContext } from "../layoutcontext";
import logo from "@/assets/images/biu_blue_round.png";
import Image from "next/image";
import SearchBar from "@/components/searchbar";

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
    <div className="bg-nav-grad ring-main-bg/30 absolute top-0.5 z-5 flex h-[3rem] w-[90%] flex-none items-center justify-between gap-1 self-center overflow-hidden rounded-[5px] shadow-lg ring-2 shadow-black">
      <div className="bg-bw/10 flex h-full w-1/3 flex-none items-center rounded-xs px-1">
        {" "}
        <span
          onClick={menuClicked}
          title="Menu"
          className="group/menu stroke-mainbg flex h-[3rem] w-[3rem] cursor-pointer items-center justify-center lg:hidden"
        >
          {sidebarState.sbExpanded ? (
            <Menu className="fill-main-bg size-6 rounded-xl transition-all group-hover/menu:rounded-none group-hover/menu:shadow-md" />
          ) : (
            <Menu className="fill-main-fg group-hover/menu:shadow-md" />
          )}
        </span>
        <span className="bg-main-fg/50 flex size-11 flex-none items-center justify-center rounded-full">
          <Image src={logo} alt="Logo" className={`size-10`} />
        </span>
        <span className="text-main-bg ml-1 hidden text-xl font-bold select-none sm:flex">
          {" "}
          BIU DMS{" "}
        </span>
      </div>
      <div className="z-6 w-1/3 flex-none px-3">
        {" "}
        <SearchBar placeholder="database, table or field " />
      </div>
      <div className="bg-bw/10 flex h-full w-[10rem] items-center justify-end px-2">
        {" "}
        <div
          onClick={() => switchMode()}
          title="Theme"
          className="group shadow-bw bg-bw/40 hover:bg-bw flex size-10 items-center justify-center rounded-full hover:shadow-xs"
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
