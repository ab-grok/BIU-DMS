"use client";
import PasswordInput from "@/components/password";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signupSchema, signupType } from "@/lib/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUser } from "./actions";
import { redirect } from "next/navigation";
import { useLoading } from "@/app/dialogcontext";
import Loading from "@/components/loading";
import { cn } from "@/lib/utils";

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
  type subForm = {
    name: "title" | "gender";
  }[];

  const subFormArr: subForm = [{ name: "title" }, { name: "gender" }];

  const [subForm, setSubForm] = useState(false);
  const [buttonAnim, setButtonAnim] = useState(0);
  function handleClicked(i: number) {
    setSubForm(!subForm);
    setButtonAnim(i);
    setTimeout(() => {
      setButtonAnim(0);
    }, 60);
  }

  function handleFocus(e: React.FocusEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      console.log(
        "e.target: " + e.target + "\n e.currentTarget: " + e.currentTarget,
      );
      setSubForm(false);
    }
  }

  const [msg, setMsg] = useState({ err: false, msg1: "", msg2: "" });
  const [isPending, startTransition] = useTransition();
  const { isLoading, setIsLoading } = useLoading();

  const signform = useForm<signupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      title: 1,
      gender: 1,
    },
  });

  function signSubmit(values: signupType) {
    console.log("got to signSubmit");
    setIsLoading((p) => p + "signup,");
    startTransition(async () => {
      setMsg({ err: false, msg1: "", msg2: "" });
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
      setIsLoading((p) => p.replace("signup,", ""));
    });
  }

  function mouseEntered() {
    setMsg({ err: false, msg1: "", msg2: "" });
  }

  return (
    <Form {...signform}>
      {isLoading.includes("signup") && <Loading />}
      <form
        onMouseUp={mouseEntered}
        onSubmit={signform.handleSubmit(signSubmit)}
        className="flex w-[25rem] flex-col justify-center space-y-4"
      >
        <div
          id="form error"
          className={`absolute top-2 transition-all ${msg.msg1 ? "animate-logo-pulse flex scale-100" : "hidden scale-0"} h-[4rem] w-[95%] items-center justify-center place-self-center rounded-full border-2 ${msg.err ? "border-red-600" : "border-green-500"} text-center shadow-xl shadow-black/40 backdrop-blur-2xl duration-700`}
        >
          <div className={`${msg.err ? "text-destructive" : "text-bw"}`}>
            {" "}
            {msg.msg1}
          </div>
          <div className={`${msg.err ? "text-bw" : "text-green-700"}`}>
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
                      className="rounded-full"
                      placeholder={Item.placeholder}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            ></FormField>
          );
        })}
        <div
          tabIndex={0}
          onFocus={(e) => handleFocus(e)}
          className={`${subForm ? "absolute" : "hidden"} top-0 right-0 z-5 flex h-full w-full items-center justify-center rounded-3xl backdrop-blur-xs`}
        >
          <div
            tabIndex={1}
            className="bg-main-fg ring-main-bg flex h-[80%] w-[80%] flex-col items-center justify-center space-y-5 rounded-3xl p-10 shadow-lg ring-2 shadow-black"
          >
            {subFormArr.map((a, i) => (
              <FormField
                control={signform.control}
                name={a.name}
                key={i}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {a.name.charAt(0).toUpperCase() + a.name.slice(1)}
                    </FormLabel>
                    <FormControl>
                      <SlideSelect
                        name={a.name}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            ))}
            <Button
              onClick={() => handleClicked(2)}
              type="submit"
              className={`${buttonAnim == 2 ? "scale-95 shadow-2xs" : ""} justify-content mt-2 flex h-[50px] w-full items-center rounded-3xl bg-green-600 transition-all hover:bg-green-500 hover:shadow-xs`}
            >
              {" "}
              Create account{" "}
            </Button>
          </div>
        </div>
        <FormField
          control={signform.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput className="rounded-full" {...field} />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />
        <Link
          href="/login"
          className="self-center hover:text-blue-600 hover:underline"
        >
          {" "}
          Already have an account? Log in{" "}
        </Link>
        <Button
          onMouseDown={() => handleClicked(1)}
          type="button"
          className={`${buttonAnim == 1 ? "scale-95 hover:shadow-none" : ""} justify-content flex h-[50px] w-full items-center rounded-3xl bg-green-600 transition-all hover:bg-green-500 hover:shadow-xs`}
        >
          {" "}
          Next{" "}
        </Button>
      </form>
    </Form>
  );
}

export function SlideSelect({
  color,
  onChange,
  name,
  value,
  className,
  typeChange,
}: customField) {
  const title = ["Mr", "Ms", "Mrs", "Dr", "Prof"];
  const gender = ["Male", "Female"];
  const type = ["Text", "Number", "Date", "Boolean", "File"];
  const [tab, setTab] = useState(0);

  const arr = name == "title" ? title : name == "type" ? type : gender;
  const color1 = color ? color : "bg-bw/60";
  function tabClick(e: number) {
    setTab(e);
    onChange(e);
    typeChange && typeChange(e);
  }

  // useEffect(() => {
  //   console.log("this is value from SlideSelect: ", value);
  // }, [value]);

  return (
    <div
      tabIndex={1}
      className={cn(
        `border-bw/40 relative h-[2.5rem] w-[15rem] cursor-pointer overflow-hidden rounded-full border-2 ring-blue-300/50 select-none focus:ring-2`,
        className,
      )}
    >
      <div
        className={`${color1} h-full w-full transition-all duration-200 ease-out ${name != "gender" ? `max-w-[20%] ${tab == 5 ? "translate-x-[400%]" : tab == 4 ? "translate-x-[300%]" : tab == 3 ? "translate-x-[200%]" : tab == 2 ? "translate-x-[100%]" : ""}` : `max-w-[50%] ${tab == 2 ? "translate-x-[100%]" : ""} `} `}
      >
        {" "}
      </div>

      <div className="absolute top-0 flex h-full w-full">
        {arr &&
          arr.map((a, i) => (
            <div
              key={a}
              onClick={() => tabClick(i + 1)}
              className={`${name == "gender" ? "w-[50%]" : "w-[20%]"} ${tab == i + 1 ? "text-bw font-bold" : ""} hover:bg-bw/20 flex items-center justify-center text-sm hover:shadow-xs`}
            >
              {a}
            </div>
          ))}
      </div>
    </div>
  );
}

type customField = {
  color?: string;
  onChange: (e: any) => void;
  name: string;
  className?: string;
  value?: number;
  typeChange?: (e: any) => void;
};
