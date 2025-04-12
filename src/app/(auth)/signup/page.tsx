"use client";
import customForm from "@/components/form";
import React, { useEffect } from "react";
import { getCookie, validateSession } from "@/lib/sessions";
import SignupForm from "./signupform";
import { redirect } from "next/navigation";

export default function SignupPage() {
  useEffect(() => {
    async function validateUser() {
      const { username } = await validateSession();
      console.log(`Already signed in username: ${username}`);
      if (username) redirect("/");
    }
    validateUser();
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <SignupForm />
    </div>
  );
}
