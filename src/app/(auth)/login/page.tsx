import { Metadata } from "next";
import customForm from "@/components/form";
import * as React from "react";
import LoginForm from "./loginform";

export const metadata: Metadata = {
  title: "Log in",
};
export default function SignupPage() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <LoginForm />
    </div>
  );
}
