"use client";
import PasswordInput from "@/components/password";
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
import { signupSchema, signupType } from "@/lib/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUser } from "./actions";
import { redirect } from "next/navigation";
import { useLoading } from "@/app/layoutcall";
import Loading from "@/components/loading";

type name = {};

export default function SignupForm({ className }: { className?: string }) {
  const [passVisible, setPassVisible] = useState(false);

  const fields: names[] = [
    { name: "firstname", type: "text", placeholder: "John" },
    { name: "lastname", type: "text", placeholder: "Doe" },
    { name: "email", type: "email", placeholder: "Johndoe@gmail.com" },
  ];

  type names = {
    name: "firstname" | "lastname" | "email" | "password";
    type: string;
    placeholder: string;
  };

  const signform = useForm<signupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  const [clicked, setClicked] = useState(false);
  function handleClicked() {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 100);
  }

  const [msg, setMsg] = useState({ err: false, msg1: "", msg2: "" });
  const [isPending, startTransition] = useTransition();
  const { isLoading, setIsLoading } = useLoading();

  async function signSubmit(values: signupType) {
    setMsg({ err: false, msg1: "", msg2: "" });
    setIsLoading(isLoading + ",signup");
    startTransition(async () => {
      const { signError, errMessage } = await signUser(values);
      if (signError) {
        let error1 = errMessage;
        const index = errMessage.indexOf(";");
        let error2 = "";
        if (index > 0) {
          error2 = ". " + errMessage.slice(index + 1);
          error1 = errMessage.substring(0, index);
        }
        setMsg({ err: true, msg1: error1, msg2: error2 });
      } else {
        setMsg({
          err: false,
          msg1: "Sign up successful",
          msg2: `. You're being redirected.`,
        });
        setTimeout(() => {
          redirect("/");
        }, 3000);
      }
      setIsLoading(isLoading.replace(",signup", ""));
    });
  }
  function mouseEntered() {
    setMsg({ err: false, msg1: "", msg2: "" });
  }

  return (
    <Form {...signform}>
      {isLoading.includes("signup") && <Loading />}
      <form
        onMouseDown={mouseEntered}
        onSubmit={signform.handleSubmit(signSubmit)}
        className="flex h-[30rem] w-[25rem] flex-col justify-center space-y-5"
      >
        <div
          className={`absolute top-2 transition-all ${msg.msg1 ? "animate-logo-pulse flex scale-100" : "hidden scale-0"} h-[4rem] w-[95%] items-center justify-center place-self-center rounded-2xl border-2 ${msg.err ? "border-red-600" : "border-green-500"} text-center shadow-2xl shadow-black backdrop-blur-2xl duration-700`}
        >
          <div
            className={`${msg.err ? "text-destructive" : "text-card-foreground"}`}
          >
            {" "}
            {msg.msg1}
          </div>
          <div
            className={`${msg.err ? "text-card-foreground" : "text-green-700"}`}
          >
            {msg.msg2}
          </div>
        </div>
        {fields.map((Item) => {
          return (
            <FormField
              control={signform.control}
              name={Item.name}
              key={Item.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {Item.name.charAt(0).toUpperCase() + Item.name.slice(1)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={Item.type}
                      placeholder={Item.placeholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          );
        })}
        <FormField
          control={signform.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link href="/login" className="self-center hover:underline">
          {" "}
          Already have an account? Log in{" "}
        </Link>
        <Button
          onClick={() => handleClicked()}
          type="submit"
          className={`${clicked && "scale-95"} justify-content flex h-[50px] w-full items-center rounded-3xl transition-all ${clicked && "hover:shadow-none"} hover:shadow-lg`}
        >
          {" "}
          Create Account{" "}
        </Button>
      </form>
    </Form>
  );
}
