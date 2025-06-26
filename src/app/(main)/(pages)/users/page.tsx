"use client";
import { useLoading } from "@/app/dialogcontext";
import Index from "@/components";
import { useButtonAnim } from "@/components/count";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import { allUsers, getUsers } from "@/lib/actions";
import { revalidate } from "@/lib/sessions";
import { useEffect, useState } from "react";

export default function AllUsers() {
  const [users, setUsers] = useState([] as allUsers[]);
  const [viewsCount, setViewsCount] = useState({ db: 0, tb: 0 }); //tb holds the dbname/tbname
  const [editsCount, setEditsCount] = useState({ db: 0, tb: 0 }); //tb holds the dbname/tbname

  useEffect(() => {
    setIsLoading((p) => p + "users,");
    (async () => {
      revalidate("users"); //------------  remove
      const allUsers = await getUsers();
      if (!allUsers) {
        console.log("couldnt get users");
        return;
      }
      console.log("in users, allUsers: ", allUsers);
      setUsers(allUsers);
      setIsLoading((p) => p.replace("users,", ""));
    })();
  }, []);

  const { isLoading, setIsLoading } = useLoading();

  return (
    <div className="relative flex h-[100%] w-full flex-col items-center">
      <header className="scrollbar-custom mb-1 flex h-[3.4rem] w-full overflow-x-auto rounded-sm border-b-2 p-0.5 select-none">
        <div className="bg-row-bg1 h-full w-[2rem]"></div>
        <section className="bg-row-bg2 text-bw/70 flex w-[40%] min-w-[12rem] items-center pl-[0.5rem] font-semibold">
          Users
        </section>
        <section className="bg-row-bg1 relative flex h-full w-[30%] min-w-[12rem] flex-none flex-col">
          {" "}
          <span className="text-bw/70 flex px-1">
            <span className="font-bold">views</span>
            <Index
              i={viewsCount.tb + viewsCount.db}
              size={4}
              className="text-bw/50 sticky bg-transparent text-xs"
            />
          </span>
          <div className="text-bw/50 flex w-full flex-none text-sm">
            <span className="bg-row-bg1 flex w-1/2 px-1">
              <span>Databases</span>
              <Index
                i={viewsCount.db}
                size={4}
                className="text-bw/50 sticky bg-transparent text-xs"
              />{" "}
            </span>
            <Separator orientation="vertical" />
            <span className="bg-row-bg1 flex w-1/2 px-1">
              <span>Tables</span>
              <Index
                i={viewsCount.tb}
                size={4}
                className="text-bw/50 sticky bg-transparent text-xs"
              />{" "}
            </span>
          </div>
        </section>
        <section className="bg-row-bg2 flex h-full w-[30%] min-w-[12rem] flex-none flex-col">
          {" "}
          <span className="text-bw/70 flex px-1">
            <span className="font-bold">Edits</span>
            <Index
              i={editsCount.db + editsCount.tb}
              size={4}
              className="text-bw/50 sticky bg-transparent text-xs"
            />
          </span>
          <div className="text-bw/50 flex w-full text-sm">
            <span className="bg-row-bg2 flex w-1/2 px-1">
              <span>Databases</span>
              <Index
                i={editsCount.db}
                size={4}
                className="text-bw/50 sticky bg-transparent text-xs"
              />
            </span>
            <Separator orientation="vertical" />
            <span className="bg-row-bg2 flex w-1/2 px-1">
              <span>Tables</span>
              <Index
                i={editsCount.tb}
                size={4}
                className="text-bw/50 sticky bg-transparent text-xs"
              />
            </span>
          </div>
        </section>
      </header>
      <main className="relative flex h-[96%] w-full flex-col overflow-auto">
        {users?.map((a, i) => (
          <User
            i={i + 1}
            key={a.firstname}
            setViewsCount={setViewsCount}
            setEditsCount={setEditsCount}
            user={a}
          />
        ))}
      </main>
    </div>
  );
}

type user = {
  i: number;
  setEditsCount: (count: count) => void;
  setViewsCount: (count: count) => void;
  user: allUsers;
};
type views = { db: string[]; tb: string[] };
type count = { db: number; tb: number };

