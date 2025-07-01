"use client";
import { FaBuysellads } from "react-icons/fa";
import { FaBitcoinSign, FaBloggerB } from "react-icons/fa6";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useNotifyContext } from "../dialogcontext";
import { useSearchParams } from "next/navigation";
import { validateSession } from "@/lib/sessions";
import { useSideContext } from "./layoutcontext";
import tagLogo from "@/assets/images/tag_logo.png";

export default function MainPage() {
  const { showTag, setShowTag } = useSideContext().context;
  const sT = useRef<NodeJS.Timeout | undefined>(undefined);
  const [tg1, setTg1] = useState(false);
  const [tg2, setTg2] = useState(false);
  const [tg3, setTg3] = useState(false);
  const [tg4, setTg4] = useState(false);

  useEffect(() => {
    console.log("in main useEffect, showTag: ", showTag);
    console.log("in main useEffect, sT.current: ", sT.current);
    if (showTag) {
      sT.current = setTimeout(() => {
        setTg1(true);
        sT.current = setTimeout(() => {
          setTg2(true);
          sT.current = setTimeout(() => {
            setTg3(true);
            sT.current = setTimeout(() => {
              setTg4(true);
              sT.current = setTimeout(() => {
                setShowTag(false);
                setTg1(false);
                setTg2(false);
                setTg3(false);
                setTg4(false);
                sT.current = undefined;
              }, 6000);
            }, 2000);
          }, 1000);
        }, 1000);
      }, 2000);
    } else {
      sT.current = undefined;
    }
  }, [showTag]);

  //notify on important notification but searchParams persistent. so set counter for notify
  // const { setNotify } = useNotifyContext();
  // const signed = useSearchParams().get("signed");
  // useEffect(() => {
  //   if (signed) {
  //     (async () => {
  //       const user = await validateSession();
  //       if (user) {
  //         setNotify({
  //           message: `Welcome ${user.title}${user.firstname}`,
  //           danger: false,
  //           exitable: false,
  //         });
  //       }
  //     })();
  //   }
  // }, []);

  return (
    <div className="absolute right-1 bottom-0">
      <main
        className={` ${showTag ? "flex" : "hidden"} bg-gradient text-main-bg flex w-fit items-center justify-center space-x-1 rounded-full bg-radial from-blue-900/20 via-blue-600/10 to-blue-50/0 p-2 pt-2 pl-2.5 transition-all`}
      >
        <div className="flex">
          <div className={`mt-0.5 flex`}>
            {" "}
            <FaBuysellads
              className={` ${tg1 ? "rotate-0 shadow-xs" : "translate-x-[10rem] -rotate-25 opacity-0"} ${showTag ? "flex" : "hidden"} transition-all`}
            />
            <FaBloggerB
              className={` ${tg2 ? "rotate-0 shadow-xs" : "translate-x-[10rem] -rotate-25 opacity-0"} ${showTag ? "flex" : "hidden"} transition-all`}
            />
          </div>
          <div
            className={` ${tg3 ? "animate-pulse" : "translate-y-[5rem] scale-110"} ${showTag ? "flex" : "hidden"} ml-0.2 mt-[0.00rem] flex transition-all`}
          >
            {tg1 && tg2 && "."} <span>Grok</span>
          </div>
        </div>
        <Image
          src={tagLogo}
          className={` ${tg4 ? "" : "scale-0"} size-6 object-contain transition-all`}
          alt="creator"
        />
      </main>
    </div>
  );
}
