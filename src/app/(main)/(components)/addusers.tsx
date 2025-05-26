"use client";

import { useAddUsers, useNotifyContext } from "@/app/dialogcontext";
import Index from "@/components";
import { useButtonAnim } from "@/components/count";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import UserTag from "@/components/usertag";
import { getUsers, allUsers } from "@/lib/actions";
import { changeUsers } from "@/lib/server";
import { UIEvent, useEffect, useState } from "react";

export default function AddUsers({ height }: { height?: string }) {
  const [users, setUsers] = useState([] as allUsers[]);
  const { addUsers, setAddUsers } = useAddUsers();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { setNotify } = useNotifyContext();

  function handleClickOut(e: UIEvent<HTMLDivElement>) {
    const currId = (e.target as HTMLDivElement).id;
    if (e.currentTarget.id == currId) {
      setAddUsers((p) => ({ ...p, type: "" }));
    }
  }

  function usersCount(category: string) {
    if (category == "e")
      return addUsers.editors.split(",").filter(Boolean).length;
    else return addUsers.viewers.split(",").filter(Boolean).length;
  }

  async function submitChangedUsers() {
    const isE = addUsers.category == "editors";
    const vArr = addUsers.viewers.split(",").filter(Boolean);
    const eArr = addUsers.editors.split(",").filter(Boolean);
    const dbTb = addUsers.type.split(",")[0].split("/");
    const { error } = await changeUsers({
      dbName: dbTb[0],
      tbName: dbTb[1],
      viewers: vArr,
      editors: eArr,
      remove: "",
    });
    if (error)
      setNotify({
        message: error,
        danger: true,
      });
    else
      setNotify({
        message: isE
          ? `Changed ${dbTb[1] ? "table" : " database"} editors`
          : `Changed ${dbTb[1] ? "table" : " database"} viewers`,
        danger: true,
      });
  }

  useEffect(() => {
    (async () => {
      const allUsers = await getUsers();
      if (allUsers) setUsers(allUsers);
      else {
        //setNotify
      }
    })();
  }, []);

  return (
    <div
      id="addUser"
      onClick={(e) => handleClickOut(e)}
      className={`absolute z-7 flex ${height ? height : "h-[92%]"} w-full items-center justify-center backdrop-blur-md`}
    >
      <div
        className={`${addUsers.type ? "scale-100" : "scale-0"} bg-tb-row1 ring-main-bg/50 relative flex h-fit max-h-[80%] w-[40%] min-w-[13rem] flex-col items-center rounded-[5px] shadow-2xl ring-2 shadow-black transition-all delay-200`}
      >
        <header className="bg-main-fg flex h-[3.2rem] w-full border-b-2">
          <div className="flex h-full w-[40%] flex-col items-center px-2 select-none">
            {" "}
            <span className="text-bw/70">{addUsers.type.split(",")[0]}</span>
            <span className="text-bw/60 text-xs">
              {" "}
              Add {addUsers.category} {": "}{" "}
              {addUsers.type == "editors" ? usersCount("e") : usersCount("v")}
            </span>
          </div>
          <div className="flex w-[60%] items-center px-2">
            {" "}
            <SearchBar />
          </div>
        </header>
        <main className="h-[78%] w-full overflow-auto">
          {users && users.map((a, i) => <Users key={i + 2} u={a} i={i + 1} />)}
        </main>
        <section className="mb-1 flex h-[3rem] w-full">
          <Button
            onClick={() => {
              setPressAnim("addUser");
              addUsers.type?.includes(",") && submitChangedUsers();
              setAddUsers((p) => ({ ...p, type: "" }));
            }}
            type="button"
            className={`${pressAnim == "addUser" && "scale-95"} hover h-[3rem] ${!addUsers.type?.includes(",") ? "w-1/2 rounded-full" : "w-1/4 rounded-l-full"} cursor-pointer bg-green-300/70 hover:bg-green-500`}
          >
            Ok
          </Button>
          {addUsers.type?.includes(",") && (
            <Button
              onClick={() => {
                setPressAnim("cancelAU");
                setAddUsers((p) => ({ ...p, type: "" }));
              }}
              type="button"
              className={`${pressAnim == "cancelAU" && "scale-95"} hover h-[3rem] w-1/4 cursor-pointer rounded-r-full bg-red-300/70 hover:bg-red-500`}
            >
              Cancel
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}

// export type Usedrs = {
//     id: string;
//     title: string;
//     firstname: string;
//     lastname: string;
//     username: string;
//     level: number;
//     edits: views[];
//     views: views[];
//     created: views[];
//   };

type Users = {
  u: allUsers;
  i: number;
};

function Users({ u, i }: Users) {
  const [hovered, setHovered] = useState(0);
  const { addUsers, setAddUsers } = useAddUsers();

  //users are not formatted to uid?db/tb -- Idea is, there wouldnt be cases where multiple tables and/or databases would be created at once.
  function userClicked(id: string, title: string, firstname: string) {
    const thisUser = id + "&" + title + "&" + firstname + ",";
    if (addUsers.category == "viewers") {
      setAddUsers((p) => {
        if (p.viewers?.includes(thisUser))
          return { ...p, viewers: p.viewers?.replace(thisUser, "") };
        else
          return {
            ...p,
            editors: p.editors?.replace(thisUser, ""),
            viewers: p.viewers ? p.viewers + thisUser : thisUser,
          };
      });
    } else if (addUsers.category == "editors") {
      setAddUsers((p) => {
        if (p.editors?.includes(thisUser))
          return { ...p, editors: p.editors?.replace(thisUser, "") };
        else
          return {
            ...p,
            viewers: p.viewers?.replace(thisUser, ""),
            editors: p.editors ? p.editors + thisUser : thisUser,
          };
      });
    }
  }

  //two possibilities usersCategory is viewer or editor - highlights users selected in the other
  return (
    <div
      onMouseEnter={() => setHovered(1)}
      onMouseLeave={() => setHovered(0)}
      className={`${addUsers.category == "viewers" ? addUsers.editors?.includes(u.id) && "text-bw/30 hover bg-red-600/30 hover:bg-red-600/10" : addUsers.viewers?.includes(u.id) && "text-bw/30 bg-red-600/30 hover:bg-red-600/10"} hover:bg-bw/30 border-bw/30 relative flex h-[3rem] w-full min-w-[10rem] items-center gap-2 border-b-2 p-0.5`}
    >
      <section className="flex w-[80%] justify-between">
        <div
          onClick={() => userClicked(u.id, u.title, u.firstname)}
          className="flex min-w-[13rem] flex-none cursor-pointer items-center gap-2 pl-[3rem]"
        >
          <Index
            i={i}
            hovered={hovered}
            size={6}
            className="text-xs"
            morph="selected"
            selected={
              addUsers.category == "viewers"
                ? addUsers.viewers?.includes(u.id)
                : addUsers.editors?.includes(u.id)
            }
          />
          <UserTag
            hovered={hovered == 1}
            name={u.firstname + " " + u.lastname}
            title={u.title}
            clicked={
              addUsers.category == "viewers"
                ? addUsers.viewers?.includes(u.id)
                : addUsers.editors?.includes(u.id)
            }
            cap={20}
            className="text-sm"
          />
        </div>
        <div
          title={
            addUsers.category == "viewers"
              ? addUsers.editors?.includes(u.id)
                ? "Change to viewer"
                : ""
              : addUsers.viewers?.includes(u.id)
                ? "Change to editor"
                : ""
          }
          className={`text-bw/50 hidden cursor-pointer ${(addUsers.editors?.includes(u.id) || addUsers.viewers?.includes(u.id)) && "md:flex"} `}
        >
          {addUsers.editors?.includes(u.id) ? (
            <UserTag
              name="Editor"
              className="w-[3.5rem] bg-red-500/30 text-xs font-semibold"
            />
          ) : (
            <UserTag
              name="Viewer"
              className="w-[3.5rem] bg-blue-500/30 text-xs font-semibold"
            />
          )}
        </div>
      </section>
    </div>
  );
}
