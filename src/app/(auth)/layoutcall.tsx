"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  Dispatch,
} from "react";
import Image from "next/image";
import signUpImage from "@/assets/images/biu_blue_round.png";
import { usePathname } from "next/navigation";
import { useLoading } from "../layoutcall";
import { useTheme } from "next-themes";

export default function LayoutCall({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [signUpPath, setSignUpPath] = useState<boolean>();

  useEffect(() => {
    if (pathname == "/signup") {
      setSignUpPath(true);
    } else if (pathname == "/login") {
      setSignUpPath(false);
    }
  }, [pathname]);

  const { theme, setTheme } = useTheme();

  return (
    <div className="z-5 flex h-full max-h-[34rem] w-full max-w-[29.5rem] items-center overflow-hidden rounded-[25px] bg-[#012463] shadow-2xl lg:max-w-[59rem]">
      <div
        className={`${!signUpPath && "lg:translate-x-[100%]"} shadow-shadow-bw bg-main-fg relative left-0 z-1 h-full w-full flex-col overflow-hidden rounded-2xl p-2 shadow-md lg:w-1/2`}
      >
        {" "}
        {children}
      </div>
      {/*-translate-x-[29.2rem] after form complete, dynamically render this*/}
      <div
        onClick={() => {
          setTheme(theme == "light" ? "dark" : "light");
        }}
        className={`${!signUpPath && "lg:-translate-x-[100%]"} hidden h-full w-1/2 cursor-pointer items-center justify-center bg-[#012463] transition-all duration-600 ease-out lg:flex`}
      >
        <Image
          src={signUpImage}
          alt="Benson Idahosa Univesity Logo"
          className="h-auto w-auto object-contain duration-1000 ease-in-out select-none hover:animate-pulse"
        />
      </div>
    </div>
  );
}
