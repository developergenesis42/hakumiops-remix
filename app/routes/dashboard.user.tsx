import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getUserData } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    {
      title: "User | Remix Dashboard",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userData = await getUserData(request);
  return Response.json({ user: userData });
}

export default function User() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 lg:text-3xl">
        User Details
      </h1>
      <div className="flex flex-col overflow-hidden bg-white shadow-md rounded-xl md:flex-row">
        <div className="flex flex-col w-full px-8 py-10 bg-slate-50 md:basis-1/3 md:items-center lg:py-12">
          <img
            className="object-cover w-20 h-20 rounded-full ring-2 ring-cyan-300 lg:w-28 lg:h-28"
            src={user.avatar_url}
            alt={user.name}
          />
        </div>
        <div className="px-8 py-10 md:basis-2/3 lg:px-10 lg:py-12">
          <div className="mb-6 space-y-1">
            <p className="text-sm">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="mb-6 space-y-1 overflow-hidden">
            <p className="text-sm">Email</p>
            <p className="font-medium truncate">{user.email}</p>
          </div>
          <div className="mb-6 space-y-1">
            <p className="text-sm">User ID</p>
            <p className="font-medium text-sm text-slate-600">{user.id}</p>
          </div>
        </div>
      </div>
    </>
  );
}
