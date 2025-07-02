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
import { useConfirmDialog, useNotifyContext } from "@/app/dialogcontext";
import { FaDownload, FaFilePdf, FaFileWord } from "react-icons/fa";
import { AudioLines, FileArchive, FilePlus } from "lucide-react";
import { useButtonAnim } from "@/components/count";
import { MdCancel, MdSlowMotionVideo } from "react-icons/md";
import { RiFileExcel2Line } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";
import { useSelection } from "@/app/(main)/(pages)/selectcontext";
import { tbRcs, useFetchContext } from "@/app/(main)/(pages)/fetchcontext";
import { QuickActions } from "../../../(components)/quickactions";
import { deleteTableData, pgFile, updateTableData } from "@/lib/actions";
import UserTag from "@/components/usertag";

type rowType = {
  scrolling: (e: any) => void;
  tbPath: string;
  ref: React.RefObject<HTMLDivElement | null>;
  canEdit: boolean;
  nRc: boolean;
  thisTb: tbRcs;
  uData: string;
};

const hSizes = { lg: "[10rem]", md: "[6rem]", sm: "[3rem]" };
const wSizes = { lg: "[16rem]", md: "[10.75rem]", sm: "[5.5rem]" };
const imgSz = { lg: "[4rem]", md: "[3rem]", sm: "[2rem]" };

