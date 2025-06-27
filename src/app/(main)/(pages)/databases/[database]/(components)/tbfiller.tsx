"use client";
import Index from "@/components";
import { useFetchContext } from "../../../fetchcontext";
import Count from "@/components/count";
import { Edit, KeyRound } from "lucide-react";
import { dateAbrev, TableAttr, tbMeta } from "./tbcard";
import { useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import { FaEye } from "react-icons/fa";
import Marker from "@/components/marker";

export function TableFiller({ uData }: { uData: string }) {
  const hoverTime = useRef<NodeJS.Timeout | undefined>(undefined);
  const [metaHover, setMetaHover] = useState(0);
  const [viewerHover, setViewerHover] = useState(0);

  const tbMetaVals = [
    [uData.split("&")[2], uData.split("&")[1]],
    [dateAbrev()],
    [dateAbrev("null")],
    ["", ""],
  ];

  function handleMetaHover(n: number) {
    if (n) {
      hoverTime.current = setTimeout(() => {
        setMetaHover(1);
      }, 1500);
    } else {
      setMetaHover(0);
      clearTimeout(hoverTime.current);
    }
  }

  return (
    <div
      className={`bg-tb-row1/10 group relative flex min-h-[10rem] w-full min-w-fit transition-all`}
    >
      <Index
        i={0}
        className="group-hover:bg-sub-grad-forced/70 sticky h-[11.2rem] self-center"
        morph="selected"
      />
      <div
        id="main"
        onClick={(e) => {}}
        className={`bg-row-bg1/50 group-hover:bg-sub-grad-forced/30 border-main-bg/50 items-center-2 m-2 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-xs ring-blue-700/20 hover:ring-2`}
      >
        <section
          id="table"
          className={`flex min-w-[15rem] flex-col items-center gap-y-0.5`}
        >
          <header
            title="Your table looks like this"
            className="flex min-h-[3rem] w-[15rem] cursor-default items-center justify-between pr-1"
          >
            <div className="w-1/2">
              <span>{uData.split("&")[2] + "'s table"}</span>
              <div className="text-bw/70 flex items-center gap-1 text-xs">
                <span>Rows</span>
                <Count n={0} />
              </div>
            </div>
            <div
              className={`group/enter bg-sub-bg/80 hidden h-[80%] w-1/3 cursor-pointer items-center justify-end rounded-2xl pr-3 transition-all group-hover:flex hover:shadow-sm`}
            >
              <KeyRound className="stroke-bw/60 group-hover:stroke-green-600/80" />
            </div>
          </header>
          <div
            id="Table meta"
            title="Create a table to get its details"
            className="bg-bw/10 flex h-fit min-h-[6rem] w-full items-center gap-x-[1%] rounded-2xl p-0.5 px-1 shadow-sm"
          >
            <div className="flex h-full min-w-[50%] flex-col justify-center gap-y-1.5 text-[12px]">
              {tbMeta.map((a, i) => (
                <TableAttr
                  key={i}
                  hover={metaHover}
                  title={a}
                  i={i + 1}
                ></TableAttr>
              ))}
            </div>
            <Separator orientation="vertical" className="bg-main-bg/10" />
            <div
              onMouseEnter={() => handleMetaHover(1)}
              onMouseLeave={() => handleMetaHover(0)}
              className="flex h-full min-w-[40%] flex-col justify-center gap-y-1 pt-1"
            >
              {tbMetaVals &&
                tbMetaVals.map((a, i) => (
                  <UserTag
                    key={i + 4}
                    name={tbMetaVals[i][0]}
                    ttl={tbMetaVals[i][1]}
                    className={`${i < 2 ? "bg-green-600/70" : "bg-amber-600/70"} text-xs`}
                    cap={15}
                  />
                ))}
            </div>
          </div>
        </section>
        <Separator orientation="vertical" className="bg-main-bg/10" />
        <section
          className={`hidden max-h-fit min-w-[20rem] justify-center gap-x-[1%] md:flex`}
        >
          <div
            id="viewers"
            className={`max-h-[10rem] min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              id="viewers"
              title="Click to expand"
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 font-normal select-none"
            >
              Viewers
              <FaEye className="size-6 stroke-pink-800 opacity-80" />
            </div>
            <div className="bg-bw/10 relative flex h-[7.5rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              <div
                onMouseEnter={() => setViewerHover(1)}
                onMouseLeave={() => setViewerHover(0)}
                className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
              >
                {" "}
                <span>
                  <Index
                    size={4}
                    i={1}
                    className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                    hovered={viewerHover}
                  />
                </span>
                <UserTag
                  name="User1"
                  title="Title"
                  className="w-fit justify-start text-xs font-normal"
                  hovered={viewerHover == 1}
                />
                <span className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1">
                  <Marker
                    hovered={viewerHover == 1}
                    selectContext={""}
                    uPath={""}
                  />
                </span>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="bg-main-bg/10" />
          <div
            id="editors"
            className={`max-h-[10rem] min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              title="Click to expand"
              id="editors"
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 text-sm font-medium select-none"
            >
              Editors
              <Edit className={`stroke-bw/50`} />
            </div>
            <div className="bg-bw/10 relative flex h-[7.5rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              <div
                onMouseEnter={() => setViewerHover(1)}
                onMouseLeave={() => setViewerHover(0)}
                className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
              >
                {" "}
                <span>
                  <Index
                    size={4}
                    i={2}
                    className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                    hovered={viewerHover}
                  />
                </span>
                <UserTag
                  name="User2"
                  title="Title"
                  className="w-fit justify-start text-xs font-normal"
                  hovered={viewerHover == 2}
                />
                <span className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1">
                  <Marker
                    hovered={viewerHover == 2}
                    selectContext={""}
                    uPath={""}
                  />
                </span>
              </div>
            </div>
          </div>{" "}
        </section>
      </div>
    </div>
  );
}
