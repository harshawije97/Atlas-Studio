"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import HomeLogo from "./home-logo";
import { bottomItems, mainItems } from "@/lib/constants";
import NavItem from "./nav-item";
import { useSecondarySidebar } from "@/providers/sidebar-provider-ctx";
import { cn } from "cn";
import { IconChevronsRight } from "@tabler/icons-react";

function PrimarySidebar({ unread = 1 }: { unread?: number }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSecondarySidebar();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      aria-label="Primary"
      className="sticky top-14 flex h-[calc(100svh-4.2rem)] w-15.5 shrink-0 flex-col items-center bg-black px-1.5 py-2 text-white rounded-lg mt-1 ml-2"
    >
      <nav className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
        <div
          inert={!collapsed}
          className={cn(
            "grid w-full transition-[grid-template-rows,opacity] duration-300 ease-in-out",
            collapsed
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <button
              type="button"
              aria-label="Expand sidebar"
              onClick={toggle}
              className="mx-auto flex size-9 items-center justify-center rounded-md text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <IconChevronsRight className="size-5" stroke={1.75} />
            </button>
            <div className="mx-auto my-2 h-px w-8 bg-neutral-700" />
          </div>
        </div>
        {/* Home */}
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="flex w-full flex-col items-center gap-1 rounded-lg px-1 py-1 text-[12px] font-bold leading-none text-white outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <HomeLogo badge={unread} />
          <span>Home</span>
        </Link>

        {mainItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="flex w-full flex-col items-center gap-1 pt-2">
        {bottomItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </div>
    </aside>
  );
}

export default PrimarySidebar;
