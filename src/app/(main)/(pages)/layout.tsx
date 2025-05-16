"use client";
import { useSideContext } from "../layoutcontext";
import { Separator } from "@/components/ui/separator";
import SelectionContext from "./selectcontext";
import { Toolbar } from "@/components/toolbar";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarState, setSidebarState } = useSideContext().context;

  return (
    <SelectionContext>
      <div
        className={` ${sidebarState.route ? "scale-100" : "scale-0"} ${sidebarState.sbExpanded ? "" : ""} bg-main-bg absolute left-[18%] flex h-[40rem] max-h-screen w-full max-w-[80%] items-center justify-center rounded-[5px] shadow-lg shadow-black transition-all duration-200 sm:left-[15%] lg:relative lg:left-[5%] lg:max-w-[71%] xl:max-w-[74%]`}
      >
        {" "}
        <div className="ring-main-bg/50 h-[99.8%] w-[99.8%] overflow-hidden rounded-[5px] ring-2">
          <header>
            <Toolbar />
          </header>
          <Separator className="bg-main-bg w-99% h-2" />
          <section className="bg-main-fg relative h-[100%] w-full">
            {children}
          </section>
        </div>
      </div>
    </SelectionContext>
  );
}
