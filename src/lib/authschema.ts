import { z } from "zod";

const reqString = z.string().trim().min(1, "Required!");
export const signupSchema = z.object({
  firstname: reqString
    .regex(/^[A-Z]+$/i, "Use a real name!")
    .max(20, "Name exceeds limit, make it shorter!"),
  lastname: reqString
    .regex(/^[A-Z]+$/i, "Use a real name!")
    .max(20, "Name exceeds limit, make it shorter!"),
  email: reqString.email({ message: "This Email is not valid" }),
  password: reqString
    .min(6, "Password should be at least 6 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[`!"£$%^&*()_+{}\[\]@;:'#?/.,><|]).+$/i,
      "Password should contain at least one number and one special character that is not '\\' ",
    ),
});

export const loginSchema = z.object({
  username: reqString,
  password: reqString,
});

export type signupType = z.infer<typeof signupSchema>;
export type loginType = z.infer<typeof loginSchema>;
