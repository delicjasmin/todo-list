import { useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";

const DeleteIcon = ({ className }) => {
  return (
    <svg
      pointerEvents="all"
      fill="#a70101"
      className={className}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 330 330"
      stroke="#a70101"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g id="XMLID_6_">
          {" "}
          <g id="XMLID_11_">
            {" "}
            <path d="M240,121.076H30V275c0,8.284,6.716,15,15,15h60h37.596c19.246,24.348,49.031,40,82.404,40c57.897,0,105-47.103,105-105 C330,172.195,290.816,128.377,240,121.076z M225,300c-41.355,0-75-33.645-75-75s33.645-75,75-75s75,33.645,75,75 S266.355,300,225,300z"></path>{" "}
          </g>{" "}
          <g id="XMLID_18_">
            {" "}
            <path d="M240,90h15c8.284,0,15-6.716,15-15s-6.716-15-15-15h-30h-15V15c0-8.284-6.716-15-15-15H75c-8.284,0-15,6.716-15,15v45H45 H15C6.716,60,0,66.716,0,75s6.716,15,15,15h15H240z M90,30h90v30h-15h-60H90V30z"></path>{" "}
          </g>{" "}
          <g id="XMLID_23_">
            {" "}
            <path d="M256.819,193.181c-5.857-5.858-15.355-5.858-21.213,0L225,203.787l-10.606-10.606c-5.857-5.858-15.355-5.858-21.213,0 c-5.858,5.858-5.858,15.355,0,21.213L203.787,225l-10.606,10.606c-5.858,5.858-5.858,15.355,0,21.213 c2.929,2.929,6.768,4.394,10.606,4.394c3.839,0,7.678-1.465,10.607-4.394L225,246.213l10.606,10.606 c2.929,2.929,6.768,4.394,10.607,4.394c3.839,0,7.678-1.465,10.606-4.394c5.858-5.858,5.858-15.355,0-21.213L246.213,225 l10.606-10.606C262.678,208.535,262.678,199.039,256.819,193.181z"></path>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};

const getTodos = async (username) => {
  const res = await fetch("/api/fake/todos/user/" + username);

  if (res.ok) {
    const result = await res.json();
    return result.data;
  }

  const result = await res.json().catch(() => ({ message: res.statusText }));

  throw new Error(result.message);
};

const deleteTask = async ([data, username]) => {
  const reqParams = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch("/api/fake/todos/user/" + username, reqParams);
  return await res.json();
};

const updateTodos = async ([data, username]) => {
  const reqParams = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch("/api/fake/todos/user/" + username, reqParams);
  return await res.json();
};

export async function getServerSideProps(context) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["todos", context.params.username],
    queryFn: () => getTodos(context.params.username),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

function Page() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const username = router.query.username;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: "" } });

  const query = useQuery({
    queryKey: ["todos", username],
    queryFn: () => getTodos(username),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: queryClient.invalidateQueries(["todos", username]),
  });

  const handleTaskDelete = useCallback(
    (event) => {
      const data = { id: event.currentTarget.id };
      deleteMutation.mutate([data, username]);
    },
    [deleteMutation, username]
  );

  const addTask = useMutation({
    mutationFn: updateTodos,
    onSuccess: queryClient.invalidateQueries(["todos", username]),
  });

  const handleTaskCheck = useCallback(
    (event) => {
      const data = { id: event.target.id };
      addTask.mutate([data, username]);
    },
    [addTask, username]
  );

  const handleTaskSubmit = useCallback(
    (data) => {
      const newData = { label: data.task };
      addTask.mutate([newData, username]);
      reset();
    },
    [addTask, username]
  );

  return (
    <div className="flex h-screen w-auto mx-auto items-center justify-center">
      <div className="flex flex-col mx-10">
        <h2 className="text-5xl">Your todo list</h2>
        <ul className="flex flex-col items-start justify-start gap-2">
          {query.data?.map((item) => (
            <li className="flex gap-3 text-2xl" key={item.id}>
              <button
                className=""
                id={item.id}
                onClick={(e) => handleTaskDelete(e)}
                type="button"
              >
                <DeleteIcon className="size-6" />
              </button>
              {item.label}
              <input
                id={item.id}
                type="checkbox"
                defaultChecked={item.done}
                onChange={(e) => handleTaskCheck(e)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="">
        <form onSubmit={handleSubmit(handleTaskSubmit)}>
          <input
            className="w-80 text-grey-800 rounded-l-full px-4 py-2 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
            name="task"
            placeholder="New Task"
            {...register("task", { required: true })}
          />
          <button
            className="rounded-r-full bg-white px-4 py-2 text-grey-800 border-l-[1px] hover:ring-2 hover:ring-grey-300"
            type="submit"
          >
            Add task
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PageRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Page />
    </HydrationBoundary>
  );
}
