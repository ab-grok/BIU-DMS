"use client";

import { useEffect, useRef, useState } from "react";
import { useButtonAnim } from "@/components/count";
import { useSelection } from "../../../selectcontext";
import { useRouter } from "next/navigation";
import Index from "@/components";
import { useAddUsers, useLoading, useNotifyContext } from "@/app/dialogcontext";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { createTbSchema, createTbType } from "@/lib/createschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SlideSelect } from "@/app/(auth)/signup/signupform";
import { Button } from "@/components/ui/button";
import UserTag from "@/components/usertag";
import { postTable } from "@/lib/actions";
import Loading from "@/components/loading";
import { KeysButton } from "@/components/keysbutton";
import { PlusIcon } from "lucide-react";
import { createTb } from "@/lib/server";

type tbType = {
  i: number;
  uData: string; //uid&ttl&fname
  db: string;
};

export type errSetter = {
  blurHandler: (e: any, p?: string) => void;
  pressAnim: string;
  header?: string;
  body: string;
  button1Press: string;
  button2Press?: string;
  primaryCol?: string;
  success?: boolean;
  deleteColfn?: (name: string, del?: string) => void;
  delColName?: string;
  delPrifn?: (del: string) => void;
} | null;

export default function CreateTb({ i, uData, db }: tbType) {
  const router = useRouter();
  const [cardClicked, setCardClick] = useState(false);
  const { notify, setNotify } = useNotifyContext();
  const {
    create,
    setCreate,
    selectedTb,
    setSelectedTb,
    createTbMeta,
    setCreateTbMeta,
    createTbCol,
    setCreateTbCol,
  } = useSelection();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { addUsers } = useAddUsers();
  const [errDialog, setErrDialog] = useState({} as errSetter);
  const { isLoading, setIsLoading } = useLoading();
  const [typeChange, setTypeChange] = useState(0);
  const [cardHovered, setCardHovered] = useState(0);
  const colScroll = useRef<HTMLDivElement>(null);
  const currColInput = useRef<HTMLInputElement>(null);
  const currDesc = useRef<HTMLTextAreaElement>(null);
  const keys = ["Primary", "Unique", "AI", "Not null"];
  type keysType = "primary" | "notnull" | "unique" | "ai";

  // function testNames() {
  //   for (const key of keys) {
  //     console.log("this is key: ", key);
  //     console.log(
  //       "this is key.toLowerCase() as keysType: ",
  //       key.toLowerCase() as keysType,
  //     );
  //     console.log(
  //       "this is key.toLowerCase().replace(' ','') as keysType: ",
  //       key.toLowerCase().replace(" ", "") as keysType,
  //     );
  //   }
  // }

  function handleCardClicked(e: React.MouseEvent<HTMLElement>) {
    selectedTb != "createNew" && setSelectedTb("createNew,");
  }

  const form = useForm<createTbType>({
    resolver: zodResolver(createTbSchema),
    defaultValues: {
      name: "",
      primary: 0,
      notnull: 0,
      unique: 0,
      ai: 0,
      type: 1,
    },
  });
  const { setValue } = form;

  function colSubmitted(values: createTbType) {
    console.log("values from colSubmitted: ", values);
    const columns = createTbSchema.parse(values);
    console.log("columns from colSubmitted: ", columns);
    //if !title set error
    if (!createTbMeta.tbName) {
      setCreateTbMeta({
        dbName: db,
        tbName: columns.name,
        desc: "",
        // createdBy: uData, get from session
      });
      setCreateTbCol([]);
    } else if (!createTbMeta.desc) {
      //if desc deled then setCreateTBMeta
      setCreateTbMeta((p) => ({ ...p, desc: columns.desc }));
      // else set ID
      const id = {
        name: "ID",
        primary: 1,
        unique: 1,
        notnull: 1,
        ai: 1,
        type: 2,
      };
      setCreateTbCol([id]);
    } else if (columns.name) {
      if (checkOrDelCol(columns.name)) return;
      else setCreateTbCol((p) => [...p, columns]);
    }
    const { reset } = form;
    reset();
    // currColInput.current
    //   ? currColInput.current.focus()
    //   : currDesc.current?.focus();
  }

  const keyPress = document.addEventListener("keypress", () => {
    currColInput.current
      ? currColInput.current.focus()
      : currDesc.current?.focus();
  });

  //for name check and independent delete
  function checkOrDelCol(colName: string, del?: string) {
    let sameColFound = false;
    createTbCol.length > 0 &&
      createTbCol.forEach((a, i) => {
        if (a.name.toLowerCase() == colName.toLowerCase()) {
          if (del) {
            setCreateTbCol((p) => p.filter((b, j) => j != i));
            sameColFound = true;
          } else {
            setErrDialog({
              blurHandler: errDialogHandler,
              pressAnim: pressAnim,
              button1Press: "No",
              button2Press: "Delete",
              body: "Delete previous",
              header: "There's a column with that name",
              deleteColfn: checkOrDelCol,
              delColName: colName,
            });
          }
        }
      });
    return sameColFound;
  }

  function tableSubmitted() {
    if (!createTbMeta.tbName) {
      setErrDialog({
        blurHandler: errDialogHandler,
        body: "Table is empty.",
        button1Press: "Ok",
        pressAnim: pressAnim,
      });
      return;
    } else if (createTbCol.length < 2) {
      setErrDialog({
        blurHandler: errDialogHandler,
        body: "You need at least two columns.",
        button1Press: "Ok",
        pressAnim: pressAnim,
      });
      return;
    }

    const viewers = addUsers.viewers?.split(",").filter(Boolean);
    const editors = addUsers.editors?.split(",").filter(Boolean);

    const postTb = {
      columns: createTbCol,
      ...createTbMeta,
      viewers,
      editors,
      isPrivate: 1,
    }; //change isprivate?
    console.log("in tableSubmitted, createTbMeta: ", createTbMeta);

    setIsLoading((p) => p + "createTb,");
    (async () => {
      const { error } = await createTb(postTb);
      if (!error)
        setNotify({
          message: "Table has been created",
          danger: false,
        });
      else
        setNotify({
          message: error,
          danger: true,
        });
      setIsLoading((p) => p.replace("createTb,", ""));
    })();
  }

  //error handller : primary found returns primary
  function findPrimary(del?: string) {
    console.log("first param from findPrimary: ", del);
    let priFound = false;
    createTbCol.length > 0 &&
      createTbCol.forEach((a, i) => {
        if (a.primary) {
          if (del) {
            setCreateTbCol((p) => {
              const newCols = [...p];
              newCols[i].primary = 0;
              return newCols;
            });
            console.log("Del executed");
            setValue("primary", 1);
            setErrDialog(null);
            return;
          }
          setErrDialog({
            blurHandler: errDialogHandler,
            pressAnim: pressAnim,
            header: "A primary column exists!",
            body: "Use this instead?",
            button1Press: "Yes",
            button2Press: "No",
            primaryCol: a.name,
            delPrifn: findPrimary,
          });
          priFound = true;
          return;
        }
      });
    return priFound;
  }

  function errDialogHandler(e: React.MouseEvent<HTMLElement>, press?: string) {
    console.log("press sent to  errDialogHandler: ", press);
    if (press) {
      setPressAnim(press);
      console.log(" THeres press press to: ", pressAnim);
      setErrDialog(null);
      press == "yes" && findPrimary("del");
    }
    const currId = (e.target as HTMLElement).id;
    if (currId == "ErrorBackdrop") setErrDialog(null);
  }

  useEffect(() => {
    colScroll.current &&
      (colScroll.current.scrollLeft = colScroll.current?.scrollWidth);
  }, [createTbCol.length]);

  return (
    <div
      onMouseEnter={() => setCardHovered(1)}
      onMouseLeave={() => setCardHovered(0)}
      className={`${create == "table" ? "flex" : "hidden"} group/card bg-main-bg/70 absolute z-6 flex h-[14rem] max-h-[14.3rem] w-full min-w-fit overflow-hidden`}
    >
      <Index
        i={0}
        morph="create"
        className="sticky h-[14rem] w-[2.55rem] self-center group-hover/card:bg-green-900"
        size={6}
      />
      <div
        id="main"
        onClick={(e) => {
          handleCardClicked(e);
        }}
        className={`${selectedTb.includes("createNew") && "ring-2 ring-green-700/40"} border-sub-fg/50 items-center-2 bg-main-fg m-1 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-sm ring-blue-700/20 hover:ring-2`}
      >
        {isLoading.includes("createTb") && <Loading />}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(colSubmitted)}
            className="relative flex"
          >
            <ErrorDialog errDialog={errDialog} />
            <section className="flex w-[25rem] flex-col items-center select-none">
              <header className="text-bw/70 bg-row-bg1/30 mb-1 flex h-[3rem] w-full flex-col items-start rounded-lg p-1 pt-0">
                <span className="text-bw/90 text-sm font-medium">
                  {createTbMeta.tbName ?? (
                    <span className="text-bw/70 italic">Table name</span>
                  )}
                </span>
                <div className="flex h-[1.5rem] items-center gap-2 text-xs">
                  Columns:{" "}
                  <div
                    ref={colScroll}
                    className="scrollbar-custom flex h-full max-w-[20rem] min-w-[20rem] gap-3 overflow-x-scroll transition-all duration-500"
                  >
                    {createTbCol.length > 0 &&
                      createTbCol.map((a, i) => (
                        <UserTag
                          key={a.name}
                          name={a.name}
                          delFn={checkOrDelCol}
                        />
                      ))}
                  </div>
                </div>
              </header>
              <FormField
                control={form.control}
                name={
                  createTbMeta.tbName && !createTbMeta.desc //or desc deled
                    ? "desc"
                    : "name"
                }
                render={({ field }) => (
                  <FormItem className="flex max-w-fit min-w-[20rem] flex-col items-center">
                    <FormLabel className="">
                      {createTbMeta.tbName && createTbMeta.desc
                        ? `Column ` + (createTbCol.length + 1)
                        : createTbMeta.tbName
                          ? "Table description"
                          : "Table name"}
                    </FormLabel>
                    <FormControl>
                      {createTbMeta.tbName && !createTbMeta.desc ? (
                        <Textarea
                          {...field}
                          ref={currDesc}
                          setter={setValue}
                          onChange={field.onChange}
                          className="scrollbar-custom h-[4rem] max-w-[20rem] rounded-full px-4"
                          placeholder="Describe what the table holds."
                        />
                      ) : (
                        <Input
                          {...field}
                          ref={currColInput}
                          className="h-[3rem] max-w-[20rem] rounded-full"
                          placeholder={
                            !createTbMeta.tbName
                              ? "What is this table called?"
                              : "Column name"
                          }
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-destructive text-[13px]" />
                  </FormItem>
                )}
              />
              {createTbMeta.tbName && createTbMeta.desc && (
                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl className={``}>
                        <SlideSelect
                          className="mt-[1rem] h-[2rem] w-[20rem] rounded-full ring-green-700/80"
                          onChange={field.onChange}
                          typeChange={setTypeChange}
                          color="bg-green-600"
                          name="type"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </section>
            <Separator orientation="vertical" className="bg-main-bg/10" />
            <section className="relative h-full w-[10.3rem] space-y-2 p-1">
              <div
                className={`${(!createTbMeta.tbName || !createTbMeta.desc) && "pointer-events-none cursor-not-allowed"} grid min-h-[7rem] w-[8rem] gap-1 pl-2`}
              >
                {keys.map((a, i) => (
                  <FormField
                    control={form.control}
                    key={i}
                    name={a.toLowerCase().replace(" ", "") as keysType}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <KeysButton
                            name={a}
                            n={i}
                            type={typeChange}
                            findPrimary={findPrimary}
                            onChange={field.onChange}
                            value={field.value}
                            setAiErr={setErrDialog}
                            errDialogHandler={errDialogHandler}
                            pressAnim={pressAnim}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Separator className="bg-bw/10" />
              <div className="relative h-fit w-full p-1">
                <Button
                  type="submit"
                  onClick={() => setPressAnim("AddCol")}
                  className={` ${pressAnim == "AddCol" && "scale-95"} relative h-full w-1/2 cursor-pointer rounded-l-full bg-blue-600/50 shadow-xs select-none hover:bg-blue-700`}
                >
                  Add
                </Button>
                <Button
                  onClick={() => setPressAnim("SubmitTb")}
                  type="button"
                  className={`${pressAnim == "SubmitTb" && "scale-95"} h-full w-1/2 cursor-pointer rounded-r-full bg-green-600/50 shadow-xs select-none hover:bg-green-600`}
                >
                  {" "}
                  submit
                </Button>
              </div>
            </section>
          </form>
        </Form>
      </div>
      <LiveTable
        findPrimary={findPrimary}
        setErr={setErrDialog}
        errDialogHandler={errDialogHandler}
        checkOrDelCol={checkOrDelCol}
      />
    </div>
  );
}

type liveTable = {
  findPrimary: (del?: string) => boolean;
  setErr: (e: any) => void;
  errDialogHandler: (e: any, press?: string) => void;
  checkOrDelCol: (colName: string, del?: string) => void;
};

function LiveTable({
  findPrimary,
  setErr,
  errDialogHandler,
  checkOrDelCol,
}: liveTable) {
  const { createTbCol, setCreateTbCol, createTbMeta, setCreateTbMeta } =
    useSelection();
  const { addUsers, setAddUsers } = useAddUsers();

  const { pressAnim, setPressAnim } = useButtonAnim();
  const keys = ["Primary", "Unique", "AI", "Not null"];
  const [viewersHovered, setViewersHovered] = useState(0);
  const [editorsHovered, setEditorsHovered] = useState(0);
  // const [allUsers, setAllusers] = useState([] as allUsers[]);
  const [users, setUsers] = useState({
    editors: [] as user,
    viewers: [] as user,
  });
  const liveColRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (liveColRef.current) liveColRef.current.scrollTop = 1;
    console.log(
      "liveColRef.current?.scrollHeight: ",
      liveColRef.current?.scrollHeight,
      "\n liveColRef.current?.scrollTop: ",
      liveColRef.current?.scrollHeight,
    );
  }, [createTbCol.length]);

  function onKeysChange(colName: string, keyName: string, keyVal: number) {
    const key = keyName.toLowerCase().replace(" ", "");
    for (const [i, a] of createTbCol.entries()) {
      if (a.name == colName) {
        setCreateTbCol((p) => {
          const updCol = [...p];
          if (key == "primary") updCol[i].primary = keyVal;
          if (key == "unique") updCol[i].unique = keyVal;
          if (key == "notnull") updCol[i].notnull = keyVal;
          if (key == "ai") updCol[i].ai = keyVal;
          return updCol;
        });
        break;
      }
    }
  }

  function handleAddUsers(n: number) {
    if (n == 1) {
      setAddUsers((p) => {
        if (p.type && p.type != "New Table") {
          return {
            type: "New Table",
            category: "viewers",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: "New Table",
            category: "viewers",
          };
        }
      });
    }
    if (n == 2) {
      setAddUsers((p) => {
        if (p.type && p.type != "New Table") {
          return {
            type: "New Table",
            category: "editors",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: "New Table",
            category: "editors",
          };
        }
      });
    }
  }

  return (
    <div className="bg-sub-bg absolute right-0 z-4 hidden h-[14rem] max-h-fit w-[30rem] flex-col gap-1 rounded-[5px] border-3 border-green-400/30 p-1 py-2 shadow-2xl xl:flex">
      <header className="bg-tb-row2/50 flex h-[3.5rem] w-full gap-1 rounded-2xl">
        <div className="flex h-full w-fit min-w-1/3 p-1 text-[1rem] font-medium">
          {" "}
          {createTbMeta.tbName}{" "}
        </div>
        <Separator orientation="vertical" />
        <div className="min-w-1/3 overflow-y-auto scroll-smooth py-1 text-[0.7rem] font-medium break-words whitespace-normal">
          {" "}
          {createTbMeta.desc}
        </div>
      </header>
      <main className="relative flex h-[9.2rem] w-full">
        <section className="bg-row-bg1/20 flex h-full w-1/2 gap-1 rounded-md p-1 pb-2">
          <div className="text-bw/70 h-full w-1/2">
            <header
              onMouseEnter={() => setViewersHovered(1)}
              onMouseLeave={() => setViewersHovered(0)}
              onClick={() => handleAddUsers(1)}
              className="text-bw/70 bg-row-bg1/70 flex h-[1.6rem] w-full cursor-pointer items-center justify-between rounded-lg px-1 text-xs font-semibold select-none hover:bg-white/20"
            >
              {" "}
              {viewersHovered ? (
                <span className="text-bw/80 flex-none"> Add viewers?</span>
              ) : (
                <span>
                  {" "}
                  viewers
                  <span className="ml-2">
                    {addUsers.viewers?.split(",")?.length - 1}{" "}
                  </span>
                </span>
              )}
              <span
                className={`flex size-4 cursor-pointer items-center rounded-[5px] ${viewersHovered && "bg-green-600 shadow-sm"} border-bw/50 border-2`}
              >
                <PlusIcon className="size-6 drop-shadow-xs transition-all hover:scale-95" />
              </span>
            </header>
            <div className="h-[85%] overflow-x-hidden overflow-y-auto">
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
          </div>
          <Separator orientation="vertical" />
          <div className="text-bw/70 h-full w-1/2">
            <header
              onMouseEnter={() => setEditorsHovered(1)}
              onMouseLeave={() => setEditorsHovered(0)}
              onClick={() => handleAddUsers(2)}
              className="text-bw/70 bg-row-bg1/80 hover:bg-row-bg1 flex h-[1.5rem] w-full cursor-pointer items-center justify-between rounded-lg px-1 text-xs font-semibold select-none"
            >
              {editorsHovered ? (
                <span className="text-bw/80 flex-none">Add Editors?</span>
              ) : (
                <span>
                  {" "}
                  Editors
                  <span className="ml-2">
                    {" "}
                    {addUsers.editors?.split(",")?.length - 1}{" "}
                  </span>
                </span>
              )}
              <span
                className={`flex size-4 cursor-pointer items-center rounded-[5px] ${editorsHovered && "bg-green-600 shadow-sm"} border-bw/50 border-2`}
              >
                <PlusIcon className="size-6 drop-shadow-xs transition-all hover:scale-95" />
              </span>
            </header>
            <div className="h-[85%] overflow-x-hidden overflow-y-auto">
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
          </div>
        </section>
        <section className="text-bw/70 bg-bw/10 h-full w-1/2 overflow-hidden rounded-md p-1 pb-2">
          <header className="text-bw/70 bg-row-bg1 flex h-[1.6rem] items-center rounded-lg px-1 text-xs font-semibold select-none">
            {" "}
            Columns: <span className="ml-1"> {createTbCol.length}</span>{" "}
          </header>
          <main
            ref={liveColRef}
            className="my-0.5 flex h-[82%] flex-col-reverse overflow-y-auto"
          >
            {createTbCol.length > 0 &&
              createTbCol.map((a, i) => (
                <div
                  key={i + 3}
                  className={`flex h-[1.6rem] w-full items-center justify-between hover:bg-white/20 ${i % 2 == 0 ? "bg-row-bg1/20" : "bg-row-bg1/10"} bg-black`}
                >
                  <UserTag
                    name={a.name}
                    className="text-sm"
                    delFn={checkOrDelCol}
                  />
                  <div className="flex gap-1">
                    {" "}
                    {keys.map((b, j) => (
                      <KeysButton
                        key={j + i}
                        boxSize={4}
                        abbrev={true}
                        handleChange={onKeysChange}
                        colName={a.name}
                        name={b}
                        n={j}
                        findPrimary={findPrimary}
                        value={
                          j == 0
                            ? (a.primary ?? 0)
                            : j == 1
                              ? (a.unique ?? 0)
                              : j == 2
                                ? (a.ai ?? 0)
                                : j == 3
                                  ? (a.notnull ?? 0)
                                  : 0
                        }
                        setAiErr={setErr}
                        errDialogHandler={errDialogHandler}
                        pressAnim={pressAnim}
                        type={a.type}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </main>
        </section>
      </main>{" "}
    </div>
  );
}

type errDialog = {
  errDialog: errSetter;
};

export function ErrorDialog({ errDialog }: errDialog) {
  if (errDialog == null) return;
  const {
    blurHandler, //id: ErrorBackDrop
    header,
    body,
    button1Press,
    button2Press,
    pressAnim,
    primaryCol,
    success,
    deleteColfn,
    delColName,
    delPrifn,
  } = errDialog;

  // useEffect(() => {
  //   console.log("pressAnim sent to error Dialog: ", pressAnim);
  //   console.log("button1press sent to error Dialog: ", button1Press);
  // }, [pressAnim]);

  function executeFn(e: any, i: number) {
    if (i == 1) {
      blurHandler(e, button1Press);
      if (delPrifn) delPrifn("del");
    } // if theres ever a need for 2 you'd need to categorize fn too.
    if (i == 2) {
      blurHandler(e, button2Press);
      if (delColName && deleteColfn) {
        deleteColfn(delColName, "del");
      }
    }
  }

  return (
    <div
      onClick={(e) => blurHandler(e)}
      id="ErrorBackdrop"
      className={`${!body && "scale-0"} absolute z-5 flex h-[100%] w-[200%] items-center backdrop-blur-xs transition-all duration-300`}
    >
      <div
        className={`bg-main-fg relative left-[2%] flex h-[80%] w-[15rem] flex-col items-center justify-center gap-3 overflow-auto rounded-[5px] border-2 p-2 text-sm shadow-[20px] ring-2 ring-red-600 md:left-[10rem] md:w-[20rem]`}
      >
        {header && (
          <section className="flex flex-col items-center">
            <span className={`${success ? "" : "text-destructive"}flex-none`}>
              {header}
            </span>
            {primaryCol && (
              <UserTag name={primaryCol} className="bg-blue-700/20" />
            )}
          </section>
        )}
        <section className="flex h-1/2 w-full flex-col items-center justify-center gap-3 text-center font-bold select-none">
          <div className="text-bw/70">{body}</div>
          <div className="h-fit w-1/2">
            <Button
              onClick={(e) => executeFn(e, 1)}
              type="button"
              className={`${pressAnim == button1Press && "scale-95"} hover h-[2rem] cursor-pointer ${button2Press ? "w-1/2 rounded-l-full" : "w-full rounded-full"} bg-green-300/70 hover:bg-green-500`}
            >
              {button1Press}
            </Button>
            {button2Press && (
              <Button
                onClick={(e) => executeFn(e, 2)}
                type="button"
                className={`${pressAnim == button2Press && "scale-95"} hover h-[2rem] w-1/2 cursor-pointer rounded-r-full bg-red-300/70 hover:bg-red-600`}
              >
                {button2Press}
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
