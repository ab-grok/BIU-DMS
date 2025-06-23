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
import { usePathname, useRouter } from "next/navigation";

export default function SideCard({
  name,
  route,
  fn,
}: {
  name: string;
  route?: string;
  fn?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [clicked, setClicked] = useState("");
  const [isHovered, setHovered] = useState(false);
  const { setSbState, sbState } = useSideContext().context;

  function handleClicked() {
    if (route) {
      router.push(`/${route}`);
      setSbState((prev) => ({ ...prev, sbExpanded: false, route: route }));
    }
    fn && fn();
  }

  function hovered() {
    setHovered(true);
  }
  function unHovered() {
    setHovered(false);
  }

  useEffect(() => {
    console.log("sbState.route: ", sbState.route);
    console.log("pathname: ", pathname);
    // if (typeof sbState.route == undefined)
    //   setSbState((prev) => ({
    //     ...prev,
    //     route: pathname?.replace("/", "") || "",
    //   }));
  }, [sbState.route]);
  return (
    <div
      className={`justify-content flex max-h-full min-h-[3.5rem] w-[100%] flex-none flex-col items-center overflow-hidden transition-all duration-200`}
    >
      <div
        onClick={() => handleClicked()}
        onMouseOver={() => hovered()}
        onMouseLeave={() => unHovered()}
        className={`group/sb ${route && sbState.route?.includes(route) && isHovered ? "bg-sub-grad-hover" : isHovered ? `bg-sub-grad shadow-bw/70 shadow-xs` : ``} ${route && sbState.route?.includes(route) ? "bg-main-fg border-2 border-blue-400 font-bold shadow-sm" : ""} relative top-0 m-[4px] flex h-[3rem] min-h-[3rem] w-[96%] cursor-pointer items-center space-x-2 rounded-2xl p-2`}
      >
        <div>
          <Icon name={name} clicked={sbState.route == route} />
        </div>
        <div
          className={`relative ${sbState.sbExpanded ? "flex" : pathname == "/" ? "flex" : "hidden lg:flex"} flex-none transition-all`}
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
