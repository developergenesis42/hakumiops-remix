import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import MenuIcon from "~/components/icons/Menu";
import ProfilePopup from "~/components/business/ProfilePopup";
import Sidebar from "~/components/layout/Sidebar";
import { getSession } from "~/session.server";
import { getSupabaseClient } from "~/utils/getSupabaseClient";
import { getUserData } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    getSupabaseClient();
  } catch (error) {
    return redirect("/");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("__session");

  if (!token) {
    return redirect("/login");
  }

  // Fetch user data
  const userData = await getUserData(request);

  return Response.json({ user: userData });
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useLoaderData<typeof loader>();

  console.log("Dashboard user data:", user);

  return (
    <>
      <nav className="flex items-center justify-between gap-6 p-4 bg-white shadow-sm border-b border-slate-200 md:justify-end">
        <button
          className="flex items-center justify-center w-8 h-8 transition rounded-md cursor-pointer md:hidden text-slate-900 hover:bg-slate-200/80"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </button>
        {user ? (
          <ProfilePopup user={user} />
        ) : (
          <div className="text-sm text-slate-600">Loading user...</div>
        )}
      </nav>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="py-8 grow md:ml-70 md:py-16">
        <div className="px-4 mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </>
  );
}
