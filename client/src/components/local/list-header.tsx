"use client";

import {
  IconCalendarEvent,
  IconChevronDown,
  IconFileText,
  IconFlag,
  IconLayoutBoardSplit,
  IconList,
  IconMenu2,
  IconPlus,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import React from "react";
import { Button } from "../ui/button";

const views = [
  { label: "List", icon: IconList },
  { label: "Board", icon: IconLayoutBoardSplit },
  { label: "Doc", icon: IconFileText },
];

function ListHeader() {
  const [activeView, setActiveView] = React.useState<string>("List");
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  return (
    <header className="w-full h-20 flex flex-col gap-1 border-b border-b-muted px-3.5">
      <div className="flex h-8 items-center gap-2 overflow-hidden group">
        <div className="flex size-4.5 shrink-0 items-center justify-center rounded-[5px] bg-emerald-500 text-[11px] font-bold text-white">
          L
        </div>
        {/* Breadcrumb */}
        <Button
          variant={"ghost"}
          className="shrink-0 whitespace-nowrap text-[16px] text-[#64748b] hover:text-[#24292f]"
        >
          LMS &amp; GPT Content
        </Button>
        <span className="shrink-0 text-lg text-slate-400">/</span>
        <Button
          variant={"ghost"}
          className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[16px] font-semibold text-[#202124]"
        >
          <IconList size={20} stroke={2} className="shrink-0" />
          <span className="truncate">LMS features and updates list</span>
          <IconChevronDown size={15} className="shrink-0 text-[#777b80]" />
        </Button>
        {/* Favorite */}
        <button
          aria-label="Toggle favorite"
          aria-pressed={isFavorite}
          onClick={() => setIsFavorite(!isFavorite)}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#555b63] hover:bg-gray-100"
        >
          <IconStar
            size={19}
            stroke={1.8}
            fill={isFavorite ? "#facc15" : "none"}
            className={isFavorite ? "text-yellow-500" : ""}
          />
        </button>

        {/* Quick actions */}
        <div className="h-7 shrink-0 items-center rounded-md bg-muted/50 hidden group-hover:flex">
          <Button
            variant={"ghost"}
            aria-label="More options"
            className="flex size-4 items-center justify-center rounded-l-md text-[#73777d] hover:bg-gray-100"
          >
            <IconMenu2 size={14} />
          </Button>
          <Button
            variant={"ghost"}
            aria-label="Members"
            className="flex size-4 items-center justify-center text-[#73777d] hover:bg-gray-100"
          >
            <IconUser size={14} />
          </Button>
          <Button
            variant={"ghost"}
            aria-label="Priority"
            className="flex size-4 items-center justify-center text-[#73777d] hover:bg-gray-100"
          >
            <IconFlag size={14} />
          </Button>
          <Button
            variant={"ghost"}
            aria-label="Calendar"
            className="flex size-4 items-center justify-center rounded-r-md text-[#73777d] hover:bg-gray-100"
          >
            <IconCalendarEvent size={14} />
          </Button>
        </div>
      </div>
      {/* Bottom row */}
      <nav
        aria-label="Project views"
        className="flex h-10 items-center gap-3 overflow-x-auto whitespace-nowrap"
      >
        <Button
          variant={"outline"}
          className="flex h-7.25 shrink-0 items-center rounded-md border border-[#e0e3e7] px-1.75 text-sm text-[#73777d] hover:bg-gray-50"
        >
          Add Channel
        </Button>

        <div className="flex h-full items-center gap-3">
          {views.map(({ label, icon: ViewIcon }) => {
            const isActive = activeView === label;

            return (
              <Button
                key={label}
                variant={"ghost"}
                onClick={() => setActiveView(label)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-full shrink-0 items-center gap-1.25 text-sm transition-colors ${
                  isActive
                    ? "text-[#30343b]"
                    : "text-[#62666d] hover:text-[#202124]"
                }`}
              >
                <ViewIcon
                  size={19}
                  stroke={2}
                  className={
                    label === "List"
                      ? "text-[#888b90]"
                      : label === "Board"
                        ? "text-[#4263eb]"
                        : "text-[#168bfa]"
                  }
                  fill={label === "Board" ? "#4263eb" : "none"}
                />
                {label}
              </Button>
            );
          })}
        </div>

        <div className="mx-0.5 h-6 w-px shrink-0 bg-[#e5e7eb]" />

        <Button
          variant={"ghost"}
          className="flex shrink-0 items-center gap-2 text-sm text-[#62666d] hover:text-[#202124]"
        >
          <IconPlus size={19} stroke={1.8} />
          View
        </Button>
      </nav>
    </header>
  );
}

export default ListHeader;
