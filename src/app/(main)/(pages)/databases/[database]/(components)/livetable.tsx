"use client";
import { useAddUsers } from "@/app/dialogcontext";
import { useButtonAnim } from "@/components/count";
import { KeysButton } from "@/components/keysbutton";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserTag from "@/components/usertag";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { useSelection } from "../../../selectcontext";

type liveTable = {
  findPrimary: (del?: string) => boolean;
  setErr: (e: any) => void;
  checkOrDelCol: (colName: string, del?: string) => void;
  submitting: boolean;
  dbName: string;
  tbName?: string;
  //   errDialogHandler: (e: any, press?: string) => void;
};

export function LiveTable({
  findPrimary,
  setErr,
  checkOrDelCol,
  submitting,
  dbName,
  tbName,
}: liveTable) {
  const { createTbCol, setCreateTbCol, createTbMeta, setCreateTbMeta } =
    useSelection();
  const { addUsers, setAddUsers } = useAddUsers();

  const { pressAnim, setPressAnim } = useButtonAnim();
  const keys = ["Primary", "Unique", "AI", "Not null"];
  const [viewersHovered, setViewersHovered] = React.useState(0);
  const [editorsHovered, setEditorsHovered] = React.useState(0);
  const [nameVal, setNameVal] = React.useState<string | null>("");
  const [descVal, setDescVal] = React.useState<string | undefined>(undefined);
  // const [allUsers, setAllusers] = useState([] as allUsers[]);
  const [users, setUsers] = React.useState({
    editors: [] as user,
    viewers: [] as user,
  });
  const liveColRef = React.useRef<HTMLElement>(null);

  type user = {
    title: string;
    firstname: string;
    id: string;
  }[];

  React.useEffect(() => {
    const editors: user = [];
    const viewers: user = [];

    if (addUsers.editors) {
      // console.log("addUsers.editors: ", addUsers.editors);
      const edArr = addUsers.editors.split(",").filter(Boolean);
      edArr.forEach((a) => {
        const u = a.split("&");
        editors.push({ id: u[0], title: u[1], firstname: u[2] });
      });
    }
    if (addUsers.viewers) {
      // console.log("addUsers.viewers: ", addUsers.viewers);
      const edArr = addUsers.viewers?.split(",").filter(Boolean);
      edArr.forEach((a) => {
        const u = a.split("&");
        viewers.push({ id: u[0], title: u[1], firstname: u[2] });
      });
    }

    setUsers({ editors: editors, viewers: viewers });
  }, [addUsers.editors, addUsers.viewers]);

  React.useEffect(() => {
    liveColRef.current && (liveColRef.current.scrollTop = 0);
    // liveColRef.current.scrollHeight);
    console.log(
      "liveColRef.current?.scrollHeight: ",
      liveColRef.current?.scrollHeight,
      "\n liveColRef.current?.scrollTop: ",
      liveColRef.current?.scrollTop,
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
    const ntbPath = dbName + (tbName || "/New Table");
    if (n == 1) {
      setAddUsers((p) => {
        if (p.type && p.type != ntbPath) {
          console.log(
            "createTb, handleAddUsers, dbName + /New Table : ",
            ntbPath,
          );
          return {
            type: ntbPath,
            category: "viewers",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: ntbPath,
            category: "viewers",
          };
        }
      });
    }
    if (n == 2) {
      setAddUsers((p) => {
        if (p.type && p.type != ntbPath) {
          return {
            type: ntbPath,
            category: "editors",
            editors: "",
            viewers: "",
          };
        } else {
          return {
            ...p,
            type: ntbPath,
            category: "editors",
          };
        }
      });
    }
  }

  function handleTbNameChanged() {
    nameVal && setCreateTbMeta((p) => ({ ...p, tbName: nameVal }));
  }

  function handleDescChanged() {
    descVal && setCreateTbMeta((p) => ({ ...p, desc: descVal }));
  }

  React.useEffect(() => {
    if (createTbMeta.tbName != nameVal) setNameVal(createTbMeta.tbName);
    else if (createTbMeta.desc != descVal) setDescVal(createTbMeta.desc);
  }, [createTbMeta.tbName, createTbMeta.desc]);

  //: React.FormEvent<HTMLDivElement>

  return (
    <div className="bg-sub-bg absolute right-0 z-4 hidden h-[14rem] max-h-fit w-[30rem] flex-col gap-1 rounded-[5px] border-3 border-green-700/40 p-1 py-2 shadow-md xl:flex">
      {submitting && <Loading />}
      <header className="bg-tb-row2/50 flex h-[3.5rem] w-full gap-1 rounded-2xl">
        <div
          onInput={(e) => setNameVal(e.currentTarget.textContent)}
          contentEditable
          tabIndex={0}
          onBlur={handleTbNameChanged}
          className="scrollbar-custom flex h-full w-fit min-w-1/3 overflow-y-scroll p-1 text-[1rem] font-medium break-words whitespace-break-spaces"
        >
          {" "}
          {nameVal}{" "}
        </div>
        <Separator orientation="vertical" />
        <div
          onInput={(e) => setDescVal(e.currentTarget.textContent || undefined)}
          tabIndex={0}
          onBlur={handleDescChanged}
          contentEditable
          className="min-w-1/3 overflow-y-auto scroll-smooth py-1 text-[0.7rem] font-medium break-words whitespace-normal"
        >
          {" "}
          {descVal}
        </div>
      </header>
      <main className="relative flex h-[9.2rem] w-full">
        <section className="bg-row-bg1/20 flex h-full w-1/2 gap-1 rounded-md p-1 pb-2">
          <div className="text-bw/70 h-full w-1/2">
            <header
              onMouseEnter={() => setViewersHovered(1)}
              onMouseLeave={() => setViewersHovered(0)}
              onClick={() => handleAddUsers(1)}
              className="text-bw/70 bg-row-bg1/70 flex h-[1.5rem] w-full cursor-pointer items-center justify-between rounded-lg px-1 text-xs font-semibold select-none hover:bg-white/20"
            >
              {" "}
              {viewersHovered ? (
                <span className="text-bw/80 flex-none"> Add viewers?</span>
              ) : (
                <span>
                  {" "}
                  viewers
                  <span className="ml-2">
                    {addUsers.viewers?.split(",")?.length - 1 || ""}{" "}
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
                    ttl={a.title}
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
                    {addUsers.editors?.split(",")?.length - 1 || ""}{" "}
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
                    ttl={a.title}
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
                    delFn={a.type != 6 ? checkOrDelCol : () => {}} // change this to a dialog box later?
                    cap={12}
                  />
                  <div className="flex gap-1">
                    {a.type == 6 ? (
                      <KeysButton
                        boxSize={4}
                        abbrev
                        colName={a.name}
                        name="Default"
                        disabled
                        n={5}
                        type={6}
                        value={1}
                      />
                    ) : (
                      keys.map((b, j) => (
                        //set default "D" icon
                        <KeysButton
                          key={j + i}
                          boxSize={4}
                          abbrev
                          handleChange={onKeysChange}
                          colName={a.name}
                          name={b}
                          n={j}
                          findPrimary={findPrimary}
                          value={
                            j == 0
                              ? a.primary || 0
                              : j == 1
                                ? a.unique || 0
                                : j == 2
                                  ? a.ai || 0
                                  : j == 3
                                    ? a.notnull || 0
                                    : 0
                          }
                          setAiErr={setErr}
                          type={a.type}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
          </main>
        </section>
      </main>{" "}
    </div>
  );
}

export type errSetter = {
  //   blurHandler: (e: any, p?: string) => void;
  header?: string;
  body: string;
  button1Press: string;
  button2Press?: string;
  headerCol?: string;
  success?: boolean;
  deleteColfn?: (name: string, del?: string) => void;
  delColName?: string;
  delPrifn?: (del: string) => void;
  alterTb?: boolean;
} | null;

type errDialog = {
  errDialog: errSetter;
  setErrDialog: React.Dispatch<React.SetStateAction<errSetter>>;
};

export function ErrorDialog({ errDialog, setErrDialog }: errDialog) {
  const { pressAnim, setPressAnim } = useButtonAnim();
  if (errDialog == null) return;
  const {
    header,
    body,
    button1Press,
    button2Press, //optionally triggers deleteColFn
    headerCol,
    success,
    deleteColfn,
    delColName,
    delPrifn,
    alterTb,
  } = errDialog;

  function executeFn(e: any, i: number) {
    if (i == 1) {
      setPressAnim(button1Press);
      if (delPrifn) delPrifn("del");
      clickOut(e);
    } // if theres ever a need for 2 you'd need to categorize fn too.
    if (i == 2) {
      button2Press && setPressAnim(button2Press);
      if (delColName && deleteColfn) deleteColfn(delColName, "del");
      clickOut(e);
    }
  }
  function clickOut(e: React.MouseEvent<HTMLElement>) {
    const currId = (e.target as HTMLElement).id;
    if (currId == "ErrorBackdrop") setErrDialog(null);
  }

  return (
    <div
      onClick={clickOut}
      id="ErrorBackdrop"
      className={`${!body && "scale-0"} absolute z-5 flex h-[100%] ${alterTb ? "w-full justify-center" : "w-[200%]"} items-center backdrop-blur-xs transition-all`}
    >
      <div
        className={`bg-main-fg relative ${alterTb ? "w-[15rem]" : "left-[2%] w-[15rem]"} flex h-[80%] flex-col items-center justify-center gap-3 overflow-auto rounded-[5px] border-2 p-2 text-sm shadow-[20px] ring-2 ring-red-600 md:left-[10rem] md:w-[20rem]`}
      >
        {header && (
          <section className="flex flex-col items-center">
            <span className={`${success ? "" : "text-destructive"}flex-none`}>
              {header}
            </span>
            {headerCol && (
              <UserTag name={headerCol} className="bg-blue-700/20" />
            )}
          </section>
        )}
        <section className="bg-bw/20 flex h-1/2 w-full flex-col items-center justify-center gap-3 rounded-2xl text-center font-bold shadow-sm select-none">
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
