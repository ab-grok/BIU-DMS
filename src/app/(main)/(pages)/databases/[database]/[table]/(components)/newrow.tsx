"use client";

import Index from "@/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRcConfig } from "@/app/(main)/layoutcontext";
import { Button } from "@/components/ui/button";
import {
  useConfirmDialog,
  useLoading,
  useNotifyContext,
} from "@/app/dialogcontext";
import { CircleCheckBig, Trash2 } from "lucide-react";
import { useButtonAnim } from "@/components/count";
import { checkType, createRcSchema } from "@/lib/createschema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { hVal, RowItem, wVal } from "./rows";
import Loading from "@/components/loading";
import { useFetchContext, rcData } from "@/app/(main)/(pages)/fetchcontext";
import { deleteTableData, insertTableData } from "@/lib/actions";

type createRcType = {
  nRcScroll: (e: any) => void;
  tbPath: string;
  ref: React.RefObject<HTMLDivElement | null>;
  thisRc: rcData;
  nRc: boolean;
  uData: string;
};

// const hSizes = { lg: "[10rem]", md: "[6rem]", sm: "[3rem]" };
// const wSizes = { lg: "[16rem]", md: "[10.75rem]", sm: "[5.5rem]" };
// const imgSz = { lg: "[4rem]", md: "[3rem]", sm: "[2rem]" };

// export function hVal(rcSize: rcDim, max?: "max") {
//   return `${max ? "max" : "min"}-h-${hSizes[rcSize.h || "sm"]}`;
// }

// export function imgSize(rcSize: rcDim) {
//   return `size-${imgSz[rcSize.h || "sm"]}`;
// }

// export function wVal(rcSize: rcDim) {
//   return `min-w-${wSizes[rcSize.w || "md"]} max-w-${wSizes[rcSize.w || "md"]}`;
// }

