import React from "react";

export default function Navbar() {
  return (
    <div className="absolute top-0 z-5 flex h-[3rem] w-[90%] flex-wrap items-center justify-between self-center rounded-[5px] bg-white">
      <div className="flex-none"> logo far right</div>
      <div className=""> search bar w-dynamic</div>
      <div className="h-full flex-none bg-indigo-500"> right components</div>
    </div>
  );
}
