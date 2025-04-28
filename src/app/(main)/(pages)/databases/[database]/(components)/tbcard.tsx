"use client";
import { FaEye } from "react-icons/fa";
import { MdUpdate } from "react-icons/md";
import Index from "@/components";
import { TbClockHour4Filled } from "react-icons/tb";
import { RiShieldUserFill } from "react-icons/ri";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import {
  Divide,
  Edit,
  Key,
  KeyRound,
  LogIn,
  Timer,
  UserCheck,
  UserPen,
} from "lucide-react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Count from "@/components/count";
import { QuickActions } from "../../(components)/quickactions";
import Marker from "@/components/marker";
import { useSelection } from "../../../selectcontext";
import { useRouter } from "next/navigation";
import { Tb } from "@/lib/actions";

type tbType = {
  i: number;
  Tb: Tb;
};
export default function TableCard({ Tb, i }: tbType) {
  const router = useRouter();

  const [metaHover, setMetaHover] = useState(0);
  const [viewerHover, setViewerHover] = useState(0);
  const [editHover, setEditHover] = useState(0);
  const [cardClicked, setCardClick] = useState(false);
  const [viewerSel, setViewerSel] = useState("");
  const [editorSel, setEditorSel] = useState("");
  const [btnClicked, setBtnClicked] = useState("");
  const hoverTime = useRef<NodeJS.Timeout | undefined>(undefined);
  const { setSelectedUsers, selectedUsers, selectedTb, setSelectedTb } =
    useSelection();

  let userAllowed = false;

  useEffect(() => {
    for (let i = 0; i < Math.max(Tb.editors?.length, Tb.viewers?.length); i++) {
      if (Tb.viewers[i].id == "" || Tb.editors[i]) {
      }
    }
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
    const trigger = (e.target as HTMLElement).id;
    if (
      e.target == e.currentTarget ||
      trigger == "viewers" ||
      trigger == "editors"
    ) {
      setCardClick(!cardClicked);
    }
  }

  function handleViewerSel(a: string) {
    let user = a + "!?" + Tb.tbName + ",";
    setSelectedTb(Tb.tbName);
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.replace(user, ""));
    } else {
      setSelectedUsers(selectedUsers + user);
    }
  }

  function handleEditorSel(a: string) {
    let user = a + "?" + Tb.tbName + ",";
    setSelectedTb(Tb.tbName);
    if (editorSel.includes(user)) {
      setSelectedUsers(selectedUsers.replace(user, ""));
      setEditorSel(editorSel.replace(user, ""));
    } else {
      setEditorSel(editorSel + user);
      setSelectedUsers(selectedUsers + user);
    }
  }

  function handleTableSel(a: string) {
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
    if (a == "door") {
      router.push(`/databases${Tb.tbName}`);
    }
  }

  const items = ["Author", "Created on", "Last updated", "Editor"];
  const names = ["Jacobs", "Apr 14 25", "May 15 25", "Michael"];
  const views = [
    "Mr.jacobs",
    "Prof.Mark",
    "Dr.Wyatt",
    "Mr.Popenums",
    "Mr.jacobs",
  ];
  const edits = [
    "Mr.jacobs",
    "Prof.Mark",
    "Dr.Wyatt",
    "Mr.Popenums",
    "Mr.jacobs",
    "Prof.Mark",
    "Dr.Wyatt",
    "Mr.Popenums",
    "Mr.jacobs",
    "Prof.Mark",
    "Dr.Wyatt",
    "Mr.Popenums",
    "Mr.jacobs",
    "Prof.Mark",
    "Dr.Wyatt",
    "Mr.Popenums",
  ];

  return (
    <div
      className={`${i % 2 == 0 ? "bg-tb-row1" : "bg-tb-row1/50"} group flex min-h-[10rem] w-full min-w-fit`}
    >
      <Index i={i} className="h-[12.2rem] min-h-[11rem] self-center" />
      <div
        id="main"
        onClick={(e) => {
          handleCardClicked(e);
        }}
        className={`${selectedTb?.includes(Tb.tbName) && "ring-2 ring-blue-700/40"} bg-tb-row2 border-main-bg/50 items-center-2 m-2 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-xs ring-blue-700/20 hover:ring-2`}
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
              className="group/enter flex h-full w-1/3 cursor-pointer items-center justify-end pr-3"
            >
              <LogIn
                className={`${btnClicked == "door" ? "scale-[0.97]" : ""} stroke-bw/60 hidden group-hover:flex group-hover/enter:stroke-green-600`}
              />
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
              {names.map((a, i) => {
                return (
                  <UserTag
                    key={i}
                    name={a}
                    className={`${i < 2 ? "bg-green-600/70" : "bg-amber-600/70"} text-xs`}
                  />
                );
              })}
            </div>
          </div>
        </section>
        <Separator orientation="vertical" className="bg-main-bg/10" />
        <section
          className={`hidden max-h-fit min-w-[20rem] justify-center gap-x-[1%] md:flex`}
        >
          <div
            id="viewers"
            className={` ${cardClicked ? `max-h-full` : "max-h-[10rem]"} min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              id="viewers"
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 font-normal select-none"
            >
              Viewers
              <FaEye className="size-6 stroke-pink-800 opacity-80" />
            </div>
            <div className="bg-bw/10 relative flex min-h-[7.7rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {Tb.viewers ? (
                Tb.viewers.map((a, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setViewerHover(i + 1)}
                    onMouseLeave={() => setViewerHover(0)}
                    className="relative flex h-fit cursor-pointer items-center gap-0.5"
                  >
                    <span onClick={() => handleViewerSel(a.id)}>
                      <Index
                        size={4}
                        i={i + 1}
                        className="bg-transparent text-xs"
                        hover={viewerHover}
                      />
                    </span>
                    <UserTag
                      name={"jogddfffffffffdddddddddh"}
                      title="prof."
                      className="w-fit justify-start text-xs font-normal"
                      hovered={viewerHover}
                      n={i + 1}
                      cap={5}
                    />
                    <span
                      onClick={() => handleViewerSel(a.id)}
                      className="absolute right-[2rem] flex h-fit w-[15%] items-center justify-center bg-white py-1"
                    >
                      <Marker
                        hovered={viewerHover}
                        context={selectedUsers}
                        id={a.id}
                        n={i + 1}
                      />
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative top-1/2 self-center text-xs font-light italic">
                  {" "}
                  No viewers yet{" "}
                </div>
              )}
            </div>
          </div>
          <Separator orientation="vertical" className="bg-main-bg/10" />
          <div
            id="editors"
            className={`${cardClicked ? `max-h-full` : "max-h-[10rem]"} min-w-[48%] space-y-0.5 overflow-hidden transition-all`}
          >
            <div
              title="Click to expand"
              id="editors"
              className="text-bw/70 flex min-h-[2rem] w-full cursor-pointer items-center justify-center gap-x-2 text-sm font-medium select-none"
            >
              Editors
              <Edit className="stroke-bw/50 fill-red-900/70" />
            </div>
            <div className="bg-bw/10 relative flex min-h-[7.7rem] max-w-[10rem] flex-col justify-center gap-y-2 overflow-hidden rounded-2xl p-1 shadow-2xs">
              {Tb.editors ? (
                Tb.editors.map((a, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setEditHover(i + 1)}
                    onMouseLeave={() => setEditHover(0)}
                    className="flex h-fit cursor-pointer items-center gap-0.5"
                  >
                    {" "}
                    <span onClick={() => handleEditorSel(a.id)}>
                      <Index
                        size={4}
                        i={i + 1}
                        className="bg-transparent text-xs"
                        hover={editHover}
                      />
                    </span>
                    <UserTag
                      name={a.username || a.firstname}
                      title={!a.username ? a.title : ""}
                      className="w-fit justify-start text-xs font-normal"
                      hovered={editHover}
                      n={i + 1}
                    />
                    <span
                      onClick={() => handleEditorSel(a.id)}
                      className="absolute right-2.5 flex h-fit w-[15%] items-center justify-center py-1"
                    >
                      <Marker
                        hovered={editHover}
                        context={selectedUsers}
                        id={a.id}
                        n={i + 1}
                      />
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative top-1/2 self-center text-xs font-light italic">
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

  let iconColor =
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
