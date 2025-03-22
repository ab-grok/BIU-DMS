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
import Loading from "@/components/loading";

type loadingType = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};
export const loadingContext = createContext({} as loadingType);

export function useLoading() {
  const context = useContext(loadingContext);
  return context;
}

export default function LayoutCall({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [signUpPath, setSignUpPath] = useState(true);

  useEffect(() => {
    if (pathname == "/signup") {
      setSignUpPath(true);
    } else if (pathname == "/login") {
      setSignUpPath(false);
    }
  }, [pathname]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <loadingContext.Provider value={{ isLoading, setIsLoading }}>
      <div className="z-5 flex h-full max-h-[34rem] w-full max-w-[29.5rem] items-center overflow-hidden rounded-[25px] bg-[#012463] shadow-2xl lg:max-w-[59rem]">
        <div
          className={`${!signUpPath && "lg:translate-x-[100%]"} relative left-0 z-1 h-full w-full flex-col rounded-2xl bg-stone-300 p-2 transition-all duration-100 lg:w-1/2`}
        >
          {" "}
          {isLoading && <Loading />}
          {children}
        </div>
        {/*-translate-x-[29.2rem] after form complete, dynamically render this*/}
        <div
          className={`${!signUpPath && "lg:-translate-x-[100%]"} hidden h-full w-1/2 items-center justify-center bg-[#012463] text-white transition-all duration-400 lg:flex`}
        >
          <Image
            src={signUpImage}
            alt="Benson Idahosa Univesity Logo"
            className="pointer-events-none h-auto w-auto object-contain select-none"
          />
        </div>
      </div>
    </loadingContext.Provider>
  );
}
