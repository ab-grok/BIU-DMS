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
import { useNotifyContext } from "@/app/dialogcontext";
import { getUserAccess } from "@/lib/server";

type tbType = {
  i: number;
  Tb: Tb;
  uid: string;
  db: string;
};
export default function TableCard({ Tb, i, uid, db }: tbType) {
  const router = useRouter();

  const { pressAnim, setPressAnim } = useButtonAnim();
  const [uAccess, setUAccess] = useState({ edit: false, view: false });
  type userType = { id: string; ttl: string; fname: string }[];

  const [viewers, setViewers] = useState([] as userType);
  const [editors, setEditors] = useState([] as userType);

  const [metaHover, setMetaHover] = useState(0);
  const [viewersHover, setViewersHover] = useState(0);
  const [editorsHover, setEditorsHover] = useState(0);
  const [cardExpand, setCardExpand] = useState(false);
  const [btnClicked, setBtnClicked] = useState("");
  const [expandUsers, setExpandusers] = useState("");
  const hoverTime = useRef<NodeJS.Timeout | undefined>(undefined);
  const { setNotify } = useNotifyContext();
  const { setSelectedTbUsers, selectedTbUsers, selectedTb, setSelectedTb } =
    useSelection();

  useEffect(() => {
    // console.log("u from tbcard: ", u);
    (async () => {
      Tb.viewers?.forEach((a) => {
        if (a.includes(uid)) setUAccess({ view: true, edit: false });
        const u = a?.split("&");
        setViewers((p) => {
          return [...p, { id: u[0], ttl: u[0], fname: u[0] }].filter(Boolean);
        });
      });
      Tb.editors?.forEach((a) => {
        if (a.includes(uid)) setUAccess({ view: true, edit: true });
        const u = a?.split("&");
        setEditors((p) => {
          return [...p, { id: u[0], ttl: u[0], fname: u[0] }].filter(Boolean);
        });
      });

      if (Tb.createdBy?.includes(uid)) setUAccess({ edit: true, view: true });
    })();
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
    selectedTb != Tb.tbName && setSelectedTb(Tb.tbName);
    const trigger = (e.target as HTMLElement).id;
    if (
      e.target == e.currentTarget ||
      trigger == "viewers" ||
      trigger == "editors"
    ) {
      Tb.tbName == selectedTb && setCardExpand(!cardExpand);
    }
  }

  //replacing a user (complex): sameTable - userid1?db1/tb1, userid2?db1/tb1. otherTable - userid1?db2/tb2
  function handleViewerSel(id: string) {
    const user = `${id}?${db}/${Tb.tbName},`;
    setSelectedTb(Tb.tbName);
    if (selectedTbUsers.viewers.includes(user)) {
      setSelectedTbUsers((p) => ({
        ...p,
        viewers: p.viewers.replace(user, ""),
      }));
    } else {
      setSelectedTbUsers((p) => ({ ...p, viewers: p.viewers + user }));
    }
  }

  function handleEditorSel(id: string) {
    const user = `${id}?${db}/${Tb.tbName},`;
    setSelectedTb(Tb.tbName);
    if (selectedTbUsers.editors.includes(user)) {
      setSelectedTbUsers((p) => ({
        ...p,
        editors: p.editors.replace(user, ""),
      }));
    } else {
      setSelectedTbUsers((p) => ({ ...p, editors: p.editors + user }));
    }

    // let user1 = id + "?" + Tb.tbName + ",";
    // setSelectedTb(Tb.tbName);
    // if (selectedTbUsers.includes(user)) {
    //   setSelectedTbUsers(selectedTbUsers.replace(user, ""));
    //   // setEditorSel(editorSel.replace(user, ""));
    // } else {
    //   // setEditorSel(editorSel + user);
    //   setSelectedTbUsers(selectedTbUsers + user);
    // }
  }

  function handleMultiTables(a: string) {
    if (selectedTb.includes(a)) {
      setSelectedTb(selectedTb.replace(a + ",", ""));
    } else {
      setSelectedTb(selectedTb + a + ",");
    }
  }

  function handleEnter(a: string) {
    setBtnClicked(a);
    setTimeout(() => {
      setBtnClicked("");
    }, 60);
    if (a == "door" && (uAccess.view || uAccess.edit)) {
      router.push(`/databases/${db}/${Tb.tbName}`);
    } else {
      setNotify({
        message: "Access Denied!",
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

  function dateAbrev(d: Date) {
    console.log("type of date in dateAbrev: ", typeof d);
    const date = d || new Date();
    const dateStr = date.toLocaleDateString("en-US", {
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
      className={`${i % 2 == 0 ? "bg-tb-row1" : "bg-tb-row1/50"} group relative flex min-h-[10rem] w-full min-w-fit transition-all`}
    >
      <Index
        i={i}
        className="group-hover:bg-sub-grad-forced sticky h-[11.2rem] self-center"
      />
      <div
        id="main"
        onClick={(e) => {
          handleCardClicked(e);
        }}
        className={`${selectedTb?.includes(Tb.tbName) && "ring-2 ring-blue-700/40"} bg-tb-row1 border-main-bg/50 items-center-2 m-2 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-xs ring-blue-700/20 hover:ring-2`}
      >
        <section
          id="table"
          className={`flex min-w-[15rem] flex-col items-center gap-y-0.5`}
        >
          <header
            title={Tb.tbName}
            className="flex min-h-[3rem] w-[15rem] cursor-default justify-between pr-1"
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
              className={`${selectedTb.includes(Tb.tbName) ? "flex" : "hidden group-hover:flex"} group/enter h-full w-1/3 cursor-pointer items-center justify-end pr-3`}
            >
              {!(uAccess.view || uAccess.edit) ? (
                <LockIcon
                  className={`${btnClicked == "door" ? "scale-[0.97]" : ""} stroke-red-900 stroke-3 duration-50 group-hover/enter:stroke-red-600 hover:scale-105`}
                />
              ) : (
                <KeyRound
                  className={`${btnClicked == "door" ? "scale-[0.97]" : ""} stroke-bw/60 group-hover/enter:stroke-green-600`}
                />
              )}
            </div>
          </header>
          <div
            id="Table meta"
            className="bg-bw/10 flex h-fit min-h-[6rem] w-full gap-x-[1%] rounded-2xl p-1 shadow-sm"
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
                    name={TbMeta[i][0] || i == 0 ? "Admin" : ""}
                    title={TbMeta[i][1]}
                    className={`${i < 2 ? "bg-green-600/70" : "bg-amber-600/70"} text-xs`}
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
            <div className="bg-bw/10 relative flex h-[7.6rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {viewers ? (
                viewers.map((a, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setViewersHover(i + 1)}
                    onMouseLeave={() => setViewersHover(0)}
                    className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
                  >
                    {" "}
                    <span onClick={() => handleViewerSel(a.id)}>
                      <Index
                        size={4}
                        i={i + 1}
                        className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                        hovered={viewersHover}
                      />
                    </span>
                    <UserTag
                      name={a.fname}
                      title={a.ttl}
                      className="w-fit justify-start text-xs font-normal"
                      hovered={viewersHover}
                      n={i + 1}
                    />
                    <span
                      onClick={() => handleViewerSel(a.id)}
                      className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1"
                    >
                      <Marker
                        hovered={viewersHover}
                        selected={selectedTbUsers.viewers}
                        path={db + "/" + Tb.tbName}
                        id={a.id}
                        n={i + 1}
                      />
                    </span>
                  </div>
                ))
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
                  className={`stroke-bw/50 ${selectedTb.includes(Tb.tbName) ? "fill-red-900/80" : ""}`}
                />
              )}
            </div>
            <div className="bg-bw/10 relative flex h-[7.6rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {editors ? (
                editors.map((a, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setEditorsHover(i + 1)}
                    onMouseLeave={() => setEditorsHover(0)}
                    className="relative flex h-fit cursor-pointer gap-0.5 pl-[1.5rem]"
                  >
                    {" "}
                    <span onClick={() => handleEditorSel(a.id)}>
                      <Index
                        size={4}
                        i={i + 1}
                        className="w-fit bg-transparent text-[10px] backdrop-blur-none"
                        hovered={editorsHover}
                      />
                    </span>
                    <UserTag
                      name={a.fname}
                      title={a.ttl}
                      className="w-fit justify-start text-xs font-normal"
                      hovered={editorsHover}
                      n={i + 1}
                    />
                    <span
                      onClick={() => handleEditorSel(a.id)}
                      className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1"
                    >
                      <Marker
                        hovered={editorsHover}
                        selected={selectedTbUsers.editors}
                        path={db + "/" + Tb.tbName}
                        id={a.id}
                        n={i + 1}
                      />
                    </span>
                  </div>
                ))
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
        <QuickActions
          action1="Select"
          action2="Add viewer"
          action3="Add editor"
          action4="Delete"
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
