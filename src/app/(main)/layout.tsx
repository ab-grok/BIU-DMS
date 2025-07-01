import LayoutContext from "./layoutcontext";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/sessions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // setIsLoading(isLoading + ",sidebar");
  const user = await validateSession();
  console.log("got to main layout");
  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className={`flex h-screen max-h-screen w-full max-w-screen flex-col overflow-hidden`}
    >
      <LayoutContext>{children}</LayoutContext>
    </div>
  );
}
