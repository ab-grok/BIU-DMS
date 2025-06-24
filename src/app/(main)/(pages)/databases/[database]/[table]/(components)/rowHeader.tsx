"use client";
import { KeysButton } from "@/components/keysbutton";
import {
  Calendar1,
  ChevronDown,
  FileType,
  LucideALargeSmall,
  Settings2,
} from "lucide-react";
import * as React from "react";
import { TbNumber123 } from "react-icons/tb";
import { RxComponentBoolean } from "react-icons/rx";
import { useRcConfig } from "@/app/(main)/layoutcontext";
import { wVal } from "./rows";
import { useButtonAnim } from "@/components/count";
import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { rcData } from "@/app/(main)/(pages)/fetchcontext";

type rowHeader = {
  tbPath: string;
  ref: React.RefObject<HTMLDivElement | null>;
  canEdit: boolean;
  rhScroll: (e: any) => void;
  thisRc: rcData;
};

export function RowHeader({
  tbPath,
  thisRc,
  ref,
  canEdit,
  rhScroll,
}: rowHeader) {
  // const header = React.useMemo(()=>{},[JSON.stringify(thisRc.rcHeader)])
  console.log("in rcHeader, thisRc: ", thiRc);
  const { hideQA } = useSelection();
  const { rcSize } = useRcConfig();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { editMode, setEditMode } = useRcConfig();

  function requestEdit() {
    setPressAnim("re");
  }

  return (
    <div className="relative h-[3rem] w-full border-b-2">
      <div
        ref={ref}
        onScroll={rhScroll}
        id="rhScroll"
        className="scrollbar-custom flex h-full w-full overflow-scroll"
      >
        <div className="bg-tb-row1 absolute left-0 flex h-full w-[2.1rem] min-w-[2.35rem] items-center justify-center select-none">
          <div
            title={canEdit ? "Edit Mode" : "Request Edit"}
            onClick={() => {
              canEdit ? setEditMode((p) => !p) : requestEdit();
            }}
            className={`bg-bw/10 hover:bg-bw/20 ${editMode ? "" : "ring-bw/20"} ${pressAnim.includes("re") && "ring-green-600"} ${canEdit ? "text-red-600" : "text-blue-700"} h-fit w-fit cursor-pointer rounded-[5px] p-1 font-semibold ring-2`}
          >
            {canEdit ? "E" : "R"}
          </div>
        </div>
        <div className="flex h-full min-w-fit pl-[2.35rem]">
          {thisRc?.rcHeader &&
            thisRc?.rcHeader?.map((a, i) => (
              <RowItem
                key={i + a.colName}
                name={a.colName}
                type={a.type}
                keys={[...(a.keys || []), !a.nullable ? "Not Null" : ""].filter(
                  Boolean,
                )}
                i={i}
              />
            ))}
        </div>
        {!hideQA && (
          <div
            className={`${wVal(rcSize)} bg-tb-row1 flex border-l-2 p-1 pt-2 text-sm`}
          >
            <Settings2 size={17} className="mr-2" />
            Quick Actions
          </div>
        )}
      </div>
    </div>
  );
}

type rowItem = {
  name: string;
  type: string;
  keys: string[]; //["PRIMARY KEY", "UNIQUE"]
  i: number;
};

function RowItem({ name, type, keys, i }: rowItem) {
  const [colClicked, setColClicked] = React.useState(false);
  const { rcSize, setRcSize } = useRcConfig();

  const t = (
    type.includes(" ") ? type.slice(0, type.indexOf(" ")) : type
  ).toLowerCase();
  const [isId, setIsId] = React.useState(t.includes("serial"));
  const tNum =
    t == "text"
      ? 1
      : t == "number" || t == "real" || t == "serial" || t == "integer"
        ? 2
        : t == "boolean"
          ? 3
          : t == "timestamp"
            ? 4
            : 5;
  const rType = ["", "text", "number", "boolean", "date", "file"];

  function keysNum(a: string): number {
    if (a.includes("UNIQUE")) return 1;
    if (a.includes("Not Null")) return 3;
    if (a.includes("PRIMARY")) return 0;
    else return 2;
  }

  return (
    <div
      className={`group/ri w-full ${wVal(rcSize)} ${i % 2 == 0 ? "bg-tb-row1" : "bg-tb-row2"} flex justify-between p-1 px-0.5`}
    >
      <section className="flex h-full w-[78%] flex-col truncate rounded-xl px-1">
        <p className="text-sm">{name}</p>
        <div className="flex justify-between">
          <p className="text-bw/70 text-xs">{rType[tNum]}</p>
          <div className="flex h-[1rem] rounded-xl px-0.5">
            {keys?.map((a, i) => {
              return (
                <KeysButton
                  key={a + i}
                  n={keysNum(a)}
                  name={a}
                  abbrev
                  type={tNum}
                  value={1}
                  disabled
                  boxSize={4}
                  className="h-[1rem] overflow-hidden bg-none text-sm"
                />
              );
            })}
          </div>
        </div>
      </section>
      <section
        title={`Order ${colClicked ? "descending" : "ascending"}`}
        onClick={() => setColClicked(!colClicked)}
        className="group/se hover:bg-bw/1 flex h-full w-[2rem] cursor-pointer flex-col items-center rounded-xl"
      >
        <ChevronDown
          className={`group-hover/se:bg-bw/3 opacity-0 group-hover/ri:opacity-100 ${colClicked && "rotate-180"} rounded-xl`}
        />
        <RcIcon type={rType[tNum]} name={name} />
      </section>
    </div>
  );
}

type rcIcon = {
  type: string;
  name: string;
};
function RcIcon({ type, name }: rcIcon) {
  const [rType, setRType] = React.useState("number"); //"text", "number", "boolean", "date", "file"

  React.useEffect(() => {
    console.log("rcIcon type: ", type);
    setRType(type);
  }, []);

  return (
    <div>
      {rType == "file" ? (
        <FileType size={17} />
      ) : rType == "date" ? (
        <Calendar1 size={17} />
      ) : rType == "boolean" ? (
        <RxComponentBoolean size={17} />
      ) : rType == "text" ? (
        <LucideALargeSmall size={17} />
      ) : (
        <TbNumber123 size={17} />
      )}
    </div>
  );
}
