"use client";
import { useLoading } from "@/app/dialogcontext";
import { useButtonAnim } from "@/components/count";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";

type rowItem = {
  route?: string;
  i?: number;
  itemsStart?: boolean;
  italics?: boolean;
  bold?: boolean;
  extend?: boolean;
  text?: string;
  load?: string;
  fn?: () => void;
};

export function RowItem({
  route,
  i,
  children,
  itemsStart,
  bold,
  extend,
  italics,
  text,
  load,
  fn,
}: React.PropsWithChildren<rowItem>) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  // const path = usePathname();
  const { setIsLoading } = useLoading();
  const { pressAnim, setPressAnim } = useButtonAnim();

  const textSize = text ? `text-${text}` : ""; //if text=xs -- len cap = ?
  const cap = text == "xs" ? 40 : 20;
  const childStr = typeof children == "string";
  const childStringLen = childStr ? children.length : 0;
  const childCount = React.Children.count(children);
  const firstChild = (children as Array<any>)[0];
  const title =
    childCount == 1 && childStr
      ? (children as string)
      : typeof firstChild == "string"
        ? firstChild
        : undefined;

  function hover(n: number) {
    if (n) {
      setClicked(false);
      setHovered(false);
    } else setHovered(true);
  }

  function handleClicked() {
    setPressAnim("rI" + i);
    setClicked(true);
    load && setIsLoading((p) => p + load + ",");
    if (route) router.push(`${route}`);
    else if (fn) fn();
  }

  // console.log(
  //   "rI: \n title: " + title + "\n typeof children" + typeof children,
  // );
  return (
    <div
      title={title}
      onClick={handleClicked}
      onMouseLeave={() => hover(1)}
      onMouseOver={() => hover(0)}
      className={`hover:bg-card-selection ${pressAnim == "rI" + i} ${clicked ? "bg-card-selection/60" : i == 1 ? "bg-row-bg1/40" : "bg-row-bg1"} ${extend && clicked ? "h-fit" : "h-[4rem]"} group text-bw shadow-shadow-bw ml-3 flex min-h-[4rem] w-full max-w-[10rem] min-w-[10rem] cursor-pointer flex-col p-1 font-medium shadow-sm`}
    >
      <div
        className={`${extend && clicked ? "h-fit min-h-[4rem]" : "h-full min-h-[90%]"} flex w-full items-center`}
      >
        <div
          className={`${hovered ? "text-bw" : ""} ${bold ? "font-medium" : ""} ${textSize ? textSize : "text-xs"} ${childCount > 2 || childStringLen > cap ? "items-start justify-start" : "justify-center"} ${itemsStart ? "items-start" : "items-center"} ${italics && "italic"} text-sub-text scrollbar-custom relative flex h-[80%] min-w-full flex-col gap-1 overflow-clip p-1 text-center`}
        >
          {typeof children == "string" && childStringLen > cap && !clicked ? (
            children?.slice(0, cap) + "..."
          ) : childCount > 2 && !clicked ? (
            <>
              {(children as Array<any>)[0]}
              <div className="flex">
                {(children as Array<any>)[1]}
                <span className="text-xl">...</span>
              </div>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
