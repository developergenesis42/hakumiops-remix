import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { getSupabaseClient } from "~/utils/getSupabaseClient";

export function loader() {
  try {
    getSupabaseClient(); // Throws an error if Supabase is not set
  } catch (error) {
    return redirect("/"); // Redirect to _index.tsx
  }

  return Response.json({});
}

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-200 antialiased flex flex-col">
      <div className="flex flex-col items-center justify-center w-full px-4 py-24">
        <Outlet />
      </div>
    </main>
  );
}
