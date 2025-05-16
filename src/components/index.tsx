"use client";
import { cn } from "@/lib/utils";
import { ChevronDown, CircleCheck, PlusCircle } from "lucide-react";

export default function Index({
  i,
  className,
  size,
  hovered,
  morph,
  circleColor,
  selected,
}: {
  className?: string;
  i: number;
  size?: number;
  hovered?: number;
  morph?: "create" | "dropdown" | "selected"; //create, dropdown, selected
  circleColor?: string;
  selected?: boolean;
}) {
  const sz = size && `size-${size}`;

  return (
    <div
      className={cn(
        `bg-sub-bg/40 ${hovered && "bg-blue-900/20"} absolute top-0 left-0 z-5 flex h-full min-h-[1.3rem] w-[2.5rem] items-center justify-center px-1 backdrop-blur-3xl select-none`,
        className,
      )}
    >
      <div
        className={` ${hovered == i ? "bg-row-bg2" : circleColor ? circleColor : "bg-row-bg1"} ${i > 99 ? "text-sm" : "text-md"}text-bw shadow-shadow-bw relative flex ${sz ? sz : "size-6"} items-center justify-center rounded-full shadow-2xs`}
      >
        {morph == "create" ? (
          <PlusCircle className={`${sz ? sz : "size-6"} self-center`} />
        ) : morph == "dropdown" && hovered ? (
          <ChevronDown
            className={` ${sz ? sz : "size-6"} repeat-1 animate-bounce self-center transition-all delay-1000`}
          />
        ) : morph == "selected" && selected ? (
          <CircleCheck
            className={`${sz ? sz : "size-6"} self-center fill-green-600 stroke-2`}
          />
        ) : (
          <>{i}</>
        )}
      </div>
    </div>
  );
}
