"use Client";
import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { timeAgo } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
export default function UserTag({
  name,
  author,
  title,
  className,
  hovered,
  clicked,
  n,
  cap,
}: {
  author?: boolean;
  name: string;
  title?: string;
  className?: string;
  hovered?: number;
  clicked?: number;
  n?: number;
  cap?: number;
}) {
  const { colorState, setColorState } = useSelection();
  const [rand, setRand] = useState(Math.floor(Math.random() * 10));
  const c = cap ?? 9;

  useEffect(() => {
    if (colorState.includes(name)) {
      let colRef = colorState.indexOf(name);
      let randStart = colorState.indexOf("%", colRef);
      let thisRand = Number(
        colorState.slice(randStart + 1, colorState.indexOf(",", randStart)),
      );
      setRand(thisRand);
    } else {
      setColorState(colorState + `${name}%${rand},`);
    }
  }, []);

  const color = [
    "bg-red-400",
    "bg-blue-400",
    "bg-stone-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-teal-400",
    "bg-orange-400",
    "bg-rose-400",
  ];
  return (
    <div
      className={cn(
        `${!name ? "text-bw/40 bg-sub-fg/50 italic" : clicked ? "bg-blue-700/60" : n && hovered == n ? `ring-2 ${color[rand]}` : ""} ${color[rand] + "/70"} text-bw min flex h-full max-h-[1.3rem] min-h-[1.3rem] w-fit max-w-[6rem] min-w-[3rem] items-center justify-center rounded-[4px] px-1 shadow-2xs`,
        className,
      )}
    >
      {title && (
        <span className="mt-[3px] mr-1 flex items-end text-[10px]">
          {" "}
          {title}{" "}
        </span>
      )}
      {name ? (name.length > c ? name.slice(0, c) + "..." : name) : "N/A"}
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
