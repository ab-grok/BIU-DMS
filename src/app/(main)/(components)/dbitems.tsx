"use client";
import { useEffect, useState } from "react";
import { Separator } from "../../../components/ui/separator";
import { db, ListDatabases } from "../[database]/actions";
import { useSideContext } from "../layoutcontext";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";

export default function DbItems() {
  const router = useRouter();
  const [databases, setDatabases] = useState<Array<db>>();
  const [clicked, setClicked] = useState({ clicked: false, db: "" });
  const { dbExpanded, sbExpanded, database } =
    useSideContext().context.sidebarState;
  //forward expanded as prop to make reusable
  useEffect(() => {
    async function data() {
      const data = await ListDatabases();
      console.log(data.items);
      if (data.items) {
        setDatabases(data.items);
      }
    }
    data();
  }, [dbExpanded]);

  useEffect(() => {}, []);

  function handleClick(name: string) {
    router.push(`/${name}`);
    setClicked({ clicked: true, db: name });
  }
  function handleUnclick() {
    setClicked({ clicked: false, db: "" });
  }
  return (
    <div
      className={`${dbExpanded ? "flex" : "hidden"} relative mb-2 h-full w-full flex-col items-center space-y-1 select-none`}
    >
      {databases &&
        dbExpanded &&
        databases.map((a, i) => {
          return (
            <div
              key={i}
              onMouseDown={() => handleClick(a.Database)}
              onMouseUp={() => handleUnclick()}
              className={`${clicked && clicked.db == a.Database ? "scale-95 shadow-sm" : "scale-100"} ${database == a.Database ? "bg-tb-foreground" : "hover:bg-tb-foreground/50"} group bg-card-foreground relative flex h-[3rem] w-[80%] flex-none cursor-pointer items-center overflow-clip rounded-xl p-2 text-sm transition-all ease-in`}
            >
              <Database
                className={`w-[20px] min-w-[20px] stroke-blue-400 transition-all ${database == a.Database ? "fill-zinc-950" : ""}`}
              />{" "}
              <div
                className={`${sbExpanded ? "flex" : "hidden lg:flex"} text-foreground mr-[2rem] w-full max-w-full transition-all duration-100 group-hover:translate-x-3`}
              >
                {a.Database}{" "}
              </div>
            </div>
          );
        })}
    </div>
  );
}
