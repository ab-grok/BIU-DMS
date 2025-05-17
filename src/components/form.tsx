"use client";

import Link from "next/link";
import { useState } from "react";

export default function CustomForm({ refer }: { refer: string }) {
  const [buttonClicked, setButtonClicked] = useState(false);
  function entered() {
    setButtonClicked(true);
  }
  return (
    <div>
      <div className="scroll relative overflow-scroll">
        <div
          className={`relative h-[2rem] w-full max-w-[5rem] rounded-4xl border-2 bg-green-600 shadow-2xs not-hover:hidden hover:visible`}
        ></div>
        <Link
          onMouseOver={() => setButtonClicked(true)}
          onMouseLeave={() => setButtonClicked(false)}
          href={refer}
          className={`absolute top-[4px] left-[18px] flex h-[2rem] w-full max-w-[5rem] items-center justify-center rounded-4xl text-black ${buttonClicked ? "-translate-y-[1px] shadow-md shadow-slate-800" : "translate-0"} hover:bg-[#012463] hover:text-white hover:underline`}
        >
          {" "}
          Log in{" "}
        </Link>
      </div>
    </div>
  );
}
