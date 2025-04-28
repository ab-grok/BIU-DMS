"use client";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import { cn } from "@/lib/utils";
import { RowItem } from "./rowitems";
import { QuickActions } from "./quickactions";
import { db } from "../../actions";
import { Hexagon, LogIn } from "lucide-react";
import Index from "@/components";
import Count from "@/components/count";

export default function Row({ db, i }: { db: db; i: number }) {
  return (
    <div
      className={`group flex min-h-[5rem] w-full min-w-fit flex-none items-center ${i % 2 == 0 ? "bg-row-bg1" : "bg-row-bg2"} hover:bg-bw/30`}
    >
      {" "}
      <Index i={i + 1} className="h-[5rem]" />
      <RowItem
        itemsStart
        text="sm"
        route={`/databases/${db.Database}`}
        load={db.Database}
        i={1}
      >
        {db.Database && db.Database.length > 17
          ? db.Database.slice(0, 14) + `...`
          : db.Database}
        <div className="relative flex w-full">
          <div className="text-bw/70 flex items-center space-x-3 text-xs">
            <span>tables:</span>
            <Count n={db.tbCount} />
          </div>{" "}
          <LogIn className="absolute top-0 right-0 hidden size-5 group-hover:flex" />
        </div>
      </RowItem>
      <RowItem extend i={2}>
        {db.description ?? <div className="italic">No description yet</div>}
      </RowItem>
      <RowItem i={1}>
        <UserTag
          name={db.createdBy ?? "Admin"}
          title={db.title}
          className="mb-1"
        />
        <Count date={db.createdAt} className="fill-blue-600/70" />
      </RowItem>
      <RowItem extend i={2}>
        {db.viewers ? (
          db.viewers.map((a, i) => {
            return <UserTag key={i} name={a.name} title={a.title} />;
          })
        ) : (
          <UserTag name={""} />
        )}
      </RowItem>
      <RowItem extend i={1}>
        {db.editors ? (
          db.editors.map((a, i) => {
            return <UserTag key={i} name={a.name} title={a.title} />;
          })
        ) : (
          <UserTag name={""} />
        )}
      </RowItem>
      <QuickActions
        action1="Delete"
        hoverColor1="red"
        action2="Add viewer"
        hoverColor2="blue"
        action3="More Actions"
      />
    </div>
  );
}
