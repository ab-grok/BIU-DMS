"use client";

import { CircleCheckBigIcon, Settings2, Trash2, UserPlus2 } from "lucide-react";
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
  const actions = [action1, action2, action3, action4].filter(Boolean);
  // const g = [["group/a"]["group/a"], ["group/b"]["group/b"], ["group/c"]["group/c"], ["group/d"]["group/d"],];

  const hC = [
    hoverColor1 &&
      action1 &&
      `hover:stroke-${hoverColor1}-600/70 hover:text-${hoverColor1}-600`,
    hoverColor2 &&
      action2 &&
      `hover:stroke-${hoverColor2}-600/70 hover:text-${hoverColor2}-600`,
    hoverColor3 &&
      action3 &&
      `hover:stroke-${hoverColor3}-600/70 hover:text-${hoverColor3}-600`,
    hoverColor4 &&
      action4 &&
      `hover:stroke-${hoverColor4}-600/70 hover:text-${hoverColor4}-600`,
  ].filter(Boolean);

  return (
    <div
      title="Quick actions"
      className={`${hide && "hidden"} text-bw bg-sub-bg/30 border-main-bg/20 hover:bg-sub-bg sticky right-0 ml-2 flex h-full min-h-[5rem] w-[8rem] cursor-pointer flex-col justify-center gap-y-2 border-l-2 p-1 text-xs opacity-0 backdrop-blur-lg group-hover:opacity-100`}
    >
      {actions.map((a, i) => (
        <div
          key={i}
          onClick={() => handleClicked(i + 1)}
          className={` ${button == i + 1 ? "scale-95" : ""} ${hC[i] || "hover:text-black"} group hover:bg-bw/50 shadow-shadow-bw flex w-full items-center space-x-1 rounded-full px-1 hover:font-semibold hover:shadow-sm`}
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
  | "Request edit";

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
  hoverColor1?: string;
  hoverColor2?: string;
  hoverColor3?: string;
  hoverColor4?: string;
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
        <Settings2 size={17} />
      ) : name == "Select" ? (
        <CircleCheckBigIcon size={17} />
      ) : null}
    </>
  );
}
