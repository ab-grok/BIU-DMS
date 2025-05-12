import { z } from "zod";
import { createTbSchema } from "./tableschema";

const reqString = z.string().trim().min(1, "Required!");
export const signupSchema = z.object({
  firstname: reqString
    .regex(/^[A-Z]+$/i, "A real name must be provided!")
    .max(20, "Name is too long!"),
  lastname: reqString
    .regex(/^[A-Z]+$/i, "A real name must be provided!")
    .max(20, "Name is too long!"),
  email: reqString.email({ message: "This Email is not valid" }),
  password: reqString
    .min(6, "Password should be at least 6 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[`!"£$%^&*()_+{}\[\]@;:'#?/.,><|-]).+$/i,
      "Password should contain at least one number and one special character that is not '\\' ",
    ),
  title: z.number().min(1, "Required"),
  gender: z.number().min(1, "Required"),
});

export const loginSchema = z.object({
  username: reqString,
  password: reqString,
});

export type signupType = z.infer<typeof signupSchema>;
export type loginType = z.infer<typeof loginSchema>;
