import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import {
  TextCursorInput,
  TableProperties,
  DatabaseZap,
  PlusIcon,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useButtonAnim } from "./count";
import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import { useFetchContext } from "@/app/(main)/(pages)/fetchcontext";
import { useSideContext } from "@/app/(main)/layoutcontext";

type page = {
  tb: string;
  db: string;
  record: string;
};

export function Toolbar() {
  const [page, setPage] = useState({} as page);
  const [toolClicked, setToolClicked] = useState("");
  const [pressedAllTb, setPressedAllTb] = useState(false);
  const [count, setCount] = useState(0);
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { allTbs } = useFetchContext();
  const { showToolbar } = useSideContext().context;
  const {
    database: dbName,
    table: tbName,
    record: rcName,
  } = useParams() as Record<string, string>;
  const { create, setCreate, selectedTb, setSelectedTb, selectedRc } =
    useSelection();
  const router = useRouter();
  const currRc = selectedRc?.find((a) => a.path == dbName + "/" + tbName);

  function selAll() {
    setPressAnim("sA");
    if (page.record) {
      //??
    } else if (page.tb) {
    } //select all rc
    else if (page.db) {
      selectAllTb();
    }
  }

  function reRoute(n: number) {
    const thisPath = "/databases/";
    // console.log("reRoute: ", page);
    if (n == 1) {
      setPressAnim("rc");
      page.record &&
        router.push(thisPath + page.db + "/" + page.tb + "/" + page.record);
    } else if (n == 2) {
      setPressAnim("tb");
      page.tb && router.push(thisPath + page.db + "/" + page.tb);
    } else if (n == 3) {
      setPressAnim("db");
      page.db && router.push(thisPath + page.db);
    } else if (n == 5) {
      setPressAnim("new");
      //if (page.record) {}
      if (page.tb) create == "record" ? setCreate("") : setCreate("record");
      else if (page.db) create == "table" ? setCreate("") : setCreate("table");
      console.log("Toolbar's reRoute create: ", create);
    } else if (n == 4) {
      setPressAnim("back");
      router.back();
    } else if (n == 6) {
      setPressAnim("forward");
      router.forward();
    }
  }

  async function selectAllTb() {
    //tbPath = dbName/tbName,
    if (!pressedAllTb) {
      for (const { dbName, tbList } of allTbs) {
        if (page.db == dbName) {
          tbList.forEach((a) => {
            const tbPath = dbName + "/" + a.tbName + ",";
            setSelectedTb((p) => {
              if (p.includes(tbPath)) return p;
              else return p + tbPath;
            });
          });
        }
      }
      setPressedAllTb(!pressedAllTb);
    } else setSelectedTb("");
  }

  function countTb() {}
  // add sortby: lastupdated (up,down), alphabetical(up,down), date created(up,down)
  useEffect(() => {
    setPage({ tb: tbName, db: dbName, record: rcName });
  }, [dbName, tbName, rcName]);

  //   export type selectedRc = {
  //   path: string; //dbName/tbName
  //   rows: string[]; //[[col1, val1], [col2, val2]]
  // };

  useEffect(() => {
    if (page.tb) {
      if (currRc && currRc.rows?.length > 1) setCount(currRc.rows.length);
    } else {
      if (page.db) {
        const tbCount = selectedTb.split(",").filter(Boolean).length;
        if (tbCount > 1) setCount(tbCount);
      }
    }
  }, [currRc?.rows?.length, selectedTb]);

  return (
    <header
      className={` ${(!page.db || !showToolbar) && "hidden"} bg-main-fg border-main-bg relative flex h-full max-h-[3rem] min-h-[3rem] items-center border-b-2 px-1`}
    >
      <div className="flex h-[2.5rem] w-full items-center justify-between overflow-hidden rounded-xl p-1 text-sm">
        <section className="relative flex h-full max-w-fit items-center rounded-2xl select-none">
          <div
            onClick={() => reRoute(5)}
            title={` Create a new ${page.record ? "" : page.tb ? "record" : page.db ? "table" : ""} `}
            className={` ${pressAnim == "new" && "scale-95 shadow-none"} ${create == "record" || (create == "table" && "ring-2")} hover:bg-sub-fg bg-sub-fg/50 mr-2 flex size-8 cursor-pointer items-center justify-center rounded-[5px] hover:shadow-sm`}
          >
            <PlusIcon
              className={`${(create == "record" || create == "table") && "rotate-45"} transition-all`}
            />
          </div>
          <span
            onClick={() => selAll()}
            className={` ${toolClicked?.includes("selAll") && "font-bold ring-2"} ${pressAnim == "sA" && "scale-95"} ring-bg-sub-fg hover:bg-sub-fg flex h-full w-fit cursor-pointer items-center rounded-2xl px-3 text-center`}
          >
            {pressedAllTb ? "Unselect all" : "Select all"}
          </span>
          <span
            className={`${count > 1 ? "flex" : "hidden"} text-bw/70 items-center justify-center pr-6`}
          >
            {" "}
            Selected:
            <span className="absolute right-2 mt-[0.35px] text-center font-medium">
              {count}
            </span>{" "}
          </span>
        </section>
        <section className="just flex h-full w-fit min-w-fit items-center justify-end rounded-2xl bg-purple-400">
          {page.record && (
            <span
              onClick={() => reRoute(1)}
              className={`${pressAnim == "rc" && "scale-95"} group/a hover:bg-sub-fg flex h-full cursor-pointer items-center gap-1 rounded-2xl px-2 select-none`}
            >
              <TextCursorInput className="group-hover/a:fill-sub-fg size-5" />
              row
            </span>
          )}
          {page.tb && (
            <span
              onClick={() => reRoute(2)}
              className={`${pressAnim == "tb" && "scale-95"} group/b hover:bg-sub-fg flex h-full cursor-pointer items-center gap-1 rounded-2xl px-2 select-none`}
            >
              <TableProperties className="group-hover/b:fill-sub-fg size-5" />
              Table
            </span>
          )}
          {page.db && (
            <span
              onClick={() => reRoute(3)}
              className={`${pressAnim == "db" && "scale-95"} group/c hover:bg-sub-fg flex h-full cursor-pointer items-center gap-1 rounded-2xl px-2 select-none`}
            >
              <DatabaseZap className="group-hover/c:fill-sub-fg size-5" />
              database
            </span>
          )}
          <div
            className={`hover:bg-sub-fg flex h-full cursor-pointer items-center gap-1 rounded-2xl px-2 select-none`}
          >
            <span
              onClick={() => reRoute(4)}
              className={`${pressAnim == "back" && "scale-95"} hover:bg-bw/70 h-fit w-fit rounded-full p-1`}
            >
              <IoCaretBack className="group-hover/c:fill-sub-fg size-5" />
            </span>
            <span
              onClick={() => reRoute(6)}
              className={`${pressAnim == "forward" && "scale-95"} hover:bg-bw/70 h-fit w-fit rounded-full p-1`}
            >
              <IoCaretForward className="group-hover/c:fill-sub-fg size-5" />
            </span>
          </div>
        </section>
      </div>
    </header>
  );
}
