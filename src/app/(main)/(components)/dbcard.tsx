"use client";
import { useState } from "react";
import DbItems from "./dbitems";
import { Database } from "lucide-react";
import { useSideContext } from "../layoutcontext";

export default function DbCard({ access }: { access?: boolean }) {
  const [showdb, setShowdb] = useState(false);
  const { setSidebarState, sidebarState } = useSideContext().context;
  const { dbExpanded } = sidebarState;
  function handleClicked() {
    setSidebarState((prev) => ({ ...prev, dbExpanded: !dbExpanded }));
  }

  return (
    <div className="relative h-[100%] w-[100%] flex-none items-center rounded-2xl p-[2px]">
      <div
        className={`${dbExpanded ? "h-full" : "h-[4rem]"} bg-card-section-foreground justify-content flex max-h-full min-h-[4rem] w-[100%] flex-none flex-col items-center overflow-hidden rounded-2xl transition-all duration-[500ms]`}
      >
        <div
          onClick={() => handleClicked()}
          className={`group bg-db-foreground hover:bg-card-foreground/80 relative top-0 m-2 flex h-[3rem] min-h-[3rem] w-[96%] cursor-pointer items-center space-x-2 rounded-2xl p-2`}
        >
          <div>
            {" "}
            <Database
              className={` ${dbExpanded ? "rotate-45 fill-zinc-950" : ""} stroke-blue-400 transition-all group-hover:fill-zinc-950`}
            />{" "}
          </div>
          <div
            className={`relative flex-none ${dbExpanded ? "translate-x-4" : ""} transition-all`}
          >
            Databases{" "}
          </div>
        </div>
        <div className="w-full">
          {" "}
          <DbItems />{" "}
        </div>
      </div>
    </div>
  );
}
