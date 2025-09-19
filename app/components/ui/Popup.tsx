import React, { useEffect, useRef, useCallback } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  buttonRef: React.RefObject<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
};

export default function Popup({
  isOpen,
  setIsOpen,
  buttonRef,
  className,
  children,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target as Node) &&
      !(buttonRef.current && buttonRef.current.contains(event.target as Node))
    ) {
      setIsOpen(!isOpen);
    }
  }, [setIsOpen, isOpen, buttonRef]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div
      className={["absolute z-10", className].filter(Boolean).join(" ")}
      ref={popupRef}
    >
      {children}
    </div>
  );
}
