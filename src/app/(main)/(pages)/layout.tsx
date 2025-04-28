"use client";
import { useSideContext } from "../layoutcontext";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/loading";
import { useLoading } from "@/app/layoutcall";
import RowHeader from "./databases/(components)/rowheader";
import SelectionContext from "./selectcontext";
import { usePathname } from "next/navigation";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarState, setSidebarState } = useSideContext().context;
  const { isLoading, setIsLoading } = useLoading();
  const path = usePathname();
  let showToolBar = path.slice(-9, path.length) != "databases";

  return (
    <SelectionContext>
      <div
        className={` ${sidebarState.route ? "scale-100" : "scale-0"} ${sidebarState.sbExpanded ? "md:max-w-[30%]" : "md:max-w-[84%]"} bg-main-bg absolute left-[18%] flex h-[40rem] max-h-screen w-full max-w-[78%] items-center justify-center rounded-[5px] shadow-xl shadow-black/50 transition-all duration-300 sm:left-[15%] lg:relative lg:left-[5%] lg:max-w-[71%] xl:max-w-[74%]`}
      >
        {" "}
        <div className="h-[99.8%] w-[99.8%] overflow-hidden rounded-[5px]">
          {isLoading.includes("databases") && <Loading />}
          <section
            className={`${showToolBar ? "flex" : "hidden"} bg-main-fg relative max-h-[3rem] min-h-[3rem]`}
          >
            toolbar: SelectAll (grayed until applicable) Edit mode{" "}
          </section>
          <Separator className="bg-main-bg w-99% h-2" />
          <section className="bg-main-fg relative h-[100%] w-full">
            {children}
          </section>
        </div>
      </div>
    </SelectionContext>
  );
}
