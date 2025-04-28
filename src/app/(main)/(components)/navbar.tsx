"use client";
import React from "react";
import { IoBulb, IoBulbSharp } from "react-icons/io5";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  function switchMode() {
    theme == "light" ? setTheme("dark") : setTheme("light");
  }

  return (
    <div className="absolute top-0 z-5 flex h-[3rem] w-[90%] flex-wrap items-center justify-between self-center rounded-[5px] bg-white">
      <div className="flex-none"> logo far right</div>
      <div className=""> search bar w-dynamic</div>
      <div className="flex h-full w-[10rem] items-center justify-end bg-slate-200 px-2">
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