export function NewRow({
  nRcScroll,
  tbPath,
  ref,
  thisRc,
  nRc,
  uData,
}: createRcType) {
  const [resetCount, setResetCount] = useState(0);
  const [nrcSubmitHover, setNrcSubmitHover] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const { pressAnim, setPressAnim } = useButtonAnim();
  const { setConfirmDialog } = useConfirmDialog();
  const { rcSize } = useRcConfig();
  const { setNotify } = useNotifyContext();
  const uniqueCols: { col: string; key: "PRIMARY" | "UNIQUE" }[] = [];
  const formSchema = createRcSchema(thisRc?.rcHeader);
  type formType = z.infer<typeof formSchema>;

  const defaultValues = useMemo(() => {
    return thisRc?.rcHeader?.reduce(
      (acc, col) => {
        if (col.colName != "ID") {
          let defVal: any;
          if (col.colName == "updated_at") defVal = new Date();
          else if (col.colName == "updated_by") defVal = uData;
          else if (checkType(col.type) == "number") defVal = 0;
          else if (checkType(col.type) == "string") defVal = "";
          else if (checkType(col.type) == "boolean") defVal = false;
          else if (checkType(col.type) == "file") defVal = null;
          else if (checkType(col.type) == "date") defVal = null;
          acc[col.colName] = defVal;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [JSON.stringify(thisRc?.rcHeader)]);

  useEffect(() => {
    thisRc?.rcHeader?.forEach((a, i) => {
      if (a.keys?.includes("PRIMARY"))
        uniqueCols.push({ col: a.colName, key: "PRIMARY" });
      else if (a.keys?.includes("UNIQUE"))
        uniqueCols.push({ col: a.colName, key: "UNIQUE" });

      return;
    });
  }, []);

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function nRcSubmitted(values: formType) {
    setIsLoading((p) => p + "nRc");
    const rowData = formSchema.parse(values);
    console.log("values from nrcSubitted: ", rowData);
    let uniqueFound: { col: string; index: number; key: string } | null = null; //using its index. Will use to point user to entry
    let where = "";
    for (const { col, key } of uniqueCols) {
      const index = thisRc.rcRows?.findIndex((a, i) => {
        if (a[col] == rowData[col]) {
          where = JSON.stringify(Object.entries(thisRc.rcRows[i]).slice(0, 2));
        }
        return a[col] == rowData[col];
      });
      if (index > 0) {
        uniqueFound = { col: col, index, key };
        break;
      }
    }

    if (uniqueFound) {
      setConfirmDialog({
        type: "table",
        action: uniqueFound.key.toLowerCase() as "unique" | "primary",
        head: "Duplicate entry found for",
        name: uniqueFound.col,
        message1: "at line: " + uniqueFound.index,
        message2: "Delete column?",
        confirmFn: () => delRow(where),
      });
      return;
    }

    await insertRow([values]);
    setIsLoading((p) => p.replace("nRc", ""));
  }

  async function delRow(where: string) {
    const { error } = await deleteTableData(tbPath, where);
    error && setNotify({ danger: true, message: error });
    return true;
  }
  async function insertRow(colVals: Record<string, string>[]) {
    const { error } = await insertTableData(tbPath, colVals);
    if (error) {
      setNotify({ danger: true, message: error });
      return;
    }
    form.reset();
  }

  function resetForm() {
    setPressAnim("nrcR");
    setResetCount((p) => p + 1);
    form.reset();
    console.log("newRow reset clicked");
    const shape = formSchema._def.shape();
    console.log("Schema shape:", shape);
    console.log("schema defaultValues:", defaultValues);
  }

  function isDef(col: string) {
    if (col == "updated_at" || col == "updated_by") return true;
    return false;
  }

  return (
    <div
      onScroll={nRcScroll}
      ref={ref}
      id="nrcScroll"
      className={`group/nrc scrollbar-custom border-main-bg/80 relative mb-0.5 flex min-h-[5rem] w-full items-center overflow-x-auto overflow-y-hidden border-b-2 bg-gradient-to-b from-green-500/30 to-green-400/20 shadow-sm hover:to-green-400/30 hover:shadow-lg`}
    >
      <Index
        i={0}
        morph="create"
        className="sticky h-[4.5rem] w-[2rem]"
        size={6}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(nRcSubmitted)}
          className="flex h-full w-fit min-w-full items-center pl-[0.35rem]"
        >
          {thisRc?.rcHeader?.map((col, i) => {
            const err = !!form.formState.errors[col.colName];
            if (col.colName != "ID")
              return (
                <FormField
                  control={form.control}
                  name={col.colName}
                  key={col.colName}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {(checkType(col.type) == "number" ||
                          checkType(col.type) == "string") &&
                        !isDef(col.colName) ? (
                          <div
                            className={`${i % 2 == 0 ? "bg-tb-row2/50 hover:bg-tb-row2/80" : "bg-tb-row2/5 hover:bg-tb-row2/30"} rounded-xl shadow-sm hover:shadow-black ${hVal(rcSize)} ${wVal(rcSize)} flex items-center justify-center p-0.5`}
                          >
                            <Textarea
                              {...field}
                              onChange={(e) => {
                                if (checkType(col.type) == "number") {
                                  if (Number(e.currentTarget.value)) {
                                    field.onChange(
                                      Number(e.currentTarget.value),
                                    );
                                    return;
                                  }
                                }
                                field.onChange(e.currentTarget.value);
                              }}
                              className={`${hVal(rcSize, "max")} ${err && "ring-2 ring-red-600 focus-visible:ring-red-600"} border-bw/20 scrollbar-custom h-[80%] max-h-[5rem] w-full max-w-full rounded-xl px-4 shadow-xs`}
                              placeholder={
                                checkType(col.type) == "number"
                                  ? "1, 1.234"
                                  : "Text"
                              }
                            />
                          </div>
                        ) : (
                          <RowItem
                            colType={col.type}
                            tbPath={tbPath}
                            nCol={i}
                            field={field}
                            isDefault={isDef(col.colName)} //to disable it
                            reset={resetCount}
                            uData={uData}
                          />
                        )}
                      </FormControl>
                      {/* <FormMessage className="" /> */}
                    </FormItem>
                  )}
                />
              );
          })}
          <div className={`${wVal(rcSize)}`}></div>
          <div
            onMouseEnter={() => setNrcSubmitHover(true)}
            onMouseLeave={() => setNrcSubmitHover(false)}
            className="border-bw/20 group/nrcqa sticky right-0 flex h-full w-[2.5rem] flex-col justify-between space-y-1 px-2 py-2 font-medium opacity-0 shadow-sm backdrop-blur-3xl transition-all group-hover/nrc:opacity-100 hover:w-[6rem]"
          >
            {isLoading.includes("nRc") && <Loading />}
            <Button
              onClick={resetForm}
              type="button"
              className={`${pressAnim == "nrcR" && "scale-95"} relative right-0.5 h-[1.6rem] w-[1.6rem] cursor-pointer space-x-3 rounded-full bg-red-600/50 transition-all group-hover/nrcqa:w-fit hover:bg-red-600 hover:shadow-xs`}
            >
              <p className={`${nrcSubmitHover ? "" : "hidden"} transition-all`}>
                Reset
              </p>
              <Trash2
                size={17}
                className={`${nrcSubmitHover ? "" : ""} stroke-2 transition-all`}
              />
            </Button>
            <Button
              type="submit"
              onClick={() => setPressAnim("nrcs")}
              className={`${pressAnim == "nrcs" && "scale-95"} relative right-0.5 h-[1.6rem] w-[1.6rem] cursor-pointer rounded-full bg-green-600/50 group-hover/nrcqa:w-fit hover:bg-green-600 hover:shadow-xs`}
            >
              <p
                className={`${nrcSubmitHover ? "" : "hidden"} transition-all duration-1000`}
              >
                Submit
              </p>
              <CircleCheckBig
                size={17}
                className={`${nrcSubmitHover ? "" : ""} stroke-2`}
              />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
