"use client";
import { useParams } from "next/navigation";
import { useSideContext } from "../layoutcontext";
import { Suspense, useEffect, useState } from "react";

export default function Database() {
  const params = useParams().database;
  const { setSidebarState } = useSideContext().context;
  setSidebarState((prev) => ({ ...prev, database: "something" }));

  return (
    <div className="bg-amber-400">this is the datab ddd sssase: {params}</div>
  );
}
