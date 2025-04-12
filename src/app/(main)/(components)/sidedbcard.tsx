"use client";
import { useState } from "react";
import DbItems from "./sidedbitems";
import { Database } from "lucide-react";
import { useSideContext } from "../layoutcontext";
import { Separator } from "@/components/ui/separator";

export default function DbCard({ access }: { access?: boolean }) {
  const [showdb, setShowdb] = useState(false);
  const { setSidebarState, sidebarState } = useSideContext().context;
  function handleClicked() {
    setShowdb(!showdb);
  }

  return (
    <div className="relative h-[100%] w-[100%] flex-none items-center rounded-2xl p-[2px]">
      <div
        className={`bg-bw justify-content flex max-h-full min-h-[3.5rem] w-[100%] flex-none flex-col items-center overflow-hidden rounded-[5px] transition-all duration-200`}
      >
        <div
          onClick={() => handleClicked()}
          className={`group bg-db-foreground hover:bg-card-foreground/80 relative top-0 m-[4px] flex h-[3rem] min-h-[3rem] w-[96%] cursor-pointer items-center space-x-2 rounded-2xl p-2`}
        >
          <div>
            {" "}
            <Database
              className={` ${showdb ? "rotate-45 fill-zinc-950" : ""} stroke-blue-400 transition-all group-hover:fill-zinc-950`}
            />{" "}
          </div>
          <div
            className={`relative flex-none ${showdb ? "translate-x-4" : ""} transition-all`}
          >
            Databases{" "}
          </div>
        </div>
        <Separator />
        <div className="scrollbar-custom w-full overflow-y-scroll">
          <DbItems />
        </div>
      </div>
    </div>
  );
}
