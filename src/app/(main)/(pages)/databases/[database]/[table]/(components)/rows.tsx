"use client";
import {
  PiFileTxtFill,
  PiMicrosoftPowerpointLogoFill,
  PiMicrosoftWordLogoFill,
} from "react-icons/pi";
import Index from "@/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { rcDim, useRcConfig } from "@/app/(main)/layoutcontext";
import { DateTimePicker } from "@/components/ui/datetimepicker";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useNotifyContext } from "@/app/dialogcontext";
import { FaDownload, FaFilePdf, FaFileWord } from "react-icons/fa";
import { AudioLines, FileArchive } from "lucide-react";
import { useButtonAnim } from "@/components/count";
import { MdCancel, MdSlowMotionVideo } from "react-icons/md";
import { RiFileExcel2Line } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";
import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { rcData, useFetchContext } from "@/app/(main)/(pages)/fetchcontext";
import { QuickActions } from "../../../(components)/quickactions";
import { updateTableData } from "@/lib/actions";
import UserTag from "@/components/usertag";

type rowType = {
  scrolling: (e: any) => void;
  tbPath: string;
  ref: React.RefObject<HTMLDivElement | null>;
  canEdit: boolean;
  nRc: boolean;
  thisRc: rcData;
};

const hSizes = { lg: "[10rem]", md: "[6rem]", sm: "[3rem]" };
const wSizes = { lg: "[16rem]", md: "[10.75rem]", sm: "[5.5rem]" };
const imgSz = { lg: "[4rem]", md: "[3rem]", sm: "[2rem]" };

export function hVal(rcSize: rcDim, max?: "max") {
  if (rcSize.h == "lg") return max ? "max-h-[10rem]" : "min-h-[10rem]";
  if (rcSize.h == "md") return max ? "max-h-[6rem]" : "min-h-[6rem]";
  if (rcSize.h == "sm") return max ? "max-h-[3rem]" : "min-h-[3rem]";
}

export function imgSize(rcSize: rcDim) {
  return `size-${imgSz[rcSize.h || "sm"]}`;
}

export function wVal(rcSize: rcDim) {
  if (rcSize.w == "lg") return `min-w-[16rem] max-w-[16rem]`;
  if (rcSize.w == "md") return `min-w-[10.75rem] max-w-[10.75rem]`;
  if (rcSize.w == "sm") return `min-w-[5.5rem] max-w-[5.5rem]`;
}

export function Rows({
  thisRc,
  scrolling,
  tbPath,
  ref,
  canEdit,
  nRc,
}: rowType) {
  // const [rcSelections, setRcSelections] = useState({} as selectedRc);
  const { selectedRc, setSelectedRc } = useSelection();
  const { rc } = useFetchContext();
  const rcSchema = thisRc?.rcHeader?.reduce(
    (agg, col) => {
      col.colName != "ID" && (agg[col.colName] = col.type);
      return agg;
    },
    {} as Record<string, string>,
  );
  const rcs = selectedRc.find((p) => p.path == tbPath);

  // useEffect(() => {
  //   const currUA = uAccess.tb?.find((a) => a.tbPath == tbPath);
  //   if (currUA?.edit) setCanEdit(true);
  //   else setCanEdit(false);
  // }, []);

  function rcClicked(thisRow: string) {
    setSelectedRc((p) => {
      let rcI = 0;
      const thisRc = p?.find((a, i) => {
        rcI = i;
        return a.path == tbPath;
      });
      if (thisRc) {
        if (thisRc.rows.length > 1 || !thisRc.rows.includes(thisRow)) {
          thisRc.rows = thisRc.rows.filter((p) => p !== thisRow);
          return [
            ...p.filter((r) => r.path !== tbPath),
            { ...thisRc, rows: [thisRow] },
          ];
        } else
          return [
            ...p.filter((r) => r.path !== tbPath),
            { ...thisRc, rows: [] },
          ];
      } else {
        return [...p, { path: tbPath, rows: [thisRow] }];
      }
    });
  }

  function rcSelected(thisRow: string) {
    setSelectedRc((p) => {
      let rcI = 0;
      const thisRc = p?.find((a, i) => {
        a.path == tbPath && (rcI = i);
        return a.path == tbPath;
      });
      if (thisRc) {
        if (thisRc.rows.includes(thisRow)) {
          return [
            ...p.slice(0, rcI),
            { ...thisRc, rows: thisRc.rows.filter((a) => a !== thisRow) },
            ...p.slice(rcI + 1),
          ].filter(Boolean);
        } else {
          return [
            ...(p || []),
            { ...thisRc, rows: [...thisRc.rows, thisRow] },
          ].filter(Boolean);
        }
      }
      return [...(p || []), { path: tbPath, rows: [thisRow] }].filter(Boolean);
    });
  }

  return (
    <div
      onScroll={scrolling}
      id="rowScroll"
      ref={ref}
      className={`${nRc && "mt-[5rem]"} relative flex h-full flex-col overflow-auto transition-all`}
    >
      {thisRc?.rcRows?.map((a, i) => {
        const thisRow = JSON.stringify(Object.entries(a).slice(0, 2));
        return (
          <div
            key={i}
            onClick={() => rcClicked(thisRow)}
            className={`group ${i % 2 == 0 ? "bg-row-bg1" : "bg-row-bg1/50"} hover:bg-bw/20 relative my-0.5 flex min-h-[3rem] w-fit min-w-full`}
          >
            <Index
              i={i + 1}
              morph={(rcs?.rows.length || 0) > 1 ? "selected" : undefined}
              className="sticky w-[2rem]"
              size={6}
              selected={rcs?.rows.includes(thisRow)}
            />
            <div
              className={`${rcs?.rows.includes(thisRow) ? "bg-bw/30 ring-2" : ""} ring-shadow-bw/50 ml-[0.1rem] flex h-full w-fit items-center overflow-hidden rounded-xl p-1`}
            >
              {Object.entries(a).map((b, j) => {
                if ((b[0] as string) !== "ID")
                  return (
                    <RowItem
                      key={j}
                      colType={(rcSchema && rcSchema[b[0]]) || typeof b[1]}
                      tbPath={tbPath}
                      where={thisRow}
                      // nRow={i}
                      nCol={j}
                      ri={b}
                      canEdit={canEdit}
                    />
                  ); //filter out ID column
              })}
            </div>
            <QuickActions
              action1={`${canEdit ? "Delete" : ""}`}
              fn1={() => {}}
              hoverColor1={canEdit ? "red" : `green`}
              action2="Select"
              fn2={() => rcSelected(thisRow)}
              hoverColor2="brown"
            />
          </div>
        );
      })}
    </div>
  );
}

