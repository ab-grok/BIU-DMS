import { useEffect, useState } from "react";
import { Separator } from "../../../components/ui/separator";
import { db, ListDatabases } from "../[database]/actions";
import { useSideContext } from "../layoutcontext";

export default function DbItems() {
  const [databases, setDatabases] = useState<Array<db>>();
  const [expand, setExpand] = useState(false);
  const { dbExpanded } = useSideContext().context.sidebarState;
  useEffect(() => {
    async function data() {
      const data = await ListDatabases();
      console.log(data.items);
      if (data.items) {
        setDatabases(data.items);
      }
    }
    data();
  }, []);
  return (
    <div
      className={`${dbExpanded ? "flex" : "hidden"} relative mb-2 h-full w-full flex-col items-center space-y-1 bg-green-600`}
    >
      <div className="bg-bw absolute top-0 z-5 h-[90%] w-[2px]" />
      {databases &&
        databases.map((a, i) => (
          <div
            key={i}
            className="relative grid h-[3rem] w-[20rem] flex-none items-center bg-white text-center text-black"
          >
            {" "}
            {a.Database}{" "}
          </div>
        ))}
    </div>
  );
}
