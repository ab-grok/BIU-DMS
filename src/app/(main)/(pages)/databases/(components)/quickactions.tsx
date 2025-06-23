"use client";

import {
  CircleCheckBigIcon,
  FileKey2,
  FilePen,
  PencilLine,
  Settings2,
  Trash2,
  UserPlus2,
} from "lucide-react";
import { useState } from "react";

export function QuickActions({
  fn1,
  fn2,
  fn3,
  fn4,
  hide,
  action1,
  action2,
  action3,
  action4,
  hoverColor1,
  hoverColor2,
  hoverColor3,
  hoverColor4,
}: quickActions) {
  const [button, setButton] = useState(0);
  function handleClicked(i: number) {
    if (i == 1) {
      fn1 && fn1();
    } else if (i == 2) {
      fn2 && fn2();
    } else if (i == 3) {
      fn3 && fn3();
    } else if (i == 4) {
      fn4 && fn4();
    }
    setButton(i);
    setTimeout(() => {
      setButton(0);
    }, 60);
  }
  const actions = [action1, action2, action3, action4];
  // const g = [["group/a"]["group/a"], ["group/b"]["group/b"], ["group/c"]["group/c"], ["group/d"]["group/d"],];

  const cs = [
    `hover:stroke-red-600/70 hover:text-red-600`,
    `hover:stroke-blue-600/70 hover:text-blue-600`,
    `hover:stroke-green-600/70 hover:text-green-600`,
    `hover:stroke-brown-600/70 hover:text-brown-600`,
    `hover:stroke-stone-600/70 hover:text-stone-600`,
  ];
  const c = ["red", "blue", "green", "brown", "stone"];
  const hc = [
    action1 && hoverColor1 && cs[c.indexOf(hoverColor1)],
    action2 && hoverColor2 && cs[c.indexOf(hoverColor2)],
    action3 && hoverColor3 && cs[c.indexOf(hoverColor3)],
    action4 && hoverColor4 && cs[c.indexOf(hoverColor4)],
  ];

  // console.log("quickActions, actions: ", actions);
  // console.log("quickActions, hC: ", hC);
  return (
    <div
      title="Quick actions"
      className={`${hide && "hidden"} text-bw bg-sub-bg/30 border-main-bg/20 hover:bg-sub-bg sticky right-0 ml-2 flex h-full min-h-[5rem] w-[8rem] cursor-pointer flex-col justify-center gap-y-1 border-l-2 p-1 text-xs opacity-0 backdrop-blur-lg group-hover:opacity-100`}
    >
      {actions.map((a, i) => (
        <div
          key={i}
          onClick={() => handleClicked(i + 1)}
          className={` ${!actions[i] && "hidden"} ${button == i + 1 ? "scale-95" : ""} ${hc[i] || "hover:text-black"} group hover:bg-bw/50 shadow-shadow-bw flex h-[1.5rem] w-full items-center space-x-1 rounded-full px-1 hover:font-semibold hover:shadow-sm`}
        >
          <QuickIcons name={actions[i] as string} />
          <span className={`transition-all group-hover:translate-x-0.5`}>
            {actions[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

type action =
  | ""
  | "Delete"
  | "Add viewer"
  | "More actions"
  | "Add editor"
  | "Select"
  | "Request view"
  | "Request edit"
  | "Edit mode";

type quickActions = {
  fn1?: () => void;
  fn2?: () => void;
  fn3?: () => void;
  fn4?: () => void;
  hide?: boolean;
  action1: action;
  action2?: action;
  action3?: action;
  action4?: action;
  hoverColor1?: "red" | "blue" | "green" | "brown" | "stone";
  hoverColor2?: "red" | "blue" | "green" | "brown" | "stone";
  hoverColor3?: "red" | "blue" | "green" | "brown" | "stone";
  hoverColor4?: "red" | "blue" | "green" | "brown" | "stone";
};

function QuickIcons({ name }: { name: string }) {
  return (
    <>
      {name == "Delete" ? (
        <Trash2 size={17} />
      ) : name == "Add viewer" ? (
        <UserPlus2 size={17} />
      ) : name == "More Actions" ? (
        <Settings2 size={17} />
      ) : name == "Add editor" ? (
        <FileKey2 size={17} />
      ) : name == "Select" ? (
        <CircleCheckBigIcon size={17} />
      ) : name == "Edit mode" ? (
        <FilePen size={17} />
      ) : name == "Request edit" ? (
        <PencilLine size={17} />
      ) : null}
    </>
  );
}