type file = {
  fileData: Uint8Array | ArrayBuffer;
  fileName: string;
  fileType: string;
};
type val = string | boolean | number | null | Date | file | File;
type rowItem = {
  ri?: [string, val];
  nCol: number;
  // nRow: number;
  where?: string; //"[col,val], [col,val]"
  tbPath: string;
  canEdit?: boolean;
  colType: string;
  uData?: string;
  reset?: number;
  isDefault?: boolean;
  field?: ControllerRenderProps<
    {
      [x: string]: any;
    },
    string
  >;
};

export function RowItem({
  ri,
  nCol,
  where,
  tbPath,
  canEdit,
  colType,
  reset,
  isDefault,
  field,
  uData,
}: rowItem) {
  //import schema to get col types to handle layout for instances where val is null
  const [expandCard, setExpandCard] = useState(false);
  const [itemHovered, setItemHovered] = useState(false);
  const [val, setVal] = useState<val>(null);
  const [fileDrag, setFileDrag] = useState(false);
  const { editMode } = useRcConfig();
  const { rcSize, setRcSize } = useRcConfig();
  const { setNotify } = useNotifyContext();
  const initRender = useRef(true);
  const valChanged = useRef(false);
  const { pressAnim, setPressAnim } = useButtonAnim();

  function isFile(val: any): val is file {
    return (
      val &&
      typeof val == "object" &&
      "fileData" in val &&
      "fileName" in val &&
      "fileType" in val
    );
  }

  function isDate(val: any): val is Date {
    return val instanceof Date && !isNaN(val.getTime());
  }

  useEffect(() => {
    if (isDefault && colType.includes("timestamp")) setVal(new Date());
    else if (ri) setVal(ri[1]);

    console.log("ri from rowItem: ", ri);
    console.log("isDefault from rowItem: ", isDefault);
    console.log("colType from rowItem: ", colType);
  }, []);

  useEffect(() => {
    if (initRender.current) {
      initRender.current = false;
      return;
    }
    field?.onChange(val);
    valChanged.current = true;
  }, [val]);

  function delVal() {
    setVal(null);
  }

  useEffect(() => {
    reset && delVal();
  }, [reset]);

  function clickedOut() {
    if (field) return;
    if (canEdit && editMode && valChanged && where && ri) {
      (async () => {
        const { error } = await updateTableData(tbPath, where, ri[0], val);
        error && setNotify({ message: error, danger: true });
        //can put a green indicator for updated rows -- pulse green on the borders
        valChanged.current = false;
      })();
    }
  }

  function itemDeleted() {
    if ((canEdit && editMode) || field) {
      setVal(null);
      clickedOut();
    }
  }

  function fileDropped(e: React.DragEvent<HTMLDivElement>) {
    const file = e.dataTransfer.files[0];
    if (file) {
      if (field) {
        setVal(file);
        return;
      }
      file.arrayBuffer().then((b) => {
        setVal({ fileData: b, fileName: file.name, fileType: file.type });
      });
    }
  }

  function uploadClicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (field) {
        setVal(file);
        return;
      }
      file.arrayBuffer().then((b) => {
        setVal({ fileData: b, fileName: file.name, fileType: file.type });
      });
    }
  }

  function valDefined(val: val) {
    return val != undefined && val != null;
  }
  return (
    <div
      className={`${nCol % 2 == 0 ? "bg-tb-row2/50" : "bg-tb-row2/5"} ${expandCard && !field ? "" : `${hVal(rcSize, "max")}`} ${hVal(rcSize)} ${wVal(rcSize)} flex items-center justify-center p-0.5`}
    >
      <div
        id="row item"
        title={ri && ri[1]?.toString()}
        onClick={() => {
          canEdit && editMode && !field && setExpandCard((p) => !p);
        }}
        onMouseEnter={() => setItemHovered(true)}
        onMouseLeave={() => setItemHovered(false)}
        className={`group/x w-full ${expandCard && !field ? "h-fit min-h-full bg-green-800/50" : "h-full min-h-full hover:bg-green-700/10 hover:shadow-black"} shadow-shadow-bw relative flex h-full items-center justify-center overflow-hidden px-1 text-sm shadow-sm`}
      >
        {colType == "file" ? (
          isFile(val) ? (
            <RenderFile
              onBlur={field?.onBlur || clickedOut}
              editMode={editMode}
              tabIndex={0}
              file={val}
              expandCard={expandCard}
              fileHovered={itemHovered}
            />
          ) : (
            <div
              onDragOver={() => setFileDrag(true)}
              onDragLeave={() => setFileDrag(false)}
              onClick={() => setPressAnim("uplc")}
              onDrop={fileDropped}
              tabIndex={0}
              onBlur={field?.onBlur || clickedOut}
              className={`${fileDrag ? "animate-logoExit bg-red-300/20 shadow-xs" : "bg-bw/10 shadow-sm"} ${pressAnim.includes("uplc") && "scale-95"} rounded-xl transition-all`}
            >
              <Label>
                {fileDrag ? "Drop file" : "Click or drag file"}
                <Input onChange={uploadClicked} type="file" />
              </Label>
            </div>
          )
        ) : colType.includes("timestamp") || val instanceof Date ? (
          <div onClick={() => setPressAnim("nrcdt")} className="">
            <DateTimePicker
              onBlur={field?.onBlur || clickedOut}
              tabIndex={0}
              value={val as Date}
              onChange={(e) => setVal(e as Date)}
              hourCycle={12}
              clicked={pressAnim == "nrcdt"}
              granularity="minute"
              disabled={(!editMode && !field) || isDefault}
              className={`${!editMode && !field && "!opacity-80"} my-1 h-fit`}
            />
          </div>
        ) : colType == "boolean" ? (
          <Button
            onBlur={field?.onBlur || clickedOut}
            tabIndex={0}
            type="button"
            onClick={() => {
              if ((canEdit && editMode) || field) {
                if (typeof val != "boolean") {
                  setVal(true);
                } else setVal(!val);
                setPressAnim("bl");
              }
            }}
            disabled={!editMode && !field}
            className={`text-bw/80 my-[0.4rem] flex h-[1.7rem] w-fit min-w-[3.5rem] rounded-xl !opacity-70 shadow-xs select-none hover:shadow-sm ${((canEdit && editMode) || field) && "cursor-pointer"} ${pressAnim.includes("bl") && "scale-95 shadow-none"} ${val == false ? "bg-red-700 hover:bg-red-500/80" : valDefined(val) ? "bg-green-700 hover:bg-green-500/80" : "bg-neutral-600/70 hover:bg-neutral-600/80"}`}
          >
            <div
              className={`text-[13px] ${val == undefined && "text-bw/70"} !text-bw`}
            >
              {typeof val == "boolean" ? val.toString() : "-"}
            </div>
          </Button>
        ) : isDefault ? (
          <UserTag
            name={uData?.split("&")[1] || ""}
            title={uData?.split("&")[2]}
          />
        ) : (
          <div id="text vals" className="flex h-full w-full">
            <p
              contentEditable={editMode}
              tabIndex={0}
              onBlur={clickedOut}
              onInput={(e) => setVal(e.currentTarget.textContent)}
              className={`${expandCard ? "h-fit break-all whitespace-break-spaces" : hVal(rcSize, "max") + " truncate"} ${hVal(rcSize)} flex h-full w-full text-sm`}
            >
              {val ? val.toString() : "-"}
            </p>
          </div>
        )}
        {editMode &&
          canEdit &&
          itemHovered &&
          (isFile(val) || typeof val == "string" || typeof val == "number") && (
            <div
              id="delete"
              onClick={() => {
                setPressAnim("deled");
                itemDeleted();
              }}
              className={`${pressAnim.includes("deled") && "scale-95 shadow-none"} hover:bg-bw/10 absolute top-0 right-0 size-5 rounded-full backdrop-blur-3xl`}
            >
              {" "}
              <MdCancel className="size-4 group-hover/x:fill-red-600/80" />
            </div>
          )}
      </div>
    </div>
  );
}

