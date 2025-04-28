// "use client";
// import { useEffect, useState, useTransition } from "react";
// import { Separator } from "../../../components/ui/separator";
// import {
//   db,
//   listDatabases,
//   revalidateDb,
// } from "../databases.tsx/[database]/actions";
// import { useSideContext } from "../layoutcontext";
// import { useRouter } from "next/navigation";
// import { Database } from "lucide-react";
// import { useLoading } from "@/app/layoutcall";

// export default function DbItems() {
//   //validateuserhere and get dbAccess
//   const router = useRouter();
//   const [databases, setDatabases] = useState<Array<db>>();
//   const [clicked, setClicked] = useState({ clicked: false, db: "" });
//   const { sbExpanded, database } = useSideContext().context.sidebarState;
//   const { isLoading, setIsLoading, setSidebarEdit } = useLoading();
//   //forward expanded as prop to make reusable
//   const [isPending, startTransition] = useTransition();

//   useEffect(() => {
//     setSidebarEdit(true);
//     console.log("isLoading in sidebar" + isLoading);
//     setIsLoading(isLoading + ",sidebar");
//     (async () => {
//       const { items } = await listDatabases();
//       console.log("items from dbItems: " + items);
//       if (items) {
//         console.log("got items from sidedbitems");
//         setDatabases(items);
//         setIsLoading(isLoading.replace(",sidebar", ""));
//       } else {
//         console.log("else block, no items");
//         await revalidateDb();
//       }
//     })();
//   }, []);

//   function handleClick(name: string) {
//     // router.push(`/${name}`);
//     setClicked({ clicked: true, db: name });
//   }
//   function handleUnclick() {
//     setClicked({ clicked: false, db: "" });
//   }
//   return (
//     <div
//       className={`relative mb-2 flex h-full w-full flex-col items-center space-y-1 select-none`}
//     >
//       {databases &&
//         databases.map((a, i) => {
//           return (
//             <div
//               key={i}
//               onMouseDown={() => handleClick(a.Database)}
//               onMouseUp={() => handleUnclick()}
//               className={`${clicked && clicked.db == a.Database ? "scale-[0.97] shadow-sm" : "scale-100"} ${database == a.Database ? "bg-tb-foreground" : "hover:bg-gradient-to-l"} group bg-card-foreground relative flex h-[3rem] w-[80%] flex-none cursor-pointer items-center overflow-clip rounded-xl from-cyan-500 to-blue-500 p-2 text-sm transition-all duration-75 ease-in`}
//             >
//               <Database
//                 className={`w-[20px] min-w-[20px] stroke-blue-400 transition-all ${database == a.Database ? "fill-zinc-950" : ""}`}
//               />{" "}
//               <div
//                 className={`${sbExpanded ? "flex" : "hidden lg:flex"} text-foreground mr-[2rem] w-full max-w-full transition-all duration-100 group-hover:translate-x-3`}
//               >
//                 {a.Database}{" "}
//               </div>
//             </div>
//           );
//         })}
//     </div>
//   );
// }
