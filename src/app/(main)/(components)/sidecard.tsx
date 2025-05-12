"use client";
import { useEffect, useState } from "react";
import {
  Database,
  Grid2X2Plus,
  IterationCcw,
  KeyRound,
  MessagesSquare,
  Users,
} from "lucide-react";
import { useSideContext } from "../layoutcontext";
import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter } from "next/navigation";

export default function SideCard({
  name,
  route,
}: {
  name: string;
  route: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [clicked, setClicked] = useState("");
  const [isHovered, setHovered] = useState(false);
  const { setSidebarState, sidebarState } = useSideContext().context;

  function handleClicked() {
    router.push(`/${route}`);
    setSidebarState((prev) => ({ ...prev, sbExpanded: false, route: route }));
  }

  function hovered() {
    setHovered(true);
  }
  function unHovered() {
    setHovered(false);
  }

  useEffect(() => {
    console.log("sidebarState.route: ", sidebarState.route);
    if (typeof sidebarState.route == "undefined")
      setSidebarState((prev) => ({
        ...prev,
        route: pathname?.replace("/", "") || "",
      }));
  }, [sidebarState.route]);
  return (
    <div
      className={`bg-sub-bg/20 justify-content flex max-h-full min-h-[3.5rem] w-[100%] flex-none flex-col items-center overflow-hidden transition-all duration-200`}
    >
      <div
        onClick={() => handleClicked()}
        onMouseOver={() => hovered()}
        onMouseLeave={() => unHovered()}
        className={`group/sb ${sidebarState.route?.includes(route) && isHovered ? "bg-sub-grad-hover" : isHovered ? `bg-sub-grad shadow-bw/70 shadow-xs` : ``} ${sidebarState.route?.includes(route) ? "bg-main-fg border-2 border-blue-400 font-bold shadow-sm" : ""} relative top-0 m-[4px] flex h-[3rem] min-h-[3rem] w-[96%] cursor-pointer items-center space-x-2 rounded-2xl p-2`}
      >
        <div>
          <Icon name={name} clicked={sidebarState.route == route} />
        </div>
        <div
          className={`relative ${sidebarState.sbExpanded ? "flex" : pathname == "/" ? "flex" : "hidden lg:flex"} flex-none transition-all`}
        >
          {name}{" "}
        </div>
      </div>
    </div>
  );
}

function Icon({ name, clicked }: { clicked: boolean; name: string }) {
  const iconClass = ` ${clicked ? "rotate-45 fill-bw" : ""} stroke-blue-400 transition-all group-hover/sb:fill-bw`;

  return (
    <>
      {name == "Databases" ? (
        <Database className={iconClass} />
      ) : name == "View recent edits" ? (
        <IterationCcw className={iconClass} />
      ) : name == "View requests" ? (
        <KeyRound className={iconClass} />
      ) : name == "Create a database" ? (
        <Grid2X2Plus className={iconClass} />
      ) : name == "Private message" ? (
        <MessagesSquare className={iconClass} />
      ) : name == "Users" ? (
        <Users className={iconClass} />
      ) : null}
    </>
  );
}
