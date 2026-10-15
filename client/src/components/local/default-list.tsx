"use client";
import { NavListItem, SidebarNavListProps } from "@/lib/navitem-type";
import {
  IconArrowBackUp,
  IconBolt,
  IconDots,
  IconHeart,
  IconInbox,
  IconPhoneCall,
  IconUserCheck,
  IconUserCircle,
} from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import React from "react";

// Default items
export const defaultNavListItems: NavListItem[] = [
  { label: "Inbox", href: "/inbox", icon: IconInbox },
  { label: "Replies", href: "/replies", icon: IconArrowBackUp },
  {
    label: "Assigned Comments",
    href: "/assigned-comments",
    icon: IconUserCircle,
  },
  { label: "Skills", href: "/skills", icon: IconBolt },
  { label: "Artifacts", href: "/artifacts", icon: IconHeart },
  { label: "Meetings", href: "/meetings", icon: IconPhoneCall },
  { label: "My Tasks", href: "/my-tasks", icon: IconUserCheck },
  { label: "More", href: "/more", icon: IconDots },
];

function DefaultList({
  items = defaultNavListItems,
  activeHref,
  className,
}: SidebarNavListProps) {
  return (
    <nav
      aria-label="Inbox navigation"
      className={cn("flex flex-col", className)}
    >
      <ul className="flex flex-col gap-0 mb-4">
        {items.map(({ label, href, icon: ItemIcon }) => {
          const active = activeHref === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-muted font-medium text-black"
                    : "text-neutral-600 hover:bg-muted/60 hover:text-black",
                )}
              >
                <ItemIcon
                  className="size-5 shrink-0 text-neutral-500"
                  stroke={2}
                />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mx-auto my-2 h-px w-full bg-neutral-200" />
    </nav>
  );
}

export default DefaultList;
