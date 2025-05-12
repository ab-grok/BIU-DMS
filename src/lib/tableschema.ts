import { z } from "zod";

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

export type createTbType = z.infer<typeof createTbSchema>;
