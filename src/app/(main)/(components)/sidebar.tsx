"use client";
import React, { useEffect, useState } from "react";
import { useSideContext } from "../layoutcontext";
import SideCard from "@/app/(main)/(components)/sidecard";
import { LogOut, UserCog } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/loading";
import { useLoading } from "@/app/dialogcontext";
import { usePathname } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";
import { FaUserAlt } from "react-icons/fa";

export default function SideBar() {
  const { sidebarState, setSidebarState } = useSideContext().context;
  const [expand, setExpand] = useState(false);
  const [quickActions, setQuickAtions] = useState(false);

  function showAvatar(n?: number) {
    if (n) {
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
    if (path == "/") setSidebarState((p) => ({ ...p, route: "" }));
  }, [path]);

  return (
    <div
      onClick={() => showAvatar(1)}
      className={` ${(sidebarState.sbExpanded ?? true) && sidebarState.route ? "relative left-[5%] max-w-[15rem] min-w-[15rem]" : sidebarState.route ? "relative left-[5%] w-[3rem] max-w-[3rem] lg:max-w-[15rem] lg:min-w-[15rem]" : "absolute left-[8%] w-full max-w-[15rem] sm:left-[25%] md:left-[25%] md:max-w-[30rem] lg:left-[33.3%]"} bg-main-bg z-5 flex h-[40rem] max-h-[100%] items-center justify-center rounded-[5px] shadow-lg shadow-black transition-all`}
    >
      {(isLoading.includes("sidebar") || !sidebarEditable) && <Loading />}
      <main className="bg-main-fg/30 ring-main-bg/50 relative flex h-[99.8%] w-[99.2%] flex-col overflow-hidden rounded-[5px] ring-2">
        <section
          className={`group bg-main-fg relative top-0 h-full max-h-[15%] min-h-[15%] w-full items-center justify-center rounded-[20px]`}
        >
          <div
            onBlur={() => showAvatar(1)}
            id="avatar"
            className={`ring-main-bg flex ring-2 ${quickActions ? "h-[5rem] w-[6rem] rounded-[5px]" : !sidebarState.sbExpanded ? "size-[3rem] rounded-full lg:size-[5rem]" : "size-[5rem] rounded-full"} ${!sidebarState.sbExpanded && ""} bg-main-fg shadow-shadow-bw text-bw cursor-pointer items-center self-center overflow-hidden text-xs shadow-md transition-all duration-200`}
            onClick={() => showAvatar()}
          >
            {!quickActions ? (
              <Avatar expanded={sidebarState.sbExpanded} />
            ) : (
              <SBQuickActions fn2={() => logOut()} />
            )}
          </div>
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />

        <section className="bg-main-fg relative top-0 h-full max-h-[60%] w-full flex-none rounded-[20px]">
          {" "}
          <SideCard name="Databases" route="databases" />
          <SideCard name="Create a database" route="createdb" />
          <SideCard name="View requests" route="requests" />
          <SideCard name="Private message" route="chat" />
          <SideCard name="Users" route="users" />
        </section>
        <Separator className="bg-card-background max-w-[95%] self-center" />
        <section className="bg-main-fg relative top-0 h-full max-h-[25%] w-full rounded-[20px]">
          {" "}
          List of he db tag (get current db route)
        </section>
      </main>
    </div>
  );
}

function Avatar({ expanded }: { expanded: boolean }) {
  const { setSidebarState } = useSideContext().context;
  return (
    <div
      title="Click to show actions"
      id="avatar"
      onClick={() => setSidebarState((p) => ({ ...p, sbExpanded: true }))}
      className={`${!expanded ? "size-[3rem] lg:size-[5rem]" : "size-[5rem]"} bg-main-bg text-bw absolute flex items-center justify-center rounded-full p-1 text-xs transition-all`}
    >
      <FaUserAlt className="fill-bg-sub-grad size-4 stroke-1" />
    </div>
  );
}

function SBQuickActions({ fn1, fn2 }: quickActions) {
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
  fn1?: () => void;
  fn2: () => void;
};
