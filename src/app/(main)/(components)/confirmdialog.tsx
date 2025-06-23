"use client";

import { useConfirmDialog } from "@/app/dialogcontext";
import UserTag from "@/components/usertag";
import React, { UIEvent } from "react";

export default function ConfirmDialog() {
  const { confirmDialog, setConfirmDialog } = useConfirmDialog();

  function clickedOut(e: UIEvent<HTMLDivElement>) {
    const currId = (e.target as HTMLDivElement).id;
    if (e.currentTarget.id == currId) {
      setConfirmDialog((p) => ({ ...p, type: "" }));
    }
  }

  function handleYes() {
    if (confirmDialog.confirmFn) confirmDialog.confirmFn();
    setConfirmDialog((p) => ({ ...p, type: "", delFn: undefined }));
  }

  function useThe() {
    const theTypes = ["unique", "primary"];
    return !theTypes.includes(confirmDialog.action);
  }

  return (
    <div
      id="confirm dialog"
      onClick={(e) => clickedOut(e)}
      className={`absolute z-7 flex h-[100%] w-full items-center justify-center backdrop-blur-md`}
    >
      <div
        className={`${confirmDialog.action == "delete" ? "ring-red-600/50" : "bg-main-bg/60"} bg-main-fg relative flex h-fit w-[90%] max-w-[30rem] flex-col items-center justify-center space-y-0.5 rounded-lg p-4 py-10 shadow-lg ring-2 backdrop-blur-md`}
      >
        <h1 className="text-md text-center font-normal sm:text-xl">
          {confirmDialog.head}
          <span
            className={`${confirmDialog.action == "delete" ? "text-red-500" : "text-green-500"} font-bold`}
          >
            {confirmDialog.action.toUpperCase()}
          </span>{" "}
          {(useThe() && " the ") + confirmDialog.type + " "}
        </h1>
        <span className="flex gap-0.5">
          <UserTag
            name={confirmDialog.name}
            cap={25}
            className={`${confirmDialog.type == "database" ? "bg-purple-600/70" : confirmDialog.type == "table" ? "bg-blue-600/70" : "bg-cyan-600/70"}`}
          />
        </span>
        {confirmDialog.message1 && (
          <p className="text-bw/80 flex justify-center text-sm sm:text-[10px]">
            {confirmDialog.message1}
          </p>
        )}
        {confirmDialog.message2 && (
          <p className="text-bw flex justify-center text-sm sm:text-[12px]">
            {confirmDialog.message2}
          </p>
        )}

        <div className="mt-4 flex">
          <button
            onClick={() => {
              handleYes();
            }}
            className={`${confirmDialog.action == "delete" ? "bg-red-300 hover:bg-red-600" : "bg-green-300 hover:bg-green-600"} text-bw rounded-l-full px-4 py-2`}
          >
            Yes
          </button>
          <button
            onClick={() =>
              setConfirmDialog((p) => ({ ...p, type: "", delFn: undefined }))
            }
            className="text-bw rounded-r-full bg-gray-700 px-4 py-2 hover:bg-gray-900"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
