"use client";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import LayoutCall from "./layoutcall";
import NotificationBar from "@/components/notificationbar";

type notificationStateType = {
  message: string;
  danger?: boolean;
  exitable?: boolean;
};

type notificationContextType = {
  notify: notificationStateType;
  setNotify: Dispatch<SetStateAction<notificationStateType>>;
};

export const notificationContext = createContext({} as notificationContextType);
export const useNotifyContext = (): notificationContextType => {
  const context = useContext(notificationContext);
  return context;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [notify, setNotify] = useState({} as notificationStateType);
  // const { session, user } = await validateSession({
  //   token32: "aa47b7e1a2edb62189d5fe94812941fb3f9aba36ae00f1167dab583e466b91f1",
  // });
  // console.log(`session and user: ${{ session, user }}`);

  return (
    <notificationContext.Provider value={{ notify, setNotify }}>
      <div className="flex h-screen w-screen items-center justify-center">
        <NotificationBar />
        <div className="relative flex h-full max-h-[34.5rem] w-full max-w-[30rem] items-center justify-center overflow-hidden rounded-[30px] bg-neutral-50/5 shadow-2xl lg:max-w-[59.5rem]">
          <div className="animate-logospin absolute h-[70rem] w-[10rem] bg-black/20"></div>
          <LayoutCall children={children} />
        </div>
      </div>
    </notificationContext.Provider>
  );
}
