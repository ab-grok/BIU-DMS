"use client";
import { FaEye } from "react-icons/fa";
import { MdUpdate } from "react-icons/md";
import Index from "@/components";
import { TbClockHour4Filled } from "react-icons/tb";
import { RiShieldUserFill } from "react-icons/ri";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import { ChevronDown, Edit, KeyRound, LockIcon, UserPen } from "lucide-react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Count, { useButtonAnim } from "@/components/count";
import { QuickActions } from "../../(components)/quickactions";
import Marker from "@/components/marker";
import { useSelection } from "../../../selectcontext";
import { useRouter } from "next/navigation";
import { Tb } from "@/lib/actions";
import {
  useAddUsers,
  useConfirmDialog,
  useNotifyContext,
} from "@/app/dialogcontext";
import { deleteTb, getUserAccess } from "@/lib/server";
import { revalidate } from "@/lib/sessions";

type tbType = {
  i: number;
  Tb: Tb;
  uData: string;
  dbName: string;
};
export default function TableCard({ Tb, i, uData, dbName }: tbType) {
  const router = useRouter();

  const { pressAnim, setPressAnim } = useButtonAnim();
  const [uAccess, setUAccess] = useState({ edit: false, view: false });
  type userType = { id: string; ttl: string; fname: string }[];

  // const [viewers, setViewers] = useState([] as userType);
  // const [editors, setEditors] = useState([] as userType);
  const tbPath = dbName + "/" + Tb.tbName + ",";
  const [metaHover, setMetaHover] = useState(0);
  const [viewerHover, setViewerHover] = useState(0);
  const [editorHover, setEditorHover] = useState(0);
  const [cardExpand, setCardExpand] = useState(false);
  const [btnClicked, setBtnClicked] = useState("");
  const [expandUsers, setExpandusers] = useState("");
  const hoverTime = useRef<NodeJS.Timeout | undefined>(undefined);
  const { setNotify } = useNotifyContext();
  const { setAddUsers } = useAddUsers();
  const { setConfirmDialog } = useConfirmDialog();
  const {
    setSelectedTbUsers,
    // multiSelectedTb,
    // setMultiSelectedTb,
    selectedTbUsers,
    selectedTb,
    setSelectedTb,
    setCreated,
  } = useSelection();

  useEffect(() => {
    (async () => {
      const u = uData.split("&")[0];
      console.log("uData in TableCard: ", uData);
      Tb.viewers?.forEach((a) => {
        if (a.includes(u[0])) setUAccess({ view: true, edit: false });
        // setViewers((p) => {
        //   return [...p, { id: u[0], ttl: u[0], fname: u[0] }].filter(Boolean);
        // });
      });
      Tb.editors?.forEach((a) => {
        if (a.includes(u[0])) setUAccess({ view: true, edit: true });
        // setEditors((p) => {
        //   return [...p, { id: u[0], ttl: u[0], fname: u[0] }].filter(Boolean);
        // });
      });

      if (Tb.createdBy?.includes(u[0])) setUAccess({ edit: true, view: true });
    })();
    console.log("Tb in TableCard: ", Tb);
  }, []);

  function handleMetaHover(n: number) {
    if (n) {
      hoverTime.current = setTimeout(() => {
        setMetaHover(1);
      }, 1500);
    } else {
      setMetaHover(0);
      clearTimeout(hoverTime.current);
    }
  }

  function handleCardClicked(e: React.UIEvent<HTMLElement>) {
    selectedTb != tbPath && setSelectedTb(tbPath);
    const trigger = (e.target as HTMLElement).id;
    if (
      // e.target == e.currentTarget ||
      trigger == "viewers" ||
      trigger == "editors"
    ) {
      tbPath == selectedTb && setCardExpand(!cardExpand);
    }
  }

  //replacing a user (complex): sameTable - userid1?db1/tb1, userid2?db1/tb1. otherTable - userid1?db2/tb2
  //all selections regardless of table will be mass handled -- can separate actions by table later on.

  //rearrange to {}[]: {dbOrTb:, users:} -- three actions to perform viewers/editors/delete,, will need to filter
  function handleUserSel(id: string) {
    const uPath = `${id}?${dbName}/${Tb.tbName},`;
    setSelectedTb(tbPath);

    if (selectedTbUsers?.viewers?.includes(uPath)) {
      setSelectedTbUsers((p) => ({
        ...p,
        viewers: p.viewers.replace(uPath, ""),
      }));
    } else setSelectedTbUsers((p) => ({ ...p, viewers: p.viewers + uPath }));

    if (selectedTbUsers?.editors?.includes(uPath)) {
      setSelectedTbUsers((p) => ({
        ...p,
        editors: p.editors.replace(uPath, ""),
      }));
    } else setSelectedTbUsers((p) => ({ ...p, editors: p.editors + uPath }));
  }

  function handleAddUsers(n: number) {
    const vData = Tb.viewers.filter(Boolean).join(",");
    const eData = Tb.editors.filter(Boolean).join(",");
    if (n == 1) {
      setAddUsers({
        category: "viewers",
        type: dbName + "/" + Tb.tbName + ",tb",
        viewers: vData,
        editors: eData,
      });
    }
    if (n == 2) {
      setAddUsers({
        category: "editors",
        type: dbName + "/" + Tb.tbName + ",tb",
        editors: eData,
        viewers: vData,
      });
    }
  }

  function requestRole(n: number) {}

  function handleMultiTables() {
    if (selectedTb?.includes(tbPath)) {
      setSelectedTb((p) => p.replace(tbPath, ""));
    } else {
      setSelectedTb((p) => p + tbPath);
    }
  }

  async function deleteTable() {
    console.log("delete table clicked: ", Tb.tbName);
    //create confirm Dialog
    const { error } = await deleteTb({
      dbName: dbName,
      tbName: Tb.tbName,
      userId: uData.split("&")[0],
    });
    console.log("deleteTb completed");
    if (error) {
      setNotify({
        message: error,
        danger: true,
      });
    } else {
      setNotify({
        message: "Table deleted successfully",
      });
      revalidate("tables", "all");
      setCreated((p) => ({ ...p, tb: Tb.tbName }));
      // router.refresh();
    }
  }

  function handleEnter(a: string) {
    setBtnClicked(a);
    setTimeout(() => {
      setBtnClicked("");
    }, 60);
    if (a == "door" && (uAccess.view || uAccess.edit)) {
      router.push(`/databases/${dbName}/${Tb.tbName}`);
    } else {
      setNotify({
        message: "You must be an editor or viewer to access this table!",
        danger: true,
      });
    }
  }

  function handleExpand(m: string, n: number) {
    if (m == "view") {
      n == 1 ? setExpandusers("view") : setExpandusers("");
    } else {
      n == 1 ? setExpandusers("edit") : setExpandusers("");
    }
  }

  const items = ["Author", "Created on", "Last updated", "Editor"];
  const TbMeta = [
    [Tb.createdBy?.split("&")[2], Tb.createdBy?.split("&")[1]],
    [dateAbrev(Tb.createdAt)],
    [dateAbrev(Tb.updatedAt)],
    [Tb.updatedBy?.split("&")[2], Tb.updatedBy?.split("&")[1]],
  ];

  function dateAbrev(d?: Date) {
    if (!d) return "";

    if (!(d instanceof Date)) return "";
    const dateStr = d?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
    return dateStr;
  }

  // const views = [
  //   "Mr.jacobs",
  //   "Prof.Mark",
  //   "Dr.Wyatt",
  //   "Mr.Popenums",
  //   "Mr.jacobs",
  // ];
  // const edits = [
  //   "Mr.jacobs",
  //   "Prof.Mark",
  //   "Dr.Wyatt",
  //   "Mr.Popenums",
  //   "Mr.jacobs",
  //   "Prof.Mark",
  //   "Dr.Wyatt",
  //   "Mr.Popenums",
  //   "Mr.jacobs",
  //   "Prof.Mark",
  //   "Dr.Wyatt",
  //   "Mr.Popenums",
  //   "Mr.jacobs",
  //   "Prof.Mark",
  //   "Dr.Wyatt",
  //   "Mr.Popenums",
  // ];

  return (
    <div
      className={`${i % 2 == 0 ? "bg-tb-row1/60" : "bg-tb-row1/10"} group relative flex min-h-[10rem] w-full min-w-fit transition-all`}
    >
      <Index
        i={i}
        className="group-hover:bg-sub-grad-forced/70 sticky h-[11.2rem] self-center"
        morph="selected"
        selected={selectedTb?.includes(Tb.tbName)}
      />
      <div
        id="main"
        onClick={(e) => {
          handleCardClicked(e);
        }}
        className={`${selectedTb?.includes(Tb.tbName) && "ring-2 ring-blue-700/40"} ${i % 2 == 0 ? "bg-row-bg1/80" : "bg-row-bg1/50"} group-hover:bg-sub-grad-forced/30 border-main-bg/50 items-center-2 m-2 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-xs ring-blue-700/20 hover:ring-2`}
      >
        <section
          id="table"
          className={`flex min-w-[15rem] flex-col items-center gap-y-0.5`}
        >
          <header
            title={Tb.tbName}
            className="flex min-h-[3rem] w-[15rem] cursor-default items-center justify-between pr-1"
          >
            <div className="w-1/2">
              <span>
                {Tb.tbName.length > 17
                  ? Tb.tbName.slice(0, 17) + "..."
                  : Tb.tbName}
              </span>
              <div className="text-bw/70 flex items-center gap-1 text-xs">
                <span>Rows</span>
                <Count n={Tb.rowCount} />
              </div>
            </div>
            <div
              onClick={() => handleEnter("door")}
              className={`${selectedTb?.includes(Tb.tbName) ? "flex" : "hidden group-hover:flex"} ${btnClicked && "scale-95"} group/enter bg-sub-bg/80 h-[80%] w-1/3 cursor-pointer items-center justify-end rounded-2xl pr-3 transition-all hover:shadow-sm`}
            >
              {!(uAccess.view || uAccess.edit) ? (
                <LockIcon
                  className={`${btnClicked == "door" ? "scale-[0.97]" : ""} stroke-red-900 stroke-3 duration-50 group-hover/enter:rotate-y-45 group-hover/enter:stroke-red-600 group-hover/enter:shadow-sm hover:scale-105`}
                />
              ) : (
                <KeyRound
                  className={`${btnClicked == "door" ? "scale-[0.97]" : ""} stroke-bw/60 group-hover:stroke-green-600 group-hover/enter:rotate-45`}
                />
              )}
            </div>
          </header>
          <div
            id="Table meta"
            title={Tb.description || Tb.tbName}
            className="bg-bw/10 px-1' flex h-fit min-h-[6rem] w-full items-center gap-x-[1%] rounded-2xl p-0.5 shadow-sm"
          >
            <div className="flex h-full min-w-[50%] flex-col justify-center gap-y-1.5 text-[12px]">
              {items.map((a, i) => (
                <TableAttr key={i} hover={metaHover} title={a} i={i + 1}>
                  <TbIcons i={i + 1} />
                </TableAttr>
              ))}
            </div>
            <Separator orientation="vertical" className="bg-main-bg/10" />
            <div
              onMouseEnter={() => handleMetaHover(1)}
              onMouseLeave={() => handleMetaHover(0)}
              className="flex h-full min-w-[40%] flex-col justify-center gap-y-1 pt-1"
            >
              {TbMeta &&
                TbMeta.map((a, i) => (
                  <UserTag
                    key={i + 4}
                    name={TbMeta[i][0]}
                    title={TbMeta[i][1]}
                    className={`${i < 2 ? "bg-green-600/70" : "bg-amber-600/70"} text-xs`}
                    cap={15}
                  />
                ))}
            </div>
          </div>
        </section>
        <Separator orientation="vertical" className="bg-main-bg/10" />
        <section
          className={`hidden max-h-fit min-w-[20rem] justify-center gap-x-[1%] md:flex`}
        >
          <div
            id="viewers"
            className={` ${cardExpand ? `max-h-full` : "max-h-[10rem]"} min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              id="viewers"
              title="Click to expand"
              onClick={() => setPressAnim("view")}
              onMouseEnter={() => handleExpand("view", 1)}
              onMouseLeave={() => handleExpand("view", 0)}
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 font-normal select-none"
            >
              Viewers
              {expandUsers == "view" ? (
                <ChevronDown
                  className={`${pressAnim == "view" ? "scale-[0.90]" : "drop-shadow-sm"} translate-y-3 animate-bounce`}
                />
              ) : (
                <FaEye className="size-6 stroke-pink-800 opacity-80" />
              )}
            </div>
            <div className="bg-bw/10 relative flex h-[7.5rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {Tb.viewers ? (
                Tb.viewers.map((a, i) => {
                  const v = a.split("&");
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setViewerHover(i + 1)}
                      onMouseLeave={() => setViewerHover(0)}
                      className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
                    >
                      {" "}
                      <span onClick={() => handleUserSel(v[0])}>
                        <Index
                          size={4}
                          i={i + 1}
                          className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                          hovered={viewerHover}
                        />
                      </span>
                      <UserTag
                        name={v[2]}
                        title={v[1]}
                        className="w-fit justify-start text-xs font-normal"
                        hovered={viewerHover == i + 1}
                      />
                      <span
                        onClick={() => handleUserSel(v[0])}
                        className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1"
                      >
                        <Marker
                          hovered={viewerHover == i + 1}
                          selectContext={selectedTbUsers?.viewers}
                          uPath={v[0] + "?" + dbName + "/" + Tb.tbName}
                        />
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="top-1/2 self-center text-xs font-light italic">
                  {" "}
                  No Viewers yet{" "}
                </div>
              )}
            </div>
          </div>
          <Separator orientation="vertical" className="bg-main-bg/10" />
          <div
            id="editors"
            className={`${cardExpand ? `max-h-full` : "max-h-[10rem]"} min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              title="Click to expand"
              onClick={() => setPressAnim("edit")}
              onMouseEnter={() => handleExpand("edit", 1)}
              onMouseLeave={() => handleExpand("edit", 0)}
              id="editors"
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 text-sm font-medium select-none"
            >
              Editors
              {expandUsers == "edit" ? (
                <ChevronDown
                  className={`${pressAnim == "edit" ? "scale-[0.90]" : "drop-shadow-xs"} translate-y-3 animate-bounce`}
                />
              ) : (
                <Edit
                  className={`stroke-bw/50 ${selectedTb?.includes(Tb.tbName) ? "fill-green-600/30" : ""}`}
                />
              )}
            </div>
            <div className="bg-bw/10 relative flex h-[7.5rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {Tb.editors ? (
                Tb.editors.map((a, i) => {
                  const e = a.split("&");
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setEditorHover(i + 1)}
                      onMouseLeave={() => setEditorHover(0)}
                      className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
                    >
                      {" "}
                      <span onClick={() => handleUserSel(e[0])}>
                        <Index
                          size={4}
                          i={i + 1}
                          className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                          hovered={editorHover}
                        />
                      </span>
                      <UserTag
                        name={e[2]}
                        title={e[1]}
                        className="w-fit justify-start text-xs font-normal"
                        hovered={editorHover == i + 1}
                      />
                      <span
                        onClick={() => handleUserSel(e[0])}
                        className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1"
                      >
                        <Marker
                          hovered={editorHover == i + 1}
                          selectContext={selectedTbUsers?.editors}
                          uPath={e[0] + "?" + dbName + "/" + Tb.tbName}
                        />
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="top-1/2 self-center text-xs font-light italic">
                  {" "}
                  No editors yet{" "}
                </div>
              )}
            </div>
          </div>{" "}
        </section>
      </div>
      <section>
        <QuickActions //ordering may bring problems,, can do a quick change to editor/viewer
          action1="Select"
          action2={`${uAccess.edit ? "Add viewer" : !uAccess.view ? "Request view" : ""}`}
          action3={`${uAccess.edit ? "Add editor" : "Request edit"}`}
          action4={`${uAccess.edit ? "Delete" : ""}`}
          hoverColor1="blue"
          hoverColor2="green"
          hoverColor4="red"
          fn1={() => handleMultiTables()}
          fn2={uAccess.edit ? () => handleAddUsers(1) : () => requestRole(1)}
          fn3={uAccess.edit ? () => handleAddUsers(2) : () => requestRole(1)}
          fn4={() =>
            setConfirmDialog({
              type: "table",
              action: "delete",
              head: "Are you sure you want to",
              name: Tb.tbName,
              confirmFn: deleteTable,
            });
          }
        />
      </section>
    </div>
  );
}

