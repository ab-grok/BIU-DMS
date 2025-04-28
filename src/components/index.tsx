import { cn } from "@/lib/utils";

export default function Index({
  i,
  className,
  size,
  hover,
}: {
  className?: string;
  i: number;
  size?: number;
  hover?: number;
}) {
  let sz = size && `size-${size}`;
  return (
    <div
      className={cn(
        `bg-sub-bg/40 ${hover == undefined ? "group-hover:bg-blue-400" : ""} sticky left-0 z-5 flex h-full min-h-[1.3rem] w-fit items-center px-1 backdrop-blur-md`,
        className,
      )}
    >
      <div
        className={` ${hover == i ? "bg-row-bg2" : "bg-row-bg1/70"} ${i > 999 ? "text-sm" : "text-md"}text-bw shadow-shadow-bw relative flex ${sz ? sz : "size-8"} items-center justify-center rounded-full shadow-2xs`}
      >
        {i}
      </div>
    </div>
  );
}
