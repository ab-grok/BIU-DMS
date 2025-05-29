"use client";
import UserTag from "@/components/usertag";
import { RowItem } from "./rowitems";
import { QuickActions } from "./quickactions";
import { LogIn } from "lucide-react";
import Index from "@/components";
import Count, { useButtonAnim } from "@/components/count";
import { db } from "@/lib/actions";
import Marker from "@/components/marker";
import { useEffect, useState } from "react";
import { useSelection } from "../../selectcontext";
import { delDb } from "@/lib/server";
import {
  useAddUsers,
  useConfirmDialog,
  useNotifyContext,
} from "@/app/dialogcontext";
import { useRouter } from "next/navigation";
import { revalidate } from "@/lib/sessions";

export default function Db({
  db,
  i,
  udata,
}: {
  db: db;
  i: number;
  udata: string;
}) {
  const { selectedDbUsers, setSelectedDbUsers } = useSelection();
  const [viewerHovered, setViewerHovered] = useState(0);
  const [editorHovered, setEditorHovered] = useState(0);
  const [cardClicked, setCardClicked] = useState(0);
  const { setNotify } = useNotifyContext();
  const [uAccess, setUAccess] = useState({ edit: false, view: false });
  const { setAddUsers } = useAddUsers();
  const { confirmDialog, setConfirmDialog } = useConfirmDialog();
  const router = useRouter();
  const { pressAnim } = useButtonAnim();

  useEffect(() => {
    const u = udata.split("&");
    console.log("u from db.tsx: ", u);
    console.log("db from db.tsx: ", db);
    // console.log("Db, uData: ", udata);
    if (!db.createdBy && !db.editors) setUAccess({ edit: true, view: true });
    else {
      if (db?.viewers?.includes(u[0])) setUAccess({ edit: false, view: true });
      if (db?.createdBy?.includes(u[0]) || db?.editors?.includes(u[0]))
        setUAccess({ edit: true, view: true });
    }
  }, []);

  function handleSelectedUsers(id: string) {}

  function handleAddUsers(n: number) {
    const vData = db.viewers?.filter(Boolean).join(",");
    const eData = db.editors?.filter(Boolean).join(",");
    if (n == 1) {
      setAddUsers({
        category: "viewers",
        type: db.Database + ",db",
        viewers: vData,
        editors: eData,
      });
    }
    if (n == 2) {
      setAddUsers({
        category: "editors",
        type: db.Database + ",db",
        viewers: vData,
        editors: eData,
      });
    }
  }

  async function deleteDb() {
    console.log("got in delDb");
    const { error } = await delDb(db.Database);
    console.log("got past delDb, error: ", error);
    if (error) setNotify({ message: error, danger: true });
    else setNotify({ message: "Database deleted successfully" });
    revalidate("databases", "all");
    router.refresh();
  }

  return (
    <div
      className={`group flex min-h-[5rem] w-full min-w-fit flex-none items-center ${i % 2 == 0 ? "bg-main-fg" : "bg-row-bg1/40"} hover:bg-bw/30`}
    >
      {" "}
      <Index i={i + 1} className="sticky h-[5rem] max-w-[2rem]" />
      <RowItem itemsStart text="sm" route={`/databases/${db.Database}`} i={1}>
        {db.Database && db.Database.length > 17
          ? db.Database.slice(0, 14) + `...`
          : db.Database}
        <div className="group/dr relative flex w-full">
          <div className="text-bw/70 flex items-center space-x-3 text-xs">
            <span>tables:</span>
            <Count n={db.tbCount} />
          </div>{" "}
          <LogIn
            className={`${pressAnim == "ri1" && "-translate-x-5"} absolute top-0 right-0 hidden size-5 transition-all group-hover:flex group-hover/dr:-translate-x-5`}
          />
        </div>
      </RowItem>
      <RowItem
        itemsStart={db.description ? true : false}
        italics={!db.description ? true : false}
        extend
        i={2}
      >
        {db.description || "No description yet"}
      </RowItem>
      <RowItem i={3}>
        <UserTag
          name={db?.createdBy?.split("&")[2] ?? "Admin"}
          title={db?.createdBy?.split("&")[1]}
          className="mb-1"
        />
        <Count date={db.createdAt} className="fill-blue-600/70" />
      </RowItem>
      <RowItem fn={() => handleAddUsers(1)} extend i={4}>
        {db.viewers?.length ? (
          db.viewers.map((a, i) => {
            const v = a?.split("&");
            return (
              <div
                key={i}
                onMouseEnter={() => setViewerHovered(i + 1)}
                onMouseLeave={() => setViewerHovered(0)}
                className="flex items-center"
              >
                <UserTag name={v[2]} title={v[1]} cap={15} />
                {/* <Marker
                  hovered={viewerHovered == i + 1}
                  selectContext={selectedDbUsers?.viewers}
                  uPath={v[0] + "?" + db.Database}
                /> */}
              </div>
            );
          })
        ) : (
          <UserTag name={""} />
        )}
      </RowItem>
      <RowItem
        //can filter id for separate card and usertag clicks
        fn={() => handleAddUsers(2)}
        extend
        i={5}
      >
        {db.editors?.length ? (
          db.editors.map((a, i) => {
            const e = a?.split("&");
            console.log("editors[i] = ", a);
            return (
              <div
                key={i}
                onMouseEnter={() => setEditorHovered(i + 1)}
                onMouseLeave={() => setEditorHovered(0)}
                className="flex items-center"
              >
                <UserTag name={e[2]} title={e[1]} cap={15} />
                <Marker
                  hovered={editorHovered == i + 1}
                  selectContext={selectedDbUsers?.editors}
                  uPath={e[0] + "?" + db.Database}
                />
              </div>
            );
          })
        ) : (
          <UserTag name={""} />
        )}
      </RowItem>
      <QuickActions
        action1="Delete"
        action2={`${uAccess.edit ? "Add viewer" : !uAccess.view ? "Request view" : ""}`}
        action3={`${uAccess.edit ? "Add editor" : ""}`}
        hoverColor1="red"
        hoverColor2="green"
        hoverColor3="blue"
        fn1={() => {
          setConfirmDialog({
            type: "database",
            action: "delete",
            name: db.Database,
            confirmFn: deleteDb,
          });
        }}
      />
    </div>
  );
}
