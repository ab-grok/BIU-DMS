import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { listTables } from "@/lib/actions";
import {
  TextCursorInput,
  TableProperties,
  DatabaseZap,
  PlusIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useButtonAnim } from "./count";

type toolbar = {
  showToolbar: boolean;
};
type page = {
  tb: string;
  db: string;
  record: string;
};

export function Toolbar() {
  const [page, setPage] = useState({} as page);
  const [toolClicked, setToolClicked] = useState("");
  const [selectedAllTb, setSelectAllTb] = useState(false);
  const [count, setCount] = useState(0);
  const {
    create,
    setCreate,
    selectedTb,
    setSelectedTb,
    selectedRecords,
    setSelectedRecords,
  } = useSelection();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const path = usePathname();
  const router = useRouter();

  function selAll() {
    setPressAnim("sA");
    if (page.record) {
      //
    } else if (page.tb) {
    } //list rows
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
    }
  }

  async function selectAllTb() {
    const { tbArr } = await listTables(page.db);
    if (tbArr && tbArr.length) {
      if (selectedAllTb) {
        setSelectedTb("");
        //doesnt use multiSelectedTb
        setSelectAllTb(false);
      } else {
        setSelectedTb("");
        tbArr.forEach((a, i) => {
          setSelectedTb(selectedTb + page.db + "/" + a.tbName + ",");
        });
        setSelectAllTb(true);
      }
    }
  }

  function countTb() {}
  // add sortby: lastupdated (up,down), alphabetical(up,down), date created(up,down)
  useEffect(() => {
    const currPath = path?.slice(path?.indexOf("databases")) ?? "";
    console.log("this path: ", path);
    console.log("curr path: ", currPath);
    //db lists all tables, tb lists all records, record lists a single record
    const pages = currPath.split("/");
    if (pages.length > 3)
      setPage({ db: pages[1], tb: pages[2], record: pages[3] });
    else if (pages.length > 2)
      setPage({ db: pages[1], tb: pages[2], record: "" });
    else if (pages.length > 1) setPage({ db: pages[1], tb: "", record: "" });
    else setPage({ db: "", tb: "", record: "" });
  }, [path]);

  useEffect(() => {
    if (page.record && selectedRecords)
      setCount(selectedRecords.split(",").filter(Boolean).length);
    else if (page.tb && selectedTb)
      setCount(selectedTb.split(",").filter(Boolean).length);
  }, [selectedTb, selectedRecords]);

  return (
    <header
      className={` ${!page.db && "hidden"} bg-main-fg border-main-bg relative flex h-full max-h-[3rem] min-h-[3rem] items-center border-b-2 px-1`}
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
            {selectedAllTb ? "unselect all" : "Select all"}
          </span>
          <span
            className={`${count > 1 ? "flex" : "hidden"} items-center justify-center pr-6`}
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
        </section>
      </div>
    </header>
  );
}
