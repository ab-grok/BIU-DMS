"use client";

import { useEffect, useRef, useState } from "react";
import { useButtonAnim } from "@/components/count";
import { useSelection } from "../../../selectcontext";
import { useRouter } from "next/navigation";
import Index from "@/components";
import { useAddUsers, useNotifyContext } from "@/app/dialogcontext";
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
import Loading from "@/components/loading";
import { KeysButton } from "@/components/keysbutton";
import { createTb } from "@/lib/server";
import { revalidate } from "@/lib/sessions";
import { ErrorDialog, errSetter, LiveTable } from "./livetable";

type tbType = {
  i: number;
  uData: string; //uid&ttl&fname
  db: string;
};

export default function CreateTb({ i, uData, db }: tbType) {
  const router = useRouter();
  const [cardClicked, setCardClick] = useState(false);
  const { setNotify } = useNotifyContext();
  const {
    create,
    setCreate,
    setCreated,
    selectedTb,
    setSelectedTb,
    createTbMeta,
    setCreateTbMeta,
    createTbCol,
    setCreateTbCol,
  } = useSelection();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { addUsers, setAddUsers } = useAddUsers();
  const [errDialog, setErrDialog] = useState({} as errSetter);
  const [typeChange, setTypeChange] = useState(0);
  const [cardHovered, setCardHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
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
    !selectedTb.includes("createNew") && setSelectedTb("createNew");
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
    const columns = createTbSchema.parse(values);
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

  useEffect(() => {
    document.addEventListener("keypress", handleKeyPress);

    function handleKeyPress(e: KeyboardEvent) {
      const active = document.activeElement;
      if (
        (active && (active as HTMLElement).isContentEditable) ||
        active?.tagName == "INPUT" ||
        active?.tagName == "TEXTAREA"
      ) {
        return;
      } else currColInput.current?.focus() || currDesc.current?.focus();
    }

    return () => document.removeEventListener("keypress", handleKeyPress);
  }, []);

  //for name check and independent delete
  function checkOrDelCol(colName: string, del?: string, file?: boolean) {
    let sameColFound = false;
    if (createTbCol.length)
      for (const [i, a] of createTbCol.entries()) {
        if (a.name.toLowerCase() == colName.toLowerCase()) {
          if (del) {
            setCreateTbCol((p) => p.filter((b, j) => j != i));
            sameColFound = true;
          } else {
            setErrDialog({
              button1Press: "No",
              button2Press: "Delete",
              body: "Delete previous",
              header: "There's a column with that name",
              deleteColfn: checkOrDelCol,
              delColName: colName,
            });
          }
          break;
        }
      }
    return sameColFound;
  }

  function tableSubmitted() {
    setSubmitting(true);
    if (!createTbMeta.tbName) {
      setErrDialog({
        body: "Table is empty.",
        button1Press: "Ok",
      });
      setSubmitting(false);
      return;
    } else if (createTbCol.length < 2) {
      setErrDialog({
        body: "You need at least two columns.",
        button1Press: "Ok",
      });
      setSubmitting(false);
      return;
    }

    const viewers = addUsers.viewers?.split(",").filter(Boolean);
    const editors = addUsers.editors?.split(",").filter(Boolean);

    const postTb = {
      columns: createTbCol,
      ...createTbMeta,
      dbName: db,
      viewers,
      editors,
      isPrivate: 1,
    }; //change isprivate?

    (async () => {
      // console.log(
      //   "in tableSubmitted's async before createTB, postTb: ",
      //   postTb,
      // );
      const { error } = await createTb(postTb);
      if (!error) {
        setNotify({
          message: "Table created!",
          danger: false,
        });
        resetCreateTb();
      } else
        setNotify({
          message: error,
          danger: true,
          exitable: true,
        });
      setSubmitting(false);
    })();
  }

  function resetCreateTb() {
    revalidate("tables", "all");
    setCreate("");
    // form.reset();
    setCreateTbMeta({ dbName: "", tbName: "", desc: "" });
    setCreateTbCol([]);

    setAddUsers((p) => ({
      ...p,
      type: "",
    }));
    setCreated((p) => ({ ...p, tb: createTbMeta.tbName }));
  }

  //error handller : primary found returns primary
  function findPrimary(del?: string) {
    console.log("first param from findPrimary: ", del);
    let priFound = false;
    if (createTbCol.length) {
      for (const [i, a] of createTbCol.entries()) {
        if (a.primary) {
          priFound = true;
          if (del) {
            setCreateTbCol((p) => {
              const newCols = [...p];
              newCols[i].primary = 0;
              return newCols;
            });
            console.log("Del executed");
            setValue("primary", 1);
            setErrDialog(null);
            return priFound;
          }
          setErrDialog({
            header: "A primary column exists!",
            body: "Use this instead?",
            button1Press: "Yes",
            button2Press: "No",
            headerCol: a.name,
            delPrifn: findPrimary,
          });
          break;
        }
      }
    }
    return priFound;
  }

  // function errDialogHandler(e: React.MouseEvent<HTMLElement>, press?: string) {
  //   console.log("press sent to  errDialogHandler: ", press);
  //   if (press) {
  //     console.log(" errDialogHandler pressAnim: ", pressAnim);
  //     setErrDialog(null);
  //     press == "yes" && findPrimary("del");
  //   }
  //   const currId = (e.target as HTMLElement).id;
  //   if (currId == "ErrorBackdrop") setErrDialog(null);
  // }

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
        className="sticky h-[14rem] w-[2.55rem] self-center group-hover/card:bg-green-900/70"
        size={6}
      />
      <div
        id="main"
        onClick={(e) => {
          handleCardClicked(e);
        }}
        className={`${selectedTb.includes("createNew") && "ring-2 ring-green-700/40"} border-sub-fg/50 items-center-2 bg-main-fg m-1 flex min-h-[10rem] gap-x-1 rounded-xl px-2 py-1 shadow-sm hover:ring-2`}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(colSubmitted)}
            className="relative flex"
          >
            <ErrorDialog errDialog={errDialog} setErrDialog={setErrDialog} />
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
                          tbSetter={setValue}
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
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Separator className="bg-bw/10" />
              <div className="relative h-fit w-full p-1">
                {submitting && <Loading />}
                <Button
                  type="submit"
                  onClick={() => setPressAnim("AddCol")}
                  className={` ${pressAnim == "AddCol" && "scale-95"} relative h-full w-1/2 cursor-pointer rounded-l-full bg-blue-600/50 shadow-xs select-none hover:bg-blue-700`}
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    tableSubmitted();
                    setPressAnim("SubmitTb");
                  }}
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
        checkOrDelCol={checkOrDelCol}
        submitting={submitting}
        dbName={db}
      />
    </div>
  );
}
