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
      <div className="bg-main-bg/10 relative flex h-full max-h-[34.5rem] w-[90%] max-w-[30rem] items-center justify-center overflow-hidden rounded-[30px] shadow-lg lg:max-w-[59.5rem]">
        <div className="animate-logospin absolute h-[70rem] w-full rotate-[40deg] bg-black/20 md:w-[10rem]"></div>
        <LayoutCall>{children}</LayoutCall>
      </div>
    </div>
  );
}
