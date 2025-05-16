"use Client";
import { timeAgo } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function UserTag({
  name,
  id,
  title,
  className,
  hovered,
  clicked,
  n,
  cap,
  colorCode,
  delFn,
  route,
  clickedColor,
}: {
  name: string;
  id?: string;
  title?: string;
  className?: string;
  hovered?: number; //shared context/state with the group
  clicked?: boolean | number; //shared w group inline
  colorCode?: number; //0-9 for the color array
  delFn?: (a: any, b?: any) => void;
  n?: number; //i
  cap?: number; //word limit
  route?: string;
  clickedColor?: string;
}) {
  const router = useRouter();
  const [thisHover, setHover] = useState(0);
  const c = cap ?? 9;

  const colorArr = [
    "bg-red-500",
    "bg-blue-500",
    "bg-stone-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-rose-500",
  ];

  const color = colorArr[colorCode ?? 1];
  const colorHover = color + "/50";

  function pushRoute() {
    route && router.push(route);
  }

  return (
    <div
      onMouseEnter={() => setHover(1)}
      onMouseLeave={() => setHover(0)}
      onClick={pushRoute}
      className={cn(
        `group/ut relative ${!name ? "text-bw/40 bg-sub-fg/50 italic" : clicked ? (clickedColor ?? colorHover) : n ? hovered == n && `ring-2` : hovered && "ring-2"} ${!hovered && thisHover && `${color} shadow-md`} text-bw min flex h-[1.3rem] w-fit max-w-[8rem] min-w-fit items-center justify-center rounded-[4px] px-1 shadow-2xs select-none`,
        className,
      )}
    >
      {title && (
        <span className="mr-1 flex h-full items-end text-[10px]">
          {" "}
          {title}{" "}
        </span>
      )}
      {name ? (
        <span className="flex h-full w-fit items-end overflow-hidden">
          {name.length > c ? name.slice(0, c) + "..." : name}
        </span>
      ) : (
        <span className="self-center text-xs italic">N/A</span>
      )}
      {delFn && (
        <span
          title="Delete"
          onClick={() => delFn(name, "del")}
          className={` ${clicked ? (clickedColor ?? colorHover) : n && hovered == n && `ring-2`} ${!hovered && thisHover && color} absolute -right-[15px] flex h-full w-fit translate-x-1 cursor-pointer items-center rounded-r-[5px] pr-0.5 opacity-0 shadow-2xs backdrop-blur-3xl transition-all group-hover/ut:translate-x-0 group-hover/ut:opacity-100`}
        >
          <PlusCircle className="size-4 rotate-45 stroke-red-600 stroke-3" />
        </span>
      )}
    </div>
  );
}

export function TimeAgo(date: string) {
  const [time, setTime] = useState("");

  (async () => {
    setTime(await timeAgo(date));
  })();
  return (
    <div className="text-bw flex w-[2rem] space-x-1">
      <div className="size-3 rounded-full text-xs"> {time && time}</div>
      <span>ago</span>
    </div>
  );
}
