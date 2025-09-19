import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useState } from "react";

import MenuIcon from "~/components/icons/Menu";
import ProfilePopup from "~/components/business/ProfilePopup";
import Sidebar from "~/components/layout/Sidebar";
import { getSession } from "~/session.server";
import { getSupabaseClient } from "~/utils/getSupabaseClient";

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

  return Response.json({});
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between gap-6 p-4 md:justify-end">
        <button
          className="flex items-center justify-center w-8 h-8 transition rounded-md cursor-pointer md:hidden text-slate-900 hover:bg-slate-200/80"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </button>
        <ProfilePopup />
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
