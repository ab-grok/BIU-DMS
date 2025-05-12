"use client";
import { timeAgo } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Hexagon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Count({
  n,
  className,
  date,
}: {
  n?: number;
  className?: string;
  date?: string;
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (date) {
      (async () => {
        setTime(await timeAgo(date));
        console.log("Async ran: ", time);
      })();
    }
  }, []);

  return (
    <div className={`relative ${!date && !n ? "hidden" : "flex"} `}>
      <Hexagon
        className={cn("size-5 fill-green-400/20 stroke-green-400", className)}
      />
      <span className="absolute flex size-5 items-center justify-center overflow-hidden rounded-full text-[9px]">
        {n ?? time}
      </span>
      {time && <span className="text-bw/50 ml-1 text-xs">ago</span>}
    </div>
  );
}

export function useButtonAnim() {
  const [pressAnim, setPressAnim] = useState("");
  // const press = useRef<string>(a);
  setTimeout(() => {
    setPressAnim("");
  }, 100);
  return { pressAnim, setPressAnim };
}
