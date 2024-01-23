import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Image from "next/image";

const postUser = async (username) => {
  const reqParams = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };
  const res = await fetch("/api/fake/todos/user/" + username, reqParams);

  if (res.ok) return await res.json();

  const result = await res.json().catch(() => ({ message: res.statusText }));

  throw new Error(result.message);
};

export default function Home() {
  const router = useRouter();

  const { register, handleSubmit } = useForm();

  const createUser = useMutation({
    mutationFn: postUser,
  });

  const onUsernameSubmit = useCallback(
    (data) => {
      createUser
        .mutateAsync(data.username)
        .then(() => router.push(`/list/${data.username}`))
        .catch(console.warn);
    },
    [createUser]
  );

  return (
    <main className="">
      <div className="flex items-center justify-center w-full mx-auto h-screen">
        <div className="flex flex-col items-center justify-center gap-6">
          <h1 className="text-6xl">Welcome!</h1>
          <h2 className="text-3xl">
            Manage your time and your daily tasks here
          </h2>
          <h3 className="text-xl">Start by choosing your username:</h3>
          <form onSubmit={handleSubmit(onUsernameSubmit)}>
            <input
              className="w-96 rounded-l-full px-4 py-2 ring-1 ring-inset ring-gray-300 text-grey-800 placeholder:text-gray-400"
              name="username"
              placeholder="Enter your username here..."
              {...register("username", { required: true })}
            />
            <button
              className="rounded-r-full bg-white px-4 py-2 text-grey-800 border-l-[1px] hover:ring-2 hover:ring-grey-300 "
              type="submit"
            >
              Create user
            </button>
            {createUser.error ? <p>{createUser.error.message}</p> : null}
          </form>
        </div>
        <div className="">
          <Image
            className="w-auto h-96"
            src="/images/todo.png"
            width={300}
            height={300}
            alt="Todo checkboard"
            priority
          />
        </div>
      </div>
    </main>
  );
}