export function hVal(rcSize: rcDim, max?: "max") {
  if (rcSize.h == "lg") return max ? "max -h-[10rem]" : "min-h-[10rem]";
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
  thisTb,
  scrolling,
  tbPath,
  ref,
  canEdit,
  nRc,
  uData,
}: rowType) {
  // const [rcSelections, setRcSelections] = useState({} as selectedRc);
  const { selectedRc, setSelectedRc } = useSelection();
  const rcSchema = thisTb?.tbHeader?.reduce(
    (agg, col) => {
      col.colName != "ID" && (agg[col.colName] = col.type);
      return agg;
    },
    {} as Record<string, string>,
  );
  const rcs = selectedRc.find((p) => p.path == tbPath);
  const { setConfirmDialog } = useConfirmDialog();

  // useEffect(() => {
  //   const currUA = uAccess.tb?.find((a) => a.tbPath == tbPath);
  //   if (currUA?.edit) setCanEdit(true);
  //   else setCanEdit(false);
  // }, []);

  function rcClicked(thisRow: string) {
    setSelectedRc((p) => {
      let rcI = 0;
      const thisTb = p?.find((a, i) => {
        rcI = i;
        return a.path == tbPath;
      });
      if (thisTb) {
        if (thisTb.rows.length > 1 || !thisTb.rows.includes(thisRow)) {
          thisTb.rows = thisTb.rows.filter((p) => p !== thisRow);
          return [
            ...p.filter((r) => r.path !== tbPath),
            { ...thisTb, rows: [thisRow] },
          ];
        } else
          return [
            ...p.filter((r) => r.path !== tbPath),
            { ...thisTb, rows: [] },
          ];
      } else {
        return [...p, { path: tbPath, rows: [thisRow] }];
      }
    });
  }

  function rcSelected(thisRow: string) {
    setSelectedRc((p) => {
      let rcI = 0;
      const thisTb = p?.find((a, i) => {
        a.path == tbPath && (rcI = i);
        return a.path == tbPath;
      });
      if (thisTb) {
        if (thisTb.rows.includes(thisRow)) {
          return [
            ...p.slice(0, rcI),
            { ...thisTb, rows: thisTb.rows.filter((a) => a !== thisRow) },
            ...p.slice(rcI + 1),
          ].filter(Boolean);
        } else {
          return [
            ...(p || []),
            { ...thisTb, rows: [...thisTb.rows, thisRow] },
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
      {thisTb?.tbRows && thisTb.tbRows.length ? (
        thisTb?.tbRows?.map((a, i) => {
          const thisRow = JSON.stringify(Object.entries(a).slice(0, 2));
          return (
            <div
              key={i}
              onClick={() => rcClicked(thisRow)}
              className={`group ${i % 2 == 0 ? "bg-row-bg1" : "bg-row-bg1/50"} hover:bg-bw/10 relative my-0.5 flex min-h-[3rem] w-fit min-w-full`}
            >
              <Index
                i={i + 1}
                morph={(rcs?.rows.length || 0) > 1 ? "selected" : undefined}
                className="sticky w-[2rem]"
                size={6}
                selected={rcs?.rows.includes(thisRow)}
              />
              <div
                className={`${rcs?.rows.includes(thisRow) ? "bg-bw/5 ring-2" : ""} ring-shadow-bw/50 ml-[0.1rem] flex h-full w-fit items-center overflow-hidden rounded-xl p-1`}
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
                        isDefault={b[0] == "updated_at" || b[0] == "updated_by"}
                        uData={uData}
                      />
                    ); //filter out ID column
                })}
              </div>
              <QuickActions
                action1={`${canEdit ? "Delete" : ""}`}
                fn1={() =>
                  setConfirmDialog({
                    type: "row",
                    head: "Are you sure you want to",
                    action: "delete",
                    name: Object.values(a)[0]?.toString() || "this record",
                    confirmFn: () => deleteTableData(tbPath, thisRow),
                  })
                }
                hoverColor1={canEdit ? "red" : `green`}
                action2="Select"
                fn2={() => rcSelected(thisRow)}
                hoverColor2="brown"
              />
            </div>
          );
        })
      ) : (
        <div
          key={0}
          onClick={() => rcClicked("fillerRow")}
          className={`group bg-row-bg1 hover:bg-bw/20 relative my-0.5 flex min-h-[3rem] w-fit min-w-full`}
        >
          <Index
            i={0}
            className="sticky w-[2rem]"
            size={6}
            selected={rcs?.rows.includes("fillerRow")}
          />
          <div
            className={`${rcs?.rows.includes("fillerRow") ? "bg-bw/30 ring-2" : ""} ring-shadow-bw/50 ml-[0.1rem] flex h-full w-fit items-center overflow-hidden rounded-xl p-0`}
          >
            {thisTb?.tbHeader?.map((b, j) => {
              if (b.colName !== "ID")
                return (
                  <RowItem
                    key={j}
                    colType={b.type}
                    tbPath={tbPath}
                    // nRow={i}
                    nCol={j}
                    ri={[b.colName, ""]}
                    canEdit={false}
                  />
                ); //filter out ID column
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type file = {
  fileData: Uint8Array | ArrayBuffer | string;
  fileName: string;
  fileType: string;
  fileSize?: number;
};

type val = string | boolean | number | null | Date | file | pgFile;
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
  err?: string;
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
  err,
}: rowItem) {
  //import schema to get col types to handle layout for instances where val is null
  const [expandCard, setExpandCard] = useState(false);
  const [itemHovered, setItemHovered] = useState(false);
  const [val, setVal] = useState<val>(null);
  const isPgFileCount = useRef(0);
  const [fileDrag, setFileDrag] = useState(false);
  const { editMode } = useRcConfig();
  const { rcSize, setRcSize } = useRcConfig();
  const { setNotify } = useNotifyContext();
  const initRender = useRef(true);
  const valChanged = useRef(false);
  const { pressAnim, setPressAnim } = useButtonAnim();
  console.log("error state from RowItem, err: ", err);

  function isFile(val: any): val is file {
    return (
      val &&
      typeof val == "object" &&
      "fileData" in val &&
      "fileName" in val &&
      "fileType" in val
    );
  }

  function isPgFile(val: any): val is pgFile {
    const v = JSON.parse(val);
    console.log("v[2] from pg: ", v[2]);
    console.log("isPgFileCount :", isPgFileCount.current);
    // console.log("v from pg: ", v);

    return v && Array.isArray(v) && v[2] == "string" && v[2].includes("/");
  }

  useEffect(() => {});
  function isDate(val: any): val is Date {
    return val instanceof Date && !isNaN(val.getTime());
  }

  function hexToUint8Array(hex: string) {
    if (hex.startsWith("\\\\x")) hex = hex.slice(3);
    if (hex.startsWith("\\x")) hex = hex.slice(2);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  useEffect(() => {
    if (isDefault && colType.includes("timestamp")) setVal(new Date());
    else if (ri && ri[1]) {
      console.log("in RowItem's useEffect before isPgFile");
      if (isPgFile(ri[1])) {
        console.log("~~~~~~fileData: ", ri[1][2]);
        console.log(
          "~~~~~~fileData.indexof(`x`): ",
          (ri[1][1] as string).indexOf(`x`),
        );

        // const fileFromHex = hexToUint8Array(ri[1].fileData);
        // // Usage:
        // const pgHex = "\x89504e470d0a1a0a0000000d49484452000003840000038";
        // const uint8 = hexToUint8Array(pgHex);
        // // If you need an ArrayBuffer:
        // const arrayBuffer = uint8.buffer;
        return;
      }
      setVal(ri[1]);
    }

    console.log("canEdit: ", canEdit, "editMode: ", editMode);
    console.log("ri from rowItem: ", ri);
    // console.log("isDefault from rowItem: ", isDefault);
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
    if (canEdit && editMode && valChanged.current && where && ri) {
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

  async function fileDropped(e: React.DragEvent<HTMLDivElement>) {
    const file = e.dataTransfer.files[0];
    if (file) {
      const data = await file.arrayBuffer();
      setVal({
        fileData: data,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    }
  }

  async function uploadClicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const data = await file.arrayBuffer();
      setVal({
        fileData: data,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      //   if (field) {
      //     setVal(file);
      //     return;
      //   }
      //   file.arrayBuffer().then((b) => {
      // });
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
        {colType == "USER-DEFINED" || colType == "file" ? (
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
              className={`group/fd flex p-1 ${fileDrag ? "animate-logoExit bg-red-600/30 shadow-xs" : "shadow-sm"} ${pressAnim.includes("uplc") && "scale-95"} ${err && "ring-2 ring-red-600"} hover:text-bw text-bw/80 rounded-xl transition-all`}
            >
              {(canEdit && editMode) || field ? (
                <Label className="text-[10px]">
                  {fileDrag ? "Drop file" : "Click or drag file"}
                  <Input
                    onChange={uploadClicked}
                    type="file"
                    className="w-[4rem] truncate bg-gray-600 px-1 text-center text-[8px] shadow-sm hover:bg-green-600/80 hover:shadow-none"
                  />
                </Label>
              ) : (
                <FilePlus size={25} />
              )}
            </div>
          )
        ) : colType.includes("timestamp") || val instanceof Date ? (
          <div onClick={() => setPressAnim("nrcdt")} className="">
            <DateTimePicker
              err={err}
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
            ttl={uData?.split("&")[2]}
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
      className={`flex w-full ${pressAnim.includes("fbtn") ? "scale-95" : "shadow-sm"} hover:bg-bw/5 relative items-center space-x-2 rounded-xl px-2 py-2 transition-all`}
    >
      {fileHovered ? (
        <FaDownload
          size={25}
          className={`${pressAnim.includes("ftbn") && "translate-y-1"} fill-blue-700 transition-all`}
        />
      ) : fileType.startsWith("image") ? (
        <Image
          src={urlRef.current}
          alt={fileName}
          className={`${imgSize(rcSize)} ring-bw/20`}
        />
      ) : fileType.startsWith("application/pdf") ? (
        <FaFilePdf className="fill-red-500" size={25} />
      ) : fileType.startsWith("text") ? (
        <PiFileTxtFill size={25} />
      ) : fileType.startsWith("audio") ? (
        <AudioLines size={25} />
      ) : fileType.startsWith("video") ? (
        <MdSlowMotionVideo size={25} className="stroke-red-500" />
      ) : fileType.includes("/msword") ||
        fileType.includes("officedocument.wordprocessingml.document") ? (
        <PiMicrosoftWordLogoFill size={25} className="fill-blue-600" />
      ) : fileType.includes("officedocument.spreadsheetml.sheet") ||
        fileType.includes("vnd.ms-excel") ? (
        <RiFileExcel2Line size={25} className="fill-green-500" />
      ) : fileType.includes("openxmlformats-officedocument.presentationml") ||
        fileType.includes("vnd.ms-powerpoint") ? (
        <PiMicrosoftPowerpointLogoFill size={25} className="fill-orange-600" />
      ) : (
        <FileArchive size={25} />
      )}
      <p
        className={`bg-bw/10 hover:bg-bw/20 rounded-xl px-2 text-[10px] ${!expandCard && "truncate"} `}
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
