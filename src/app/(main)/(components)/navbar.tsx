"use client";
import React from "react";
import { VscTools } from "react-icons/vsc";
import { IoBulb, IoBulbSharp, IoReloadCircleOutline } from "react-icons/io5";
import { useTheme } from "next-themes";
import { GalleryHorizontal, Menu, RectangleEllipsis } from "lucide-react";
import { useSideContext } from "../layoutcontext";
import logo from "@/assets/images/biu_blue_round.png";
import Image from "next/image";
import SearchBar from "@/components/searchbar";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { setSbState, sbState, showToolbar, setShowToolbar } =
    useSideContext().context;
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  function menuClicked() {
    setSbState((prev) => ({
      ...prev,
      sbExpanded:
        typeof sbState.sbExpanded == "boolean" ? !sbState.sbExpanded : false,
    }));
  }
  function handleReload() {
    //getpath and revalidate
    router.refresh();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 4000);
  }

  function switchMode() {
    theme == "light" ? setTheme("dark") : setTheme("light");
  }

  return (
    <div className="bg-nav-grad ring-main-bg/60 absolute top-0.5 z-5 ml-[1rem] flex h-[3rem] w-[90%] flex-none items-center justify-between gap-1 self-center overflow-hidden rounded-[5px] shadow-lg ring-2 shadow-black">
      <div className="bg-bw/10 flex h-full w-1/3 flex-none items-center rounded-xs px-1">
        {" "}
        <span
          onClick={menuClicked}
          title="Menu"
          className="group/menu stroke-mainbg flex h-[3rem] w-[3rem] cursor-pointer items-center justify-center lg:hidden"
        >
          <Menu
            className={` ${sbState.sbExpanded ? "scale-x-125" : "scale-x-90"} size-6 rounded-xl transition-all group-hover/menu:shadow-md`}
          />
        </span>
        <span className="bg-main-fg/50 flex size-11 flex-none items-center justify-center rounded-full">
          <Image src={logo} alt="Logo" className={`size-10`} />
        </span>
        <span className="text-main-bg ml-1 hidden text-xl font-bold select-none sm:flex">
          {" "}
          BIU DMS{" "}
        </span>
      </div>
      <div className="z-6 w-1/3 flex-none px-3">
        {" "}
        <SearchBar placeholder="database, table or field " />
      </div>
      <section className="bg3-bw/10 flex h-full w-[10rem] min-w-fit items-center justify-end gap-0.5 px-2">
        {" "}
        <div
          onClick={() => setShowToolbar((p) => !p)}
          title={`${showToolbar ? "Hide Toolbar" : "Show Toolbar"}`}
          className={` ${showToolbar ? "from-bw/40 to-stone-300" : "from-bw/20 to-stone-300/50"} group/t shadow-bw hover:to-bw/60 flex size-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-b hover:shadow-xs`}
        >
          <VscTools
            size={25}
            className={`fill-black/80 transition-all group-hover/t:fill-black`}
          />
        </div>
        <div
          onClick={() => handleReload()}
          title="Reload"
          className="group/r shadow-bw from-bw/40 hover:to-bw/60 flex size-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-b to-stone-300 hover:shadow-xs"
        >
          <IoReloadCircleOutline
            size={25}
            className={`${refreshing ? "animate-spin fill-green-600/80 stroke-black" : "fill-black group-hover/r:fill-black/80"} stroke-theme/80 transition-all`}
          />
        </div>
        <div
          onClick={() => switchMode()}
          title="Theme"
          className="group/tm shadow-bw from-bw/40 hover:to-bw/60 flex size-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-b to-stone-300 hover:shadow-xs"
        >
          {theme == "light" ? (
            <IoBulb
              title="Light mode"
              size={25}
              className="fill-amber-500 stroke-amber-300 group-hover/tm:fill-amber-300"
            />
          ) : (
            <IoBulbSharp
              title="Dark Mode"
              size={25}
              className="fill-neutral-800 stroke-neutral-500 group-hover/tm:fill-black"
            />
          )}
        </div>
      </section>
    </div>
  );
}
