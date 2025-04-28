"use client";
import React, { useEffect, useState } from "react";
import { useSideContext } from "../layoutcontext";
import DbCard from "@/app/(main)/(components)/sidedbcard";
import {
  ArrowBigDown,
  ArrowRight,
  Box,
  CircleArrowRight,
  IndentDecrease,
  LogOut,
  MenuIcon,
  MenuSquare,
  MenuSquareIcon,
  UserCog,
  UserCog2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/loading";
import { useLoading } from "@/app/layoutcall";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/app/(auth)/actions";

export default function SideBar() {
  const { sidebarState, setSidebarState } = useSideContext().context;
  const [expand, setExpand] = useState(false);
  const [quickActions, setQuickAtions] = useState(false);

  function clicked() {
    setSidebarState((prev) => ({
      ...prev,
      sbExpanded:
        typeof sidebarState.sbExpanded == "boolean"
          ? !sidebarState.sbExpanded
          : false,
    }));
    // console.log(`expand: ` + expand);
    // console.log(`sidebarState.sbExpanded: ` + sidebarState.sbExpanded);
    // console.log(
    //   `typeof sidebarState.sbExpanded: ` + typeof sidebarState.sbExpanded,
    // );
  }
  function showAvatar(a?: number) {
    if (a) {
      quickActions == true && setQuickAtions(false);
    } else setQuickAtions(!quickActions);
  }

  const path = usePathname();
  const { isLoading, sidebarEditable, setSidebarEdit } = useLoading();
  useEffect(() => {
    setSidebarEdit(true);
  }, []);

  useEffect(() => {
    console.log("isLoading in sidebar" + isLoading);
    if (path == "/") setSidebarState((prev) => ({ ...prev, route: "" }));
  }, [path]);

  return (
    <div
      onClick={() => showAvatar(1)}
      className={` ${(sidebarState.sbExpanded ?? true) && sidebarState.route ? "relative left-[5%] max-w-[15rem] min-w-[15rem]" : sidebarState.route ? "relative left-[5%] w-[3rem] max-w-[3rem] lg:max-w-[15rem] lg:min-w-[15rem]" : "absolute left-[8%] w-full max-w-[15rem] sm:left-[25%] md:left-[25%] md:max-w-[30rem] lg:left-[33.3%]"} bg-main-bg z-5 flex h-[40rem] max-h-[100%] items-center justify-center overflow-hidden rounded-[5px] shadow-xl shadow-black/50 transition-all duration-500`}
    >
      {(isLoading.includes("sidebar") || !sidebarEditable) && <Loading />}
      <main className="bg-main-fg relative flex h-[99.8%] w-[99.2%] flex-col overflow-hidden rounded-[5px]">
        <section
          className={`group relative top-0 h-full max-h-[15%] min-h-[15%] w-full bg-red-500/20`}
        >
          <div
            onClick={() => clicked()}
            className={`hover:bg-main-bg/10 ${path == "/" ? "hidden" : ""} absolute top-[2px] left-[4px] flex h-10 w-10 items-center justify-center rounded-4xl hover:shadow-2xl lg:hidden ${expand ? "scale-[1.1]" : ""} `}
          >
            <MenuIcon
              className="hover:animate-menuarrow stroke-main-bg min-h-[30px] transition-all duration-500 hover:scale-[1.2]"
              size={30}
            />
          </div>
          <div className="relative flex h-full w-[100%] items-center bg-amber-300">
            <div
              onBlur={() => showAvatar()}
              id="avatar"
              className={`bg-main-fg ring-main-bg relative ring-2 ${quickActions ? (path == "/" ? "left-[39%] w-[6rem] rounded-2xl" : "left-[30%] w-[6rem] rounded-2xl") : path == "/" ? "left-[40%] w-[5rem] rounded-full" : "left-[32%] w-[5rem] rounded-full"} ${path == "/" ? "" : ""} shadow-shadow-bw text-bw h-[5rem] cursor-pointer overflow-hidden text-xs shadow-md transition-all duration-200`}
              onClick={() => setQuickAtions(!quickActions)}
            >
              {!quickActions ? (
                <Avatar />
              ) : (
                <QuickActions fn2={() => logOut()} />
              )}
            </div>
          </div>
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />

        <section className="bg-main-fg relative top-0 h-full max-h-[60%] w-full flex-none">
          {" "}
          <DbCard name="Databases" route="databases" />
          <DbCard name="Create a database" route="createdb" />
          <DbCard name="View requests" route="requests" />
          <DbCard name="Private message" route="chat" />
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />
        <section className="relative top-0 h-full max-h-[25%] w-full bg-amber-500/20">
          {" "}
          List of he db tag (get current db route)
        </section>
      </main>
    </div>
  );
}

function Avatar() {
  return (
    <div
      title="Click to show actions"
      id="avatar"
      className="bg-main-fg text-bw absolute size-[5rem] rounded-full p-4 text-xs"
    >{`Avatar goes here`}</div>
  );
}

function QuickActions({ fn1, fn2 }: quickActions) {
  return (
    <div
      title="Click elsewhere to exit"
      className="justify center relative flex h-full w-full flex-col justify-center rounded-2xl p-1 text-xs"
    >
      <div
        onClick={fn1}
        className="group/a hover:bg-bw/50 shadow-shadow-bw flex h-full w-[5.5rem] items-center space-x-1 rounded-full px-1 hover:font-semibold hover:shadow-sm"
      >
        <UserCog size={17} />
        <span className="transition-all group-hover/a:translate-x-0.5">
          Profile
        </span>
      </div>

      <div
        onClick={fn2}
        className="group/b text-bw hover:bg-bw/50 shadow-shadow-bw flex h-full w-[5.5rem] items-center space-x-1 rounded-full px-1 hover:stroke-red-500 hover:font-semibold hover:text-red-500 hover:shadow-sm"
      >
        <LogOut size={17} />
        <span className="transition-all group-hover/b:translate-x-0.5">
          Logout
        </span>
      </div>
    </div>
  );
}

type quickActions = {
  fn1?: () => {};
  fn2: () => {};
};
