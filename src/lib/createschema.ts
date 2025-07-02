import { number, z, ZodTypeAny } from "zod";
import { colSchema } from "./actions";
import { file } from "@/app/(main)/(pages)/databases/[database]/[table]/(components)/rows";

const reqString = z.string().trim().min(2, "Too short.");
export const createTbSchema = z.object({
  name: reqString
    .regex(
      /^[A-Z0-9_£$%&!#]*$/i,
      'No white spaces or characters besides "_ £ $ % & ! #" ',
    )
    .max(30, "Title should be concise."),
  desc: reqString
    .regex(
      /^(?=[^A-Z]*[A-Z])^[A-Z0-9_, \-.$£&+<>|*()\[\]{}#@!?]*$/i,
      "Certain characters are not allowed. ",
    )
    .max(255, "Make the description shorter")
    .optional(),
  unique: z.number(),
  primary: z.number(),
  notnull: z.number(),
  ai: z.number(),
  defaultStr: reqString.optional(),
  defaultNum: z.number().optional(),
  type: z.number(), //1- text, 2- number, 3- boolean, 4- date, 5-file
});

export const createDbSchema = z.object({
  dbName: reqString
    .regex(
      /^[A-Z0-9_£$%&!#]*$/i,
      'No white spaces or characters besides "_ £ $ % & ! #" ',
    )
    .max(30, "Too long."),
  desc: reqString
    .regex(
      /^(?=[^A-Z]*[A-Z])^[A-Z0-9_, \-.$£&+<>|*()\[\]{}#@!?]*$/i,
      "Certain characters are not allowed. ",
    )
    .max(255, "Too long"),
});

export function checkType(t: string) {
  const c = (t.includes(" ") ? t.slice(0, t.indexOf(" ")) : t).toLowerCase();

  if (c == "integer" || c == "real" || c == "serial") return "number";
  else if (c == "boolean") return "boolean";
  else if (c.includes("timestamp")) return "date";
  else if (c == "file" || c == "user-defined") return "file";
  else return "string";
}

export const createRcSchema = (tbHeader: colSchema[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  // console.log("in createRcSchema, tbHeader: ", tbHeader);
  tbHeader?.forEach((col) => {
    if (col.colName == "ID") return;
    let validator: z.ZodTypeAny;
    const cT = col.type;
    if (checkType(cT) == "number")
      validator = z.number().min(1, "Field is not nullable");
    else if (checkType(cT) == "boolean") validator = z.boolean();
    else if (checkType(cT) == "date") validator = z.date();
    else if (checkType(cT) == "file")
      validator = z
        .custom<file>(
          (val) => val.fileData instanceof ArrayBuffer,
          "File Required",
        )
        .refine(
          (val) => val.fileSize && val.fileSize <= 5 * 1024 * 1024,
          "Size should be less than 5mb",
        );
    else validator = z.string().min(1, "Field is not nullable"); //if (c == "text")

    if (col.nullable) validator = validator.optional();

    shape[col.colName] = validator;
  });

  return z.object(shape);
};

export const createRcSchema1 = z.object({
  number_nnull: z.number().min(1, "Number must be at least 1").optional(),
  number: z.number().min(1, "Number must be at least 1").optional(),
  string: z.string().optional(),
  string_nnul: reqString.optional(), //.min(2, "Too short."),
});

export type createTbType = z.infer<typeof createTbSchema>;
export type createDbType = z.infer<typeof createDbSchema>;
