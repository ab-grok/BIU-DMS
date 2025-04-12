"use client";
import { validateSession } from "@/lib/sessions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useLoading } from "../layoutcall";

export default function () {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setIsLoading, isLoading, setSidebarEditable } = useLoading();

  useEffect(() => {
    // setIsLoading(isLoading + ",sidebar");
    let isMounted = true;
    async function validate() {
      const { session } = await validateSession();
      if (!session) {
        router.replace("/login");
      } else {
        setSidebarEditable(true);
      }
      // setIsLoading(isLoading.replace(",sidebar", ""));
    }
    validate();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Link
      href={"/signup"}
      className="relative top-2 flex justify-center self-center"
    ></Link>
  );
}
