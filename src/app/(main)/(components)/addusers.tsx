"use client";

import { useAddUsers } from "@/app/dialogcontext";
import Index from "@/components";
import { useButtonAnim } from "@/components/count";
import SearchBar from "@/components/searchbar";
import { Button } from "@/components/ui/button";
import UserTag from "@/components/usertag";
import { getUsers, allUsers } from "@/lib/actions";
import { UIEvent, useEffect, useState } from "react";

export default function AddUsers() {
  const [users, setUsers] = useState([] as allUsers[]);
  const { addUsers, setAddUsers } = useAddUsers();
  const { pressAnim, setPressAnim } = useButtonAnim();

  function handleClickOut(e: UIEvent<HTMLDivElement>) {
    const currId = (e.target as HTMLDivElement).id;
    if (e.currentTarget.id == currId) {
      setAddUsers((p) => ({ ...p, type: "" }));
    }
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
      className={`absolute z-7 flex h-[92%] w-full items-center justify-center backdrop-blur-md`}
    >
      <div
        className={`${addUsers.type ? "scale-100" : "scale-0"} bg-tb-row1 ring-main-bg/50 flex h-[80%] w-[40%] min-w-[13rem] flex-col items-center rounded-[5px] shadow-2xl ring-2 shadow-black transition-all delay-200`}
      >
        <header className="bg-main-fg flex h-[3.2rem] w-full border-b-2">
          <div className="flex h-full w-[40%] flex-col items-center px-2 select-none">
            {" "}
            <span className="text-bw/70">Users</span>
            <span className="text-bw/60 text-xs">
              {" "}
              Add {addUsers.category.toLocaleLowerCase()}
            </span>
          </div>
          <div className="flex w-[60%] items-center px-2">
            {" "}
            <SearchBar />
          </div>
        </header>
        <main className="h-[78%] w-full">
          {users && users.map((a, i) => <Users key={i + 2} u={a} i={i + 1} />)}
        </main>
        <Button
          onClick={() => {
            setPressAnim("addUser");
            setAddUsers((p) => ({ ...p, type: "" }));
          }}
          type="button"
          className={`${pressAnim == "addUser" && "scale-95"} hover h-[3rem] w-1/2 cursor-pointer rounded-full bg-green-300/70 hover:bg-green-500`}
        >
          Ok
        </Button>
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
    const thisUser = id + "&" + title + "&" + firstname;
    if (addUsers.category == "viewers") {
      setAddUsers((p) => {
        if (p.viewers?.includes(thisUser))
          return { ...p, viewers: p.viewers?.replace(thisUser + ",", "") };
        else
          return {
            ...p,
            editors: p.editors?.replace(thisUser + ",", ""),
            viewers: p.viewers ? p.viewers + thisUser + "," : thisUser + ",",
          };
      });
    } else if (addUsers.category == "editors") {
      setAddUsers((p) => {
        if (p.editors?.includes(thisUser))
          return { ...p, editors: p.editors?.replace(thisUser + ",", "") };
        else
          return {
            ...p,
            viewers: p.viewers?.replace(thisUser + ",", ""),
            editors: p.editors ? p.editors + thisUser + "," : thisUser + ",",
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
            hovered={hovered}
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
      <div> </div>
    </div>
  );
}
