"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, loginType } from "@/lib/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useContext, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { logUser } from "./actions";
import PasswordInput from "@/components/password";
import { useLoading } from "../../layoutcall";
import { useNotifyContext } from "../layout";
import Loading from "@/components/loading";

export default function LoginForm() {
  const fields: fields[] = [
    { name: "username", type: "text", placeholder: "Username or Email" },
    { name: "password", type: "password", placeholder: "Password" },
  ];

  type fields = {
    name: "username" | "password";
    type: string;
    placeholder: string;
  };
  const logform = useForm<loginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [clicked, setClicked] = useState(false);

  function handleClicked() {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 60);
  }
  const [errMsg, setErrMsg] = useState({ err1: "", err2: "" });
  const [isPending, startTransition] = useTransition();
  const { setIsLoading, isLoading } = useLoading();

  const { setNotify } = useNotifyContext();

  async function logSubmit(values: loginType) {
    setErrMsg({ err1: "", err2: "" });
    setIsLoading(isLoading + ",login");
    startTransition(async () => {
      const { error } = await logUser(values);
      if (error) {
        const index = error.indexOf(";");
        let error2 = ", " + error.slice(index + 1);
        setErrMsg((prev) => ({ ...prev, err2: error2 }));
        let error1 = error.substring(0, index);
        setErrMsg((prev) => ({ ...prev, err1: error1 }));
      } else {
        setErrMsg({ err1: "", err2: "" });
      }
      setIsLoading(isLoading.replace(",login", ""));
      setNotify({
        message: "Test message, should be as long as this...",
        danger: false,
        exitable: false,
      });
    });
  }

  return (
    <Form {...logform}>
      {isLoading.includes("login") && <Loading />}
      <form
        onSubmit={logform.handleSubmit(logSubmit)}
        className="flex h-[30rem] w-[25rem] flex-col justify-center space-y-5"
      >
        <div
          className={`absolute top-5 transition-all ${errMsg.err1 ? "flex scale-100" : "hidden scale-0"} h-[4rem] w-[95%] items-center justify-center place-self-center rounded-2xl border-2 border-red-600 text-center shadow-2xl shadow-black`}
        >
          <div className="text-destructive"> {errMsg.err1}</div>
          <div>{errMsg.err2}</div>
        </div>
        <FormField
          control={logform.control}
          name="username"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel> Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Username or Email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>
        <FormField
          control={logform.control}
          name="password"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel> Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>

        <Link href="/signup" className="self-center hover:underline">
          Create an account Instead.{" "}
        </Link>
        <Button
          onClick={() => handleClicked()}
          type="submit"
          className={`${clicked && "scale-95"} justify-content flex h-[50px] w-full items-center rounded-3xl transition-all ${clicked && "hover:shadow-none"} hover:shadow-lg`}
        >
          {" "}
          Log in{" "}
        </Button>
      </form>
    </Form>
  );
}
