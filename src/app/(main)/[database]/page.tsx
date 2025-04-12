"use client";
import { useParams, usePathname } from "next/navigation";
import { useSideContext } from "../layoutcontext";
import DbMain from "./(components)/dbmain";
import { Suspense, useEffect, useState } from "react";

export default function Database() {
  let params = useParams().database as string;
  const { setSidebarState } = useSideContext().context;

  useEffect(() => {
    setSidebarState((prev) => ({ ...prev, database: params }));
  }, []);

  return (
    <div className="relative flex h-full w-full bg-red-400">
      <DbMain />
    </div>
  );
}