function User({ i, setEditsCount, setViewsCount, user }: user) {
  const { pressAnim, setPressAnim } = useButtonAnim();
  const [clicked, setClicked] = useState(0);
  const [hover, setHover] = useState(0);
  const [edits, setEdits] = useState({} as views); //tb holds the dbname/tbname
  const [views, setViews] = useState({} as views);
  const [created, setCreated] = useState({} as views);

  useEffect(() => {
    if (i == 1) console.log("edits from useEffect: " + JSON.stringify(edits));
  }, [edits]);

  useEffect(() => {
    const editTb: string[] = [];
    const editDb: string[] = [];
    const viewTb: string[] = [];
    const viewDb: string[] = [];
    const createdDb: string[] = [];
    const createdTb: string[] = [];
    user.edits?.forEach((a, j) => {
      if (a.tb) {
        editTb.push(`${a.db}/${a.tb}`);
      } else if (a.db) {
        editDb.push(a.db);
      }
    });

    user.views?.forEach((a, j) => {
      if (a.tb) {
        viewTb.push(`${a.db}/${a.tb}`);
      } else if (a.db) {
        viewDb.push(a.db);
      }
    });

    user.created?.forEach((a) => {
      if (a.tb) createdTb.push(`${a.db}/${a.tb}`);
      else if (a.db) createdDb.push(a.db);
    });

    setEdits({ tb: editTb, db: editDb });
    setViews({ tb: viewTb, db: viewDb });
    setCreated({ tb: createdTb, db: createdDb });
  }, []);

  function handleHover(i: number) {
    setHover(i);
    if (i) {
      setEditsCount({
        db: edits.db.length,
        tb: edits.tb.length,
      });
      setViewsCount({
        db: views.db.length,
        tb: views.tb.length,
      });
    }
  }

  return (
    <div
      onMouseEnter={() => handleHover(i + 1)}
      onMouseLeave={() => handleHover(0)}
      className={`${i % 2 == 0 ? "bg-row-bg2" : "bg-row-bg1"} relative mb-1 flex h-fit min-w-full items-stretch bg-cyan-900`}
    >
      <Index
        className="sticky left-0 mr-2 h-full w-[2rem] self-center backdrop-blur-3xl"
        size={6}
        i={i}
      />
      <section
        title={`Go to ${user.title + " " + user.firstname + "'s"} page`}
        className="flex w-[38.5%] min-w-[9.5rem] cursor-pointer flex-col justify-center gap-1 overflow-hidden rounded-[5px] text-sm select-none"
      >
        <div className="space-x-1 hover:underline">
          <span> {user.title} </span>
          <span> {user.firstname + " " + user.lastname} </span>
          {user.username && <span>({user.username})</span>}
        </div>
        <div className="text-bw/60 space-x-2 text-xs">
          <span>Level: {user.level}</span>
          <span>Databases: {created.db?.length || 0} </span>
          <span>Tables: {created.tb?.length || 0}</span>
        </div>
      </section>
      <Separator orientation="vertical" className="bg-main-bg/50" />
      <section
        id="views"
        className="bg-tb-row1/50 flex h-full min-h-[2.5rem] w-[30%] min-w-[12rem] flex-none rounded-[5px] p-1"
      >
        <div className="flex min-h-full w-1/2 flex-col">
          {views.db?.map((a) => (
            <UserTag
              key={a}
              name={a}
              className="text-xs"
              colorCode={4}
              cap={10}
            />
          ))}
        </div>
        <div id="views tb" className="flex min-h-full w-1/2 flex-col">
          {views.tb?.map((a) => (
            <UserTag
              key={a}
              name={a}
              className="text-xs"
              colorCode={4}
              cap={10}
            />
          ))}
        </div>
      </section>
      <Separator orientation="vertical" className="bg-main-bg/50" />
      <section
        id="edits"
        className="bg-tb-row1/30 flex h-full min-h-[2.5rem] w-[30%] min-w-[12rem] rounded-[5px] p-1"
      >
        <div className="line-clamp-1 flex h-full min-w-1/2 gap-1 break-words">
          {edits.db?.map((a, i) => (
            <UserTag
              name={a}
              key={a}
              className="text-xs"
              colorCode={6}
              cap={10}
            />
          ))}
        </div>
        <div className="flex min-h-full w-1/2 flex-wrap gap-1">
          {edits.tb?.map((a, i) => (
            <UserTag
              name={a}
              key={a}
              className="text-xs"
              colorCode={3}
              cap={10}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
