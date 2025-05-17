"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from "react";

import NotificationBar from "@/components/notificationbar";

//loading context
type dialogTypes = {
  authPath: number; //signup, login
  setAuthPath: Dispatch<SetStateAction<number>>;
  isLoading: string; //comma separated string including all loading components
  setIsLoading: Dispatch<SetStateAction<string>>;
  sidebarEditable: boolean;
  setSidebarEdit: Dispatch<SetStateAction<boolean>>;
  notify: notificationStateType;
  setNotify: Dispatch<SetStateAction<notificationStateType>>;
  addUsers: addUsers;
  setAddUsers: Dispatch<React.SetStateAction<addUsers>>;
  // addUsersCategory: string; //viewers, editors
  // setAddUsersCategory: Dispatch<React.SetStateAction<string>>;
};

type addUsers = {
  editors: string; //id?db/tb, id?db  //newTB/Db - uid&title&firstname
  viewers: string; //"new" for createTb
  type: "newDb" | "newTb" | "db" | "tb" | ""; //you can use this to render the specific context - this is not done yet
  category: "editors" | "viewers";
};

const loadingContext = createContext({} as dialogTypes);

export const useLoading = () => {
  const { notify, setNotify, ...rest } = useContext(loadingContext);
  return { ...rest };
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

export function useAddUsers() {
  const { addUsers, setAddUsers } = useContext(loadingContext);
  return { addUsers, setAddUsers };
}

export default function DialogContexts({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notify, setNotify] = useState({} as notificationStateType);
  const [isLoading, setIsLoading] = useState("");
  const [authPath, setAuthPath] = useState(0);
  const [sidebarEditable, setSidebarEdit] = useState(false);
  const [addUsers, setAddUsers] = useState({} as addUsers);

  return (
    <loadingContext.Provider
      value={{
        authPath,
        setAuthPath,
        isLoading,
        setIsLoading,
        sidebarEditable,
        setSidebarEdit,
        notify,
        setNotify,
        addUsers,
        setAddUsers,
      }}
    >
      <div className="flex justify-center">
        <NotificationBar />
        {children}
      </div>
    </loadingContext.Provider>
  );
}