type renderFile = {
  tabIndex: number;
  file: file;
  editMode?: boolean;
  expandCard?: boolean;
  onBlur: (e?: any) => void;
  fileHovered?: boolean;
};

function RenderFile({
  file,
  editMode,
  expandCard,
  onBlur,
  fileHovered,
  tabIndex,
}: renderFile) {
  const { fileData, fileType, fileName } = file;
  const { rcSize } = useRcConfig();
  const { setPressAnim, pressAnim } = useButtonAnim();
  const urlRef = useRef("");

  // const types = [
  //   "image/jpeg",
  //   "image/png",
  //   "image/gif",
  //   "application/pdf",
  //   "text/plain",
  //   "text/html video/mp4",
  //   "video/webm",
  //   "audio/mpeg",
  //   "audio/wav",
  //   "application/msword",
  //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //   "application/vnd.ms-excel",
  //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   "application/zip",
  //   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  //   "application/vnd.ms-powerpoint",
  // ];

  const renderTypes = [
    "image/",
    "text/",
    "video/",
    "audio/",
    "application/pdf",
  ];

  const createBlobUrl = useCallback(() => {
    const blob = new Blob([fileData], { type: fileType });
    const url = URL.createObjectURL(blob);
    return url;
  }, [fileName, fileData]);

  useEffect(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    const url = createBlobUrl();
    urlRef.current = url;
    return () => URL.revokeObjectURL(urlRef.current);
  }, [createBlobUrl, fileData]);

  const fileClicked = useCallback(() => {
    if (editMode) return;
    const url = createBlobUrl();
    if (url) {
      if (renderTypes.some((p) => fileType.startsWith(p)))
        window.open(url, "_blank");
      else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }, [fileData]);

  return (
    <div
      onClick={() => {
        setPressAnim("fbtn");
        fileClicked();
      }}
      tabIndex={tabIndex}
      onBlur={onBlur}
      className={`flex w-full ${pressAnim.includes("fbtn") ? "scale-95" : "shadow-sm"} hover:bg-bw/5 relative items-center justify-center rounded-xl transition-all`}
    >
      {fileHovered ? (
        <FaDownload
          size={17}
          className={`${pressAnim.includes("ftbn") && "translate-y-1"} fill-blue-700/80 transition-all hover:fill-blue-700`}
        />
      ) : fileType.startsWith("image") ? (
        <Image
          src={urlRef.current}
          alt={fileName}
          className={`${imgSize(rcSize)} ring-bw/20 ring-1`}
        />
      ) : fileType.startsWith("application/pdf") ? (
        <FaFilePdf className="fill-red-500" size={17} />
      ) : fileType.startsWith("text") ? (
        <PiFileTxtFill size={17} />
      ) : fileType.startsWith("audio") ? (
        <AudioLines size={17} />
      ) : fileType.startsWith("video") ? (
        <MdSlowMotionVideo size={17} className="stroke-red-500" />
      ) : fileType.includes("/msword") ||
        fileType.includes("officedocument.wordprocessingml.document") ? (
        <PiMicrosoftWordLogoFill size={17} className="fill-blue-600" />
      ) : fileType.includes("officedocument.spreadsheetml.sheet") ||
        fileType.includes("vnd.ms-excel") ? (
        <RiFileExcel2Line size={17} className="fill-green-500" />
      ) : fileType.includes("openxmlformats-officedocument.presentationml") ||
        fileType.includes("vnd.ms-powerpoint") ? (
        <PiMicrosoftPowerpointLogoFill size={17} className="fill-orange-600" />
      ) : (
        <FileArchive size={17} />
      )}
      <p
        className={`bg-bw/70 hover:bg-bw/80 text-sm ${!expandCard && "truncate"} `}
      >
        {" "}
        {fileName}{" "}
      </p>
      {/* <div 
      onClick={()=>handleClick("del")}
      className="hover:bg-bw/20 absolute top-0 right-0 size-5 rounded-full">
        {" "}
        <MdCancel className="size-4 group-hover/x:fill-red-600/80" />
      </div> */}
    </div>
  );
}
