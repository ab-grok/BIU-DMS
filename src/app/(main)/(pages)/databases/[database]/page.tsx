"use client";
import { useParams, usePathname } from "next/navigation";
import DbMain from "./(components)/dbmain";
import { Suspense, useEffect, useRef, useState } from "react";
import RowHeader from "../(components)/rowheader";
import TableCard from "./(components)/tbcard";
import { useRevalidate } from "@/lib/sessions";
import Loading from "@/components/loading";
import { useLoading, useNotifyContext } from "@/app/layoutcall";
import { Tb } from "@/lib/actions";

export default function Database() {
  let params = useParams()?.database as string;
  const [tbData, setTbData] = useState([] as Tb[] | null);
  const userId = useRef<string>("");
  const { isLoading, setIsLoading } = useLoading();
  const { setNotify, notify } = useNotifyContext();

  useEffect(() => {
    setIsLoading("," + params);
    (async () => {
      const nav = performance.getEntriesByType(
        "navigation",
      ) as PerformanceNavigationTiming[];
      if (nav.length > 0 && nav[0].type == "reload") useRevalidate("tables");

      const res = await fetch("/api/table?dbName=" + params);
      if (!res.ok) {
        setNotify({
          message: "Couldn't reach the server.",
          danger: true,
          exitable: true,
        });
        return;
      }

      setTbData(await res.json());
      console.log("got tb");
      setIsLoading(isLoading.replace("," + params, ""));
    })();

    return () => {
      console.log("revalidated tb");
    };
  }, []);

  //get tables: author, created at, lastUpdate, lastUpdated by, viewers, editors, rows
  return (
    <div className="relative flex h-full w-full flex-col">
      {isLoading.includes(params) && <Loading />}
      <section className="h-[92.5%] w-full overflow-y-auto">
        {tbData && tbData.map((a, i) => <TableCard Tb={a} i={i + 1} />)}
      </section>
    </div>
  );
}
