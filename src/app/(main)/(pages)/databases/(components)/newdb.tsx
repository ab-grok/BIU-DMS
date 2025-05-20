"use client";
import Index from "@/components";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useSelection } from "../../selectcontext";
import { useForm } from "react-hook-form";
import { createDbSchema, createDbType } from "@/lib/createschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useButtonAnim } from "@/components/count";
import { useAddUsers, useLoading, useNotifyContext } from "@/app/dialogcontext";
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import UserTag from "@/components/usertag";
import { Separator } from "@/components/ui/separator";
import { revalidate, validateSession } from "@/lib/sessions";
import { createDb } from "@/lib/server";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";

export default function NewDb({ uid }: { uid: string }) {
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { create, setCreate } = useSelection();
  const { addUsers, setAddUsers } = useAddUsers();
  const { setNotify, notify } = useNotifyContext();
  const { isLoading, setIsLoading } = useLoading();
  const router = useRouter();

  const form = useForm<createDbType>({
    resolver: zodResolver(createDbSchema),
    defaultValues: {
      dbName: "",
      desc: "",
    },
  });
  const { reset } = form;

  function resetForm() {
    reset();
    setPressAnim("ndbr");
    setAddUsers((p) => ({ ...p, viewers: "", editors: "" }));
  }

  async function dbSubmitted(values: createDbType) {
    setIsLoading((p) => p + "ndb,");
    const dbData = createDbSchema.parse(values);
    const editors = addUsers.editors?.split(",").filter(Boolean);
    const viewers = addUsers.viewers?.split(",").filter(Boolean);

    console.log(
      "dbData: ",
      dbData,
      "editors: ",
      editors,
      "viewers: ",
      viewers,
      "uid: ",
      uid,
    );
    const { error } = await createDb({
      userId: uid,
      ...dbData,
      viewers,
      editors,
      isPrivate: true,
    });
    if (error) {
      setNotify({
        danger: true,
        message: error,
      });
    } else {
      setNotify({ message: "Database created successfully" });
      await revalidate("databases");
      router.refresh();
    }
    setIsLoading((p) => p.replace("ndb,", ""));
  }

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <div
      className={`${create == "db" ? "scale-100" : "hidden scale-0"} group/ndb hover:bg-row-bg1/70 bg-row-bg2/90 border-bw/30 relative z-5 flex min-h-[6rem] w-full min-w-fit flex-none items-center border-b-2 transition-all`}
    >
      {" "}
      <Index
        i={1}
        morph="create"
        className="sticky left-0 h-[6rem] w-[2.2rem] group-hover/ndb:bg-green-400"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(dbSubmitted)}
          className="flex w-full min-w-fit flex-none items-center"
        >
          <div className="bg-main-fg ml-3 h-[5rem] w-[10rem] min-w-[10rem] p-1 px-2 font-medium shadow-sm">
            <FormField
              control={form.control}
              name="dbName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bw/60 text-xs">
                    Database name:
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="bg-main-fg ml-3 h-[5rem] w-[40%] min-w-[10rem] p-1 px-2 font-medium shadow-sm">
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-bw/60 text-xs">
                    Description:
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="scrollbar-custom p flex h-[1rem] min-h-[2.5rem] rounded-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <section className="bg-main-fg ml-3 flex h-[5rem] w-[15rem] min-w-[10rem] p-1 font-medium shadow-sm">
            <UsersTable />
          </section>
          <div className="bg-main-fg relative ml-3 h-[5rem] w-[6rem] min-w-[6rem] space-y-1 p-1 px-2 font-medium shadow-sm">
            {isLoading.includes("ndb") && <Loading />}
            <Button
              onClick={resetForm}
              type="button"
              className={`${pressAnim == "ndbr" && "scale-95"} h-[2rem] w-[5rem] rounded-full bg-red-600/50 hover:bg-red-600`}
            >
              {" "}
              Reset{" "}
            </Button>
            <Button
              type="submit"
              onClick={() => setPressAnim("ndb")}
              className={`${pressAnim == "ndb" && "scale-95"} h-[2rem] w-[5rem] rounded-full bg-green-600/50 hover:bg-green-600`}
            >
              {" "}
              submit{" "}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function UsersTable() {
  const { addUsers, setAddUsers } = useAddUsers();
  const [viewersHovered, setViewersHovered] = useState(0);
  const [editorsHovered, setEditorsHovered] = useState(0);
  const { pressAnim, setPressAnim } = useButtonAnim();
  const [users, setUsers] = useState({
    editors: [] as user,
    viewers: [] as user,
  });

  type user = {
    title: string;
    firstname: string;
    id: string;
  }[];

  useEffect(() => {
    const editors: user = [];
    const viewers: user = [];

    if (addUsers.editors) {
      console.log("addUsers.editors: ", addUsers.editors);
      const edArr = addUsers.editors.split(",").filter(Boolean);
      edArr.forEach((a) => {
        const u = a.split("&");
        editors.push({ id: u[0], title: u[1], firstname: u[2] });
      });
    }
    if (addUsers.viewers) {
      console.log("addUsers.viewers: ", addUsers.viewers);
      const edArr = addUsers.viewers.split(",").filter(Boolean);
      edArr.forEach((a) => {
        const u = a.split("&");
        viewers.push({ id: u[0], title: u[1], firstname: u[2] });
      });
    }

    setUsers({ editors: editors, viewers: viewers });
  }, [addUsers.editors, addUsers.viewers]);

  function handleAddUsers(n: number) {
    if (n == 1) {
      setAddUsers((p) => {
        if (p.type && p.type != "newDb") {
          return {
            type: "newDb",
            category: "viewers",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: "newDb",
            category: "viewers",
          };
        }
      });
    }
    if (n == 2) {
      setAddUsers((p) => {
        if (p.type && p.type != "newDb") {
          return {
            type: "newDb",
            category: "editors",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: "newDb",
            category: "editors",
          };
        }
      });
    }
  }

  return (
    <div className="flex w-full">
      <section className="border-bw/20 h-full w-1/2 border-r-1">
        <header
          onMouseEnter={() => setViewersHovered(1)}
          onMouseLeave={() => setViewersHovered(0)}
          onClick={() => handleAddUsers(1)}
          className="text-bw/70 bg-row-bg1/70 flex h-[1.3rem] w-full cursor-pointer items-center justify-between rounded-lg px-1 text-xs font-semibold select-none hover:bg-white/20"
        >
          {" "}
          {viewersHovered ? (
            <span className="text-bw/80 flex-none text-[10px]">
              {" "}
              Add viewers?
            </span>
          ) : (
            <span>
              {" "}
              viewers
              <span className="ml-2">
                {addUsers.viewers?.split(",")?.length - 1 || 0}{" "}
              </span>
            </span>
          )}
          <span
            className={`flex size-4 cursor-pointer items-center rounded-[5px] ${viewersHovered && "bg-green-600 shadow-sm"} border-bw/50 border-2`}
          >
            <PlusIcon className="size-6 drop-shadow-xs transition-all hover:scale-95" />
          </span>
        </header>
        <div className="h-[73%] overflow-x-hidden overflow-y-auto">
          {users.viewers?.map((a, i) => (
            <span
              key={a.firstname}
              className="hover:bg-bw/20 flex px-0.5 transition-all"
            >
              <UserTag
                name={a.firstname}
                title={a.title}
                className="cursor-pointer text-xs"
                colorCode={1}
                cap={15}
              />
            </span>
          ))}
        </div>
      </section>
      <section className="h-full w-1/2">
        <header
          onMouseEnter={() => setEditorsHovered(1)}
          onMouseLeave={() => setEditorsHovered(0)}
          onClick={() => handleAddUsers(2)}
          className="text-bw/70 bg-row-bg1/80 hover:bg-row-bg1 flex h-[1.3rem] w-full cursor-pointer items-center justify-between rounded-lg px-1 text-xs font-semibold select-none"
        >
          {editorsHovered ? (
            <span className="text-bw/80 flex-none text-[10px]">
              Add Editors?
            </span>
          ) : (
            <span>
              {" "}
              Editors
              <span className="ml-2">
                {" "}
                {addUsers.editors?.split(",")?.length - 1 || 0}{" "}
              </span>
            </span>
          )}
          <span
            className={`flex size-4 cursor-pointer items-center rounded-[5px] ${editorsHovered && "bg-green-600 shadow-sm"} border-bw/50 border-2`}
          >
            <PlusIcon className="size-6 drop-shadow-xs transition-all hover:scale-95" />
          </span>
        </header>
        <div className="h-[73%] overflow-x-hidden overflow-y-auto">
          {users.editors?.map((a, i) => (
            <span
              key={a.firstname}
              className="hover:bg-bw/20 flex px-0.5 transition-all"
            >
              <UserTag
                name={a.firstname}
                title={a.title}
                className="cursor-pointer text-xs"
                colorCode={1}
                cap={15}
              />
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
