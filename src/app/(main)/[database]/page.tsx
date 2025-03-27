"use client";
import { useParams, usePathname } from "next/navigation";
import { useSideContext } from "../layoutcontext";
import { Suspense, useEffect, useState } from "react";

export default function Database() {
  let params = useParams().database as string;
  const { setSidebarState } = useSideContext().context;

  useEffect(() => {
    setSidebarState((prev) => ({ ...prev, database: params }));
  }, []);

  return (
    <div className="bg-amber-400">this is the datab ddd sssase: {params}</div>
  );
}
