"use client";

import React from "react";
import { TooltipProvider } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  IconCalendar,
  IconChevronDown,
  IconCircleCheck,
  IconMicrophone,
  IconSearch,
  IconVideo,
} from "@tabler/icons-react";
import IconAction from "./icon-action";
import AiSparkle from "../svg/ai-sparkle";
import { Avatar, AvatarFallback } from "../ui/avatar";

function AdminHeader() {
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <TooltipProvider delay={200}>
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="relative flex h-14 items-center justify-between px-3">
            {/* Left: workspace switcher + calendar */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg bg-muted px-2 pr-2.5 text-sm font-medium outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex size-6 items-center justify-center rounded-md bg-teal-600 text-sm font-semibold text-white">
                    L
                  </span>
                  <span>Leaptech Workspace</span>
                  <IconChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Leaptech Workspace</DropdownMenuItem>
                  <DropdownMenuItem>Create workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <IconAction label="Calendar">
                <IconCalendar className="size-5" stroke={1.75} />
              </IconAction>
            </div>

            {/* Center: search + AI chats */}
            <div className="absolute left-1/2 hidden w-full max-w-95 -translate-x-1/2 md:block">
              <div className="flex h-9 items-center rounded-full border bg-background pl-3 pr-1 shadow-xs focus-within:ring-2 focus-within:ring-ring/50">
                <IconSearch className="size-4.5 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search"
                  aria-label="Search"
                  className="ml-2 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="mr-2 hidden whitespace-nowrap text-xs text-muted-foreground/70 lg:inline">
                  Ctrl K
                </kbd>
                <button
                  type="button"
                  className="flex h-7 items-center gap-1.5 rounded-full bg-muted px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                >
                  AI Chats
                  <AiSparkle className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Right: actions + profile */}
            <div className="flex items-center gap-1">
              <IconAction label="Tasks">
                <IconCircleCheck className="size-5" stroke={1.75} />
              </IconAction>
              <IconAction label="Meet">
                <IconVideo className="size-5" stroke={1.75} />
              </IconAction>
              <IconAction label="Voice">
                <IconMicrophone className="size-5" stroke={1.75} />
              </IconAction>

              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="ml-1 flex items-center gap-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="relative">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-neutral-900 text-sm font-semibold text-white">
                        LL
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                  </span>
                  <IconChevronDown className="size-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My account</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      </TooltipProvider>
    </>
  );
}

export default AdminHeader;
