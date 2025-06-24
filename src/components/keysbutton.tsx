"use client";

import { errSetter } from "@/app/(main)/(pages)/databases/[database]/(components)/livetable";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

type keysButton = {
  name: string;
  n: number; //0- primary, 1- unique, 2-ai, 3-nnull
  onChange?: (e: any) => void; //for zod
  type: number; //1-text, 2-number,3-boolean, 4-date, 5-file
  setAiErr?: (e: errSetter) => void;
  findPrimary?: (del?: string) => boolean;
  value: number;
  abbrev?: boolean;
  disabled?: boolean;
  handleChange?: (colName: string, keyName: string, keyVal: number) => void; //custom change handler
  colName?: string; //for handleChange
  boxSize?: number;
  className?: string;
  // errDialogHandler: (e: any, p?: string) => void;
};

export function KeysButton({
  type, //
  name,
  n,
  onChange,
  value,
  setAiErr,
  findPrimary,
  abbrev,
  disabled,
  handleChange,
  colName,
  boxSize,
  className,
}: keysButton) {
  const val = useRef(0);
  // const [value, setValue] = useState(0);
  const textColor = [
    "text-green-700",
    "text-pink-400",
    "text-bw",
    "text-red-700",
    "text-blue-700",
  ];
  const iconColor = [
    "bg-green-700/20",
    "bg-pink-700/20",
    "bg-bw/20",
    "bw-red-700/20",
  ];

  const sz = boxSize ? `size-` + boxSize : "size-6";

  function handleClick() {
    //wont click on an if type is not number
    if (type != 2 && n == 2) {
      // val.current = 0;
      onChange && onChange({ target: { value: 0 } });
      handleChange && colName && handleChange(colName, name, 0);
      setAiErr &&
        setAiErr({
          body: "Auto Increment can only be used with 'Number' type",
          button1Press: "Ok",
        });
    } else {
      if (n == 0 && findPrimary && findPrimary()) return;
      handleChange &&
        colName &&
        handleChange(colName, name, value == 0 ? 1 : 0);
      onChange && onChange({ target: { value: value == 0 ? 1 : 0 } });
    }
  }

  useEffect(() => {
    if (n == 2 && type != 2) onChange && onChange({ target: { value: 0 } });
  }, [type]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        `group/a ${value == 1 ? "text-bw/80" : "text-bw/40 hover:text-bw/70"} ${disabled && "pointer-events-none cursor-not-allowed"} flex h-[1.5rem] w-full cursor-pointer items-center justify-between text-sm select-none`,
        className,
      )}
    >
      <div className={`${abbrev && "hidden"}`}> {name} </div>
      <div
        title={name}
        className={`${sz} rounded-[5px] ${value == 1 ? `font-bold ${textColor[n]} bg-bw/10 shadow-xs group-hover/a:shadow-sm` : "shadow-bw/10 group-hover/a:shadow-xs"} flex items-center justify-center group-hover/a:bg-green-300/40`}
      >
        {" "}
        {name.charAt(0)}
      </div>
    </div>
  );
}
