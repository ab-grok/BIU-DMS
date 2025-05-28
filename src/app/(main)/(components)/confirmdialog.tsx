"use client";

import { useConfirmDialog } from "@/app/dialogcontext";
import UserTag from "@/components/usertag";
import React, { UIEvent } from "react";

export default function ConfirmDialog() {
  const { confirmDialog, setConfirmDialog } = useConfirmDialog();

  function handleClickOut(e: UIEvent<HTMLDivElement>) {
    const currId = (e.target as HTMLDivElement).id;
    if (e.currentTarget.id == currId) {
      setConfirmDialog((p) => ({ ...p, type: "" }));
    }
  }

  function handleYes() {
    if (confirmDialog.confirmFn) confirmDialog.confirmFn();
    setConfirmDialog((p) => ({ ...p, type: "", delFn: undefined }));
  }

  return (
    <div
      id="confirm dialog"
      onClick={(e) => handleClickOut(e)}
      className={`absolute z-7 flex h-[100%] w-full items-center justify-center backdrop-blur-md`}
    >
      <div
        className={`${confirmDialog.action == "delete" ? "ring-red-600/50" : "bg-main-bg/60"} bg-main-fg relative flex h-fit w-[90%] max-w-[30rem] flex-col items-center justify-center rounded-lg p-4 py-10 shadow-lg ring-2 backdrop-blur-md`}
      >
        <h1 className="text-md text-center font-normal sm:text-xl">
          Are you sure you want to{" "}
          <span
            className={`${confirmDialog.action == "delete" ? "text-red-500" : "text-green-500"} font-bold`}
          >
            {confirmDialog.action.toUpperCase()}
          </span>{" "}
          {" the " + confirmDialog.type + " "}
        </h1>
        <span className="flex gap-0.5">
          <UserTag
            name={confirmDialog.name}
            cap={25}
            className="bg-neutral-600"
          />
        </span>
        {confirmDialog.message && (
          <p className="sm:text-md text-bw text-sm">{confirmDialog.message}</p>
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
