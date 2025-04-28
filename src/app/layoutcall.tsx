"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  Dispatch,
} from "react";

import Loading from "@/components/loading";
import NotificationBar from "@/components/notificationbar";

//loading context
type loadingAndNotifyType = {
  isLoading: string; //comma separated string including all loading components
  setIsLoading: Dispatch<SetStateAction<string>>;
  sidebarEditable: boolean;
  setSidebarEdit: Dispatch<SetStateAction<boolean>>;
  notify: notificationStateType;
  setNotify: Dispatch<SetStateAction<notificationStateType>>;
};

const loadingContext = createContext({} as loadingAndNotifyType);

export const useLoading = () => {
  const { isLoading, setIsLoading, sidebarEditable, setSidebarEdit } =
    useContext(loadingContext);
  return { isLoading, setIsLoading, sidebarEditable, setSidebarEdit };
};

type notificationStateType = {
  message: string;
  danger?: boolean;
  exitable?: boolean;
};

export const useNotifyContext = () => {
  const { notify, setNotify } = useContext(loadingContext);
  return { notify, setNotify };
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notify, setNotify] = useState({} as notificationStateType);
  const [isLoading, setIsLoading] = useState("");
  const [sidebarEditable, setSidebarEdit] = useState(false);
  return (
    <loadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        sidebarEditable,
        setSidebarEdit,
        notify,
        setNotify,
      }}
    >
      <div className="flex justify-center">
        <NotificationBar />
        {children}
      </div>
    </loadingContext.Provider>
  );
}
