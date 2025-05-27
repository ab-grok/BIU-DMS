//can be called in the rootLayoutcall to precede child components, unless position:relative then use Layout
//a useContext fn must be created in the page its called, and then updated by child components.

"use client";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import logo from "@/assets/images/biu_blue_round.png";
import { useNotifyContext } from "@/app/dialogcontext";

type contextType = {
  notify: string;
  setNotify: Dispatch<SetStateAction<contextStateType>>;
};

type contextStateType = {
  message: string;
  danger: boolean;
  exitable: boolean;
};

export default function NotificationBar() {
  //get message from context
  const [msg, setMsg] = useState({
    start: false,
    msg: "",
    end: false,
  });
  const [exit, setExit] = useState(true);

  const { notify, setNotify } = useNotifyContext();
  const { message, danger, exitable } = notify;

  function exitEffect() {
    setTimeout(() => {
      setMsg((prev) => ({ ...prev, end: true }));
      setTimeout(() => {
        setMsg((prev) => ({ start: false, msg: "", end: false }));
        setNotify((prev) => ({ ...prev, message: "" })); //might need to delay this to prevent scaling  issue on repeat notifications,, use this value to set redirect
      }, 800);
    }, 100);
  }

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMsg((prev) => ({ ...prev, start: true }));
        setTimeout(() => {
          setMsg((prev) => ({ ...prev, msg: message, end: false }));
          if (!exitable) {
            setTimeout(() => {
              exitEffect();
            }, 5000);
          }
        }, 700);
      }, 1000);
      if (exitable) {
        setExit(true);
      }
    }
  }, [message]);

  return (
    <div
      className={`absolute top-2 z-10 flex max-w-full justify-center self-center ${msg.end ? "scale-50" : "scale-100"} transition-all delay-700 duration-200`}
    >
      <div
        className={` ${msg.start ? "animate-logo-pulse flex" : "hidden"} relative h-20 self-center ${msg.msg && !msg.end ? "w-full" : "w-20"} bg-main-fg items-center overflow-hidden rounded-full border-2 shadow-2xl shadow-black/50 backdrop-blur-2xl transition-all duration-[0.7s]`}
      >
        <Image
          src={logo}
          alt="Notification bar logo"
          className="relative left-0 h-20 w-20 object-contain p-[5px]"
        />
        <div
          className={`text-bw relative flex h-full w-full flex-col overflow-hidden p-0 pr-4 transition-all duration-[0s]`}
        >
          <div
            className={`relative top-4 h-8 w-full max-w-full overflow-hidden rounded-full px-2 leading-8 font-medium shadow-2xs ${danger ? "bg-red-600" : "bg-green-600"} `}
          >
            {msg.msg}
          </div>

          {exitable && (
            <div
              onMouseDown={() => exitEffect()}
              className="animate-logoExit absolute right-10 bottom-1 w-6 cursor-pointer rounded-2xl text-center underline drop-shadow-2xl transition-colors hover:scale-[1.1] hover:animate-none hover:underline"
            >
              {" "}
              Ok{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
