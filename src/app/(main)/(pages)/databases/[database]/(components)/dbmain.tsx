"use client";
import {
  IoPencilSharp,
  IoPricetag,
  IoPricetags,
} from "react-icons/io5";

import { Separator } from "@/components/ui/separator";
import * as React from "react";
import StarUser from "@/components/icons/staruser";

export default function DbMain() {
  return (
    <div className="relative left-[5%] h-[80%] w-[90%] translate-y-[3%] bg-amber-400">
      <DbMainCard />
    </div>
  );
}

function DbMainCard(data: DbMainCard) {
  const [hovered, setHover] = React.useState(false);
  function handleHover() {
    setHover(true);
  }

  return (
    <div
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${!hovered ? "border-white/50 shadow-stone-800" : "border-white shadow-md shadow-stone-800"} relative h-full max-h-[15rem] min-h-[15rem] max-w-[15rem] min-w-[15rem] rounded-[70px] border-[1px] bg-cyan-500 from-cyan-500 to-blue-500 shadow-lg transition-all duration-75 hover:bg-linear-to-r sm:max-w-[28rem] sm:min-w-[28rem]`}
    >
      <section id="top" className="relative flex h-[30%]">
        <p className="relative top-1/2 left-[5%] flex h-1/2 items-center bg-amber-300 p-2 text-2xl sm:left-[10%]">
          {" "}
          Database name
        </p>
        {hovered ? (
          <IoPricetags className="absolute top-[2%] left-[45%] size-1/2 w-[10%] fill-cyan-800 stroke-3 shadow-black drop-shadow-2xl transition-all duration-100 hover:scale-[1.1] sm:top-1/2 sm:right-[5%] sm:left-auto sm:-translate-y-2" />
        ) : (
          <IoPricetag className="top[2%] absolute left-[45%] size-1/2 w-[10%] bg-gradient-to-r fill-stone-900 stroke-3 shadow-white drop-shadow-2xl sm:top-[40%] sm:right-[5%] sm:left-auto" />
        )}
      </section>
      <Separator className="bg-card-background" />
      <section
        id="bottom"
        className="relative flex h-[70%] min-h-[70%] overflow-hidden p-2"
      >
        <div
          id="description"
          className="relative hidden max-h-[100%] min-h-[100%] w-[60%] max-w-[50%] min-w-[60%] overflow-hidden rounded-bl-[60px] px-[2px] py-[6px] text-center font-serif text-sm text-black/80 italic sm:flex"
        >
          <div className={``}>
            {" "}
            <IoPencilSharp />{" "}
          </div>
          <p className="scrollbar-custom overflow-scroll px-2">
            This is a mistake. Here, we’ll refer to some time-honored
            typesetting conventions, with an emphasis on readability, and offer
            guidance on adapting them effectively for devices and screens. We’ll
            see that the ability to embed fonts with @font-face is not by itself
            a solution to all of our typographic challenges.
          </p>
        </div>
        <Separator
          className="bg-card-background hidden max-w-[0.5px] sm:flex"
          orientation="vertical"
        />
        <div
          id="user info"
          className="scrollbar-custom h-[90%] w-full cursor-pointer overflow-scroll rounded-4xl rounded-b-[60px] bg-slate-800/20 p-2 text-sm sm:h-full sm:min-w-[40%] sm:rounded-none sm:rounded-br-[65px]"
        >
          <div
            id="inner user info"
            className="relative flex flex-col space-y-[3%]"
          >
            <div id="username" className="relative flex">
              <div className="relative left-[0rem] flex w-full max-w-[5rem] min-w-[4rem] justify-center bg-purple-700 font-medium">
                <StarUser size={20} />
                <p>Creator:</p>
              </div>
              <p className="absolute left-[60%] min-w-[3rem] bg-red-500">
                xxxxx
              </p>
            </div>
            <Separator className="bg-card-background min-h-[1px] max-w-[70%]" />{" "}
            <div id="username" className="relative flex">
              <div className="relative left-[0rem] flex w-full max-w-[5rem] min-w-[4rem] justify-center bg-purple-700 font-medium">
                <p>Creator:</p>
              </div>
              <p className="absolute left-[60%] min-w-[3rem] bg-red-500">
                xxxxx
              </p>
            </div>
            <Separator className="bg-card-background min-h-[1px] max-w-[70%]" />{" "}
            <div id="username" className="relative flex">
              <div className="relative left-[0rem] flex w-full max-w-[5rem] min-w-[4rem] justify-center bg-purple-700 font-medium">
                <p>Creator:</p>
              </div>
              <p className="absolute left-[60%] min-w-[3rem] bg-red-500">
                xxxxx
              </p>
            </div>
            <Separator className="bg-card-background min-h-[1px] max-w-[70%]" />{" "}
            <div id="username" className="relative flex">
              <div className="relative left-[0rem] flex w-full max-w-[5rem] min-w-[4rem] justify-center bg-purple-700 font-medium">
                <p>Creator:</p>
              </div>
              <p className="absolute left-[60%] min-w-[3rem] bg-red-500">
                xxxxx
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type DbMainCard = {
  head?: string;
  body?: string;
  icon?: string;
};

//<GrUserAdmin /> for users with table access
