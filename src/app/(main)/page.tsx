"use client";

import { useEffect } from "react";
import { useNotifyContext } from "../dialogcontext";
import { useSearchParams } from "next/navigation";
import { validateSession } from "@/lib/sessions";

export default function MainPage() {
  //notify on important notification but searchParams persistent. so set counter for notify
  // const { setNotify } = useNotifyContext();
  // const signed = useSearchParams().get("signed");
  // useEffect(() => {
  //   if (signed) {
  //     (async () => {
  //       const user = await validateSession();
  //       if (user) {
  //         setNotify({
  //           message: `Welcome ${user.title}${user.firstname}`,
  //           danger: false,
  //           exitable: false,
  //         });
  //       }
  //     })();
  //   }
  // }, []);
  return <div></div>;
}
