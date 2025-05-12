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
import { useContext, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { logUser } from "./actions";
import PasswordInput from "@/components/password";
import { useLoading, useNotifyContext } from "@/app/dialogcontext";
import Loading from "@/components/loading";
import { startupSnapshot } from "v8";

export default function LoginForm() {
  const logform = useForm<loginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [clicked, setClicked] = useState(false);
  async function handleClicked() {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 60);
  }

  function mouseEntered() {
    setErrMsg({ err1: "", err2: "" });
  }

  const [errMsg, setErrMsg] = useState({ err1: "", err2: "" });
  const { setIsLoading, isLoading } = useLoading();
  const { setNotify } = useNotifyContext();
  const [isPending, startTransition] = useTransition();

  function logSubmit(values: loginType) {
    setErrMsg({ err1: "", err2: "" });
    setIsLoading("login,");
    startTransition(() => {
      const done = new Promise((resolve, reject) => {
        resolve(1);
      });
      (async () => {
        const { error } = await logUser(values);
        // will get redirected here when there's no error (loading never ends)
        if (error) {
          if (error.includes(";")) {
            const index = error.indexOf(";");
            let error2 = ". " + error.slice(index + 1);
            let error1 = error.substring(0, index);
            setErrMsg({ err1: error1, err2: error2 });
          } else setErrMsg({ err1: error, err2: "" });
        }
      })();

      setErrMsg({ err1: "", err2: "" });
      setNotify({
        message: "Welcome ${session.firstname}, You have 3 view requests",
        danger: false,
        exitable: false,
      });

      setIsLoading((p) => p.replace("login,", ""));
    });
  }

  // useEffect(() => {
  //   setIsLoading(isLoading.replace(",login", ""));
  // }, []);

  return (
    <Form {...logform}>
      {isLoading.includes("login") && <Loading />}
      <form
        onMouseUp={() => mouseEntered()}
        onSubmit={logform.handleSubmit(logSubmit)}
        className="flex h-[30rem] w-[25rem] flex-col justify-center space-y-5"
      >
        <div
          className={`absolute top-5 transition-all ${errMsg.err1 ? "flex scale-100" : "hidden scale-0"} h-[4rem] w-[95%] items-center justify-center place-self-center rounded-full border-2 border-red-600 text-center shadow-xl shadow-black/40`}
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
                    className="rounded-full"
                    placeholder="Username or Email"
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
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
                  <PasswordInput
                    className="rounded-full"
                    {...field}
                    placeholder="Password"
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            );
          }}
        ></FormField>

        <Link
          href="/signup"
          className="self-center hover:text-blue-400 hover:underline"
        >
          Create an account Instead.{" "}
        </Link>
        <Button
          onMouseDown={() => handleClicked()}
          type="submit"
          className={`${clicked ? "scale-95" : ""} flex h-[50px] w-full items-center rounded-3xl bg-green-600 transition-all hover:bg-green-500 ${clicked && ""} hover:shadow-xs`}
        >
          {" "}
          Log in{" "}
        </Button>
      </form>
    </Form>
  );
}
