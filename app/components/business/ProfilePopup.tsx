import { Form, Link } from "@remix-run/react";
import { useRef, useState } from "react";

import Popup from "~/components/ui/Popup";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface ProfilePopupProps {
  user: User;
}

export default function ProfilePopup({ user }: ProfilePopupProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center cursor-pointer"
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        ref={popupButtonRef}
      >
        <img
          className="w-12 h-12 rounded-full ring-2 ring-cyan-300"
          src={user.avatar_url}
          alt={user.name}
        />
      </button>
      {isPopupOpen && (
        <Popup
          isOpen={isPopupOpen}
          setIsOpen={setIsPopupOpen}
          buttonRef={popupButtonRef}
          className="right-0 p-4 mt-2 bg-white rounded-md shadow-sm top-full"
        >
          <div className="px-2 py-2 text-sm">
            <p className="font-semibold">{user.name}</p>
            <p>{user.email}</p>
          </div>
          <div className="py-2 space-y-1">
            <Link
              to="/dashboard/user"
              className="flex items-center px-4 py-2 text-sm transition rounded-md text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
            <Form action="/logout" method="POST">
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm text-left transition rounded-md text-slate-700 hover:text-white hover:bg-cyan-500/90"
              >
                Logout
              </button>
            </Form>
          </div>
        </Popup>
      )}
    </div>
  );
}
