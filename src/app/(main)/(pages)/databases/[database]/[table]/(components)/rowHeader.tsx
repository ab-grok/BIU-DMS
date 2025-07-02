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
import { tbRcs } from "@/app/(main)/(pages)/fetchcontext";
import { revalidate } from "@/lib/sessions";

type rowHeader = {
  tbPath: string;
  ref: React.RefObject<HTMLDivElement | null>;
  canEdit: boolean;
  rhScroll: (e: any) => void;
  thisTb: tbRcs;
};

export function RowHeader({
  tbPath,
  thisTb,
  ref,
  canEdit,
  rhScroll,
}: rowHeader) {
  // const header = React.useMemo(()=>{},[JSON.stringify(thisTb.tbHeader)])
  // console.log("in tbHeader, thisTb: ", thisTb);
  const { hideQA } = useSelection();
  const { rcSize } = useRcConfig();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { editMode, setEditMode } = useRcConfig();

  function requestEdit() {
    setPressAnim("re");
  }

  function isDefault(col: string) {
    if (col == "updated_at" || col == "updated_by") return true;
    return false;
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
          {thisTb?.tbHeader &&
            thisTb?.tbHeader?.map((a, i) => {
              if (a.colName != "ID")
                return (
                  <HeaderItem
                    key={i + a.colName}
                    name={a.colName}
                    type={isDefault(a.colName) ? "DEFAULT" : a.type}
                    keys={[
                      ...(a.keys || []),
                      !a.nullable ? "NOT NULL" : "",
                      isDefault(a.colName) ? "DEFAULT" : "",
                    ].filter(Boolean)}
                    i={i}
                    tbPath={tbPath}
                  />
                );
            })}
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

type headerItem = {
  name: string;
  type: string;
  keys: string[]; //["PRIMARY KEY", "UNIQUE"]
  i: number;
  tbPath: string;
};

function HeaderItem({ name, type, keys, i, tbPath }: headerItem) {
  const { orderBy, setOrderBy } = useSelection();

  const { rcSize } = useRcConfig();

  const t = (
    type.includes(" ") ? type.slice(0, type.indexOf(" ")) : type
  ).toLowerCase();
  const [isId, setIsId] = React.useState(t.includes("serial"));
  const tNum =
    t == "default"
      ? 6
      : t == "file" || t == "user-defined"
        ? 5
        : t == "timestamp"
          ? 4
          : t == "boolean"
            ? 3
            : t == "number" || t == "real" || t == "serial" || t == "integer"
              ? 2
              : 1;
  const rType = ["", "text", "number", "boolean", "date", "file", "DEFAULT"];

  function keysNum(a: string): number {
    if (a.includes("UNIQUE")) return 1;
    if (a.includes("NOT NULL")) return 3;
    if (a.includes("PRIMARY")) return 0;
    if (a.includes("DEFAULT")) return 4;
    else return 2;
  }

  async function orderClicked() {
    revalidate("tbData", "path", tbPath);
    setOrderBy((p) => ({
      ...p,
      rc:
        p.rc.order == "desc"
          ? { col: name, order: "asc" }
          : { col: name, order: "desc" },
    }));
    //trigger rc dependency
    //revalidate tbpath-tbData
  }

  return (
    <div
      className={`group/ri w-full ${wVal(rcSize)} ${i % 2 == 0 ? "bg-tb-row1" : "bg-tb-row2"} flex justify-between p-1 px-0.5 select-none`}
    >
      <section className="flex h-full w-[78%] flex-col truncate rounded-xl px-1">
        <p
          className={`${type == "DEFAULT" && "text-bw/60"} text-sm font-semibold`}
        >
          {name}
        </p>
        <div className="flex justify-between">
          <p className="text-xs text-stone-600">{rType[tNum]}</p>
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
        title={`Order ${orderBy.rc.order == "desc" ? "descending" : "ascending"}`}
        onClick={orderClicked}
        className="group/se hover:bg-bw/1 flex h-full w-[2rem] cursor-pointer flex-col items-center rounded-xl"
      >
        <ChevronDown
          className={`group-hover/se:bg-bw/3 opacity-0 group-hover/ri:opacity-100 ${orderBy.rc.order == "desc" && "rotate-180"} rounded-xl`}
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
