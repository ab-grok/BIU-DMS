import { validateSession } from "@/lib/sessions";
import LayoutCall from "./layoutcall";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await validateSession();
  if (user) redirect("/");
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="relative flex h-full max-h-[34.5rem] w-full max-w-[30rem] items-center justify-center overflow-hidden rounded-[30px] bg-neutral-50/5 shadow-lg lg:max-w-[59.5rem]">
        <div className="animate-logospin absolute h-[70rem] w-[10rem] rotate-[40deg] bg-black/20"></div>
        <LayoutCall>{children}</LayoutCall>
      </div>
    </div>
  );
}