type tableAttr = {
  title: string;
  hover?: number;
  i: number;
};

function TableAttr({
  children,
  title,
  hover,
  i,
}: PropsWithChildren<tableAttr>) {
  const [anim, setAnim] = useState(false);
  if (hover) {
    setTimeout(() => {
      setAnim(true);
    }, 100 * i);
  } else {
    setTimeout(() => {
      setAnim(false);
    }, 100 * i);
  }

  const iconColor =
    i == 1
      ? "text-green-800"
      : i == 2
        ? "text-yellow-800"
        : i == 3
          ? "text-blue-800"
          : "text-red-800";

  return (
    <div className={`relative flex items-center`}>
      <span
        className={`text-bw/80 max-h-[1.2rem] flex-none font-medium transition-all ${anim ? "" : "translate-x-[1rem] opacity-0"}`}
      >
        {title}:
      </span>
      <span className={`${anim ? iconColor : `text-bw/30`} absolute right-0`}>
        {children}
      </span>
    </div>
  );
}

function TbIcons({ i }: { i: number }) {
  return (
    <>
      {i == 1 ? (
        <RiShieldUserFill className={`size-5`} />
      ) : i == 2 ? (
        <TbClockHour4Filled className={`size-5`} />
      ) : i == 3 ? (
        <UserPen className={`size-5`} />
      ) : (
        <MdUpdate className={`mt-2 size-6`} />
      )}
    </>
  );
}
