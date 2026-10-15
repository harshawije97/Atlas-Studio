"use client";

import { NavItemProps } from "@/lib/navitem-type";
import { cn } from "cn";
import Link from "next/link";
import React from "react";

function NavItem({ href, label, icon, active }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-[12px] leading-none outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "font-bold text-white"
          : "font-medium text-neutral-300 hover:text-white",
      )}
    >
      <span className="flex size-7 items-center justify-center [&_svg]:size-6">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default NavItem;
