"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import signUpImage from "@/assets/images/biu_blue_round.png";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLoading } from "../dialogcontext";
import Loading from "@/components/loading";

export default function LayoutCall({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(0);
  const { isLoading, setIsLoading, authPath } = useLoading();

  useEffect(() => {
    !loaded && setIsLoading((p) => p + "authLogo,");
  }, []);

  const { theme, setTheme } = useTheme();

  return (
    <div className="border-bw/30 relative z-5 flex h-full max-h-[34rem] w-[98%] max-w-[29.5rem] items-center overflow-hidden rounded-[29px] bg-[#012463] sm:w-[99%] md:w-[99%] lg:max-w-[59rem]">
      <div
        className={`${authPath && "lg:translate-x-[100%]"} shadow-shadow-bw bg-main-fg relative left-0 z-1 h-full w-full flex-col overflow-hidden rounded-[25px] p-2 md:shadow-md lg:w-1/2`}
      >
        {" "}
        {children}
      </div>
      {/*-translate-x-[29.2rem] after form complete, dynamically render this*/}
      <div
        onClick={() => {
          setTheme(theme == "light" ? "dark" : "light");
        }}
        className={`${authPath && "lg:-translate-x-[100%]"} hidden h-full w-1/2 cursor-pointer items-center justify-center bg-[#012463] transition-all duration-600 ease-out lg:flex`}
      >
        <span>
          {isLoading.includes("authLogo") && <Loading />}
          <Image
            priority
            onLoad={() => {
              setLoaded(1);
              setIsLoading((p) => p.replace("authLogo,", ""));
            }}
            src={signUpImage}
            alt="Benson Idahosa Univesity Logo"
            className="h-auto w-auto object-contain duration-1000 ease-in-out select-none hover:animate-pulse"
          />
        </span>
      </div>
    </div>
  );
}
