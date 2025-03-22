import customForm from "@/components/form";
import * as React from "react";
import { getCookie, validateSession } from "@/lib/sessions";
import SignupForm from "./signupform";

export default function SignupPage() {
  async function validateUser() {
    const { token32 } = await getCookie();
    const { username } = await validateSession({ token32 });
    console.log(`username: ${username}`);
  }
  validateUser();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <SignupForm />
    </div>
  );
}
