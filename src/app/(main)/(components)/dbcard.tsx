"use client";
import { useState } from "react";
import DbItems from "./dbitems";
import { Database } from "lucide-react";
import { useSideContext } from "../layoutcontext";

export default function DbCard({ access }: { access?: boolean }) {
  const [showdb, setShowdb] = useState(false);
  const { setSidebarState } = useSideContext().context;
  function handleClicked() {
    setSidebarState((prev) => ({ ...prev, dbExpanded: showdb }));
    setShowdb(!showdb);
  }

  return (
    <div className="relative h-[100%] w-[100%] flex-none items-center rounded-2xl p-[2px]">
      <div className="bg-card-section-foreground justify-content scroll flex max-h-full min-h-[4rem] w-[100%] flex-none flex-col items-center rounded-2xl">
        <div
          onClick={() => handleClicked()}
          className="bg-card-foreground/80 relative top-0 m-2 flex h-[3rem] w-[96%] items-center space-x-2 rounded-2xl p-2 text-center"
        >
          <div>
            {" "}
            <Database
              className={` ${showdb ? "rotate-45" : ""} stroke-blue-400 transition-all`}
            />{" "}
          </div>
          <div
            className={`relative flex-none ${showdb ? "translate-x-4" : ""} all transition`}
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
