"use client";
import { useSideContext } from "../layoutcontext";
import { Separator } from "@/components/ui/separator";
import SelectionContext from "./selectcontext";
import { Toolbar } from "@/components/toolbar";
import FetchContext from "./fetchcontext";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sbState, setSbState } = useSideContext().context;

  return (
    <SelectionContext>
      <FetchContext>
        <div
          className={` ${sbState.route ? "scale-100" : "scale-0"} ${sbState.sbExpanded ? "" : ""} ring-main-bg absolute left-[18%] flex h-[40rem] max-h-screen w-full max-w-[80%] items-center justify-center rounded-[5px] shadow-lg ring-2 shadow-black transition-all duration-200 sm:left-[15%] lg:relative lg:left-[5%] lg:max-w-[71%] xl:max-w-[74%]`}
        >
          {" "}
          <div className="h-[99.8%] w-[99.8%] overflow-hidden rounded-[5px]">
            <header>
              <Toolbar />
            </header>
            <section className="bg-main-fg relative h-[100%] w-full">
              {children}
            </section>
          </div>
        </div>
      </FetchContext>
    </SelectionContext>
  );
}
