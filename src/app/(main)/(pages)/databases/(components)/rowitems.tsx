"use client";
import { useLoading } from "@/app/dialogcontext";
import { Icon } from "@/components/Icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Eye, PencilLine, Tags, IdCard, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { GrUserAdmin } from "react-icons/gr";

type rowItem = {
  route?: string;
  i?: number;
  itemsStart?: boolean;
  italics?: boolean;
  bold?: boolean;
  extend?: boolean;
  text?: string;
  load?: string;
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
}: React.PropsWithChildren<rowItem>) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const { isLoading, setIsLoading } = useLoading();

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
    setClicked(true);
    route && router.push(`${route}`);
    load && setIsLoading((p) => p + load + ",");
  }

  // console.log(
  //   "rowitem: \n title: " + title + "\n typeof children" + typeof children,
  // );
  return (
    <div
      title={title}
      onClick={handleClicked}
      onMouseLeave={() => hover(1)}
      onMouseOver={() => hover(0)}
      className={`hover:bg-card-selection ${clicked ? "bg-card-selection/60" : i == 1 ? "bg-row-bg1/40" : "bg-row-bg1"} ${extend && clicked ? "h-fit" : "h-[4rem]"} group text-bw shadow-shadow-bw ml-3 flex min-h-[4rem] w-full max-w-[10rem] min-w-[10rem] cursor-pointer flex-col p-1 font-medium shadow-sm`}
    >
      <div
        className={`${extend && clicked ? "min-h-[4rem]" : "min-h-[90%]"} flex h-full w-full items-center`}
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
          {/* ) : childCount > 2 ? (
            <div>
              {(children as Array<any>).slice(0, 2)} {"..."}{" "}
            </div>
          ) : (
            children
          )} */}
        </div>
      </div>
    </div>
  );
}
