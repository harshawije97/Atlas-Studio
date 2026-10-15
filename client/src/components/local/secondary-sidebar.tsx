"use client";

import * as React from "react";
import {
  IconChecklist,
  IconChevronsLeft,
  IconClipboardText,
  IconFilter,
  IconHash,
  IconInbox,
  IconLock,
  IconMessage,
  IconPlus,
  IconSearch,
  IconAsterisk,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DefaultList from "./default-list";
import { useSecondarySidebar } from "@/providers/sidebar-provider-ctx";
import DialogContext from "./dialog-context";
import DefaultBody from "./dialog-body";

/* ---------- small building blocks ---------- */

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4.5"
    >
      {children}
    </button>
  );
}

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-8 items-center justify-between px-3">
      <h3 className="text-[13px] font-medium text-neutral-600">{children}</h3>
      {action}
    </div>
  );
}

/** Coloured rounded-square with a letter / glyph (space avatar) */
function SpaceBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

type RowProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  bold?: boolean;
  indent?: boolean;
  trailing?: React.ReactNode;
  muted?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

function Row({
  icon,
  children,
  active,
  bold,
  indent,
  trailing,
  onClick,
  muted,
}: RowProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        indent && "pl-6",
        active ? "bg-muted" : "hover:bg-muted/60",
        muted ? "text-neutral-500" : "text-neutral-800",
        bold && "font-bold text-black",
      )}
      onClick={onClick}
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-neutral-500">
        {icon}
      </span>
      {children}
      {trailing}
    </button>
  );
}

/** Round avatar with presence dot (placeholder gradient instead of a photo) */
function AgentAvatar({
  className,
  online,
  children,
}: {
  className?: string;
  online?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span className="relative flex size-6 shrink-0">
      <span
        className={cn(
          "flex size-6 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold",
          className,
        )}
      >
        {children}
      </span>
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
      ) : null}
    </span>
  );
}

/** Multi-colour "Brain" mark */
function BrainGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <circle cx="12" cy="6.5" r="4.2" fill="#7c3aed" />
      <circle cx="17.5" cy="12" r="4.2" fill="#ec4899" />
      <circle cx="12" cy="17.5" r="4.2" fill="#3b82f6" />
      <circle cx="6.5" cy="12" r="4.2" fill="#a855f7" />
      <circle cx="12" cy="12" r="3" fill="#fff" fillOpacity=".9" />
    </svg>
  );
}

/** Angular-style hexagon badge used by the "Projects" space */
function ProjectBadge() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-600">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path d="M12 3 4 6l1.3 10.5L12 21l6.7-4.5L20 6l-8-3Z" fill="#fff" />
        <path
          d="M12 7 8.5 15h1.4l.7-1.8h2.8l.7 1.8h1.4L12 7Zm0 2.7.9 2.3h-1.8l.9-2.3Z"
          fill="#4f46e5"
        />
      </svg>
    </span>
  );
}

/* ---------- sidebar ---------- */

export function SidebarSecondary() {
  const { collapsed, toggle } = useSecondarySidebar();
  const renderDialogBox = () => {
    return (
      <DialogContext>
        <DefaultBody />
      </DialogContext>
    );
  };

  return (
    <aside
      aria-label="Secondary"
      inert={collapsed}
      className={cn(
        "sticky top-14 mt-2 h-[calc(100svh-4.5rem)] shrink-0 overflow-hidden rounded-l-2xl bg-background",
        "transition-[width,margin,opacity] duration-300 ease-in-out",
        collapsed
          ? "ml-0 w-0 border-0 opacity-0"
          : "ml-2 w-63.75 border opacity-100",
      )}
    >
      <div className="w-63.75 h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-1 px-3 pb-2 pt-3 group">
          <h2 className="mr-auto text-[15px] font-semibold tracking-tight">
            Home
          </h2>
          <div className="absolute right-25 bg-white items-center gap-1 hidden group-hover:flex delay-100 animate-out">
            <HeaderIconButton label="Inbox">
              <IconInbox stroke={1.75} />
            </HeaderIconButton>
            <HeaderIconButton label="Search">
              <IconSearch stroke={1.75} />
            </HeaderIconButton>
            <HeaderIconButton label="Filter">
              <IconFilter stroke={1.75} />
            </HeaderIconButton>
            <HeaderIconButton label="Collapse sidebar" onClick={toggle}>
              <IconChevronsLeft stroke={1.75} />
            </HeaderIconButton>
          </div>
          <Button size={"sm"} className="ml-auto">
            <IconPlus stroke={1.75} />
            Create
          </Button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-1.5 pb-3 [scrollbar-color:var(--color-neutral-300)_transparent] scrollbar-thin">
          {/* Default items */}
          <DefaultList />

          {/* Spaces */}
          <SectionLabel
            action={
              <DialogContext
                renderContent={
                  <button
                    type="button"
                    aria-label="Add space"
                    className="flex size-6 items-center justify-center rounded-md bg-muted text-neutral-600 hover:bg-neutral-200"
                  >
                    <IconPlus className="size-4" stroke={2} />
                  </button>
                }
              >
                <DefaultBody />
              </DialogContext>
            }
          >
            Spaces
          </SectionLabel>

          <Row
            icon={
              <span className="flex size-6 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50">
                <IconAsterisk className="size-4 text-neutral-600" stroke={2} />
              </span>
            }
          >
            <span>
              All Tasks
              <span className="ml-1 text-[13px] text-neutral-500">
                - Leaptech Workspace
              </span>
            </span>
          </Row>

          <Row
            active
            icon={<SpaceBadge className="bg-blue-600">L</SpaceBadge>}
            trailing={
              <IconPlus
                className="ml-auto size-4.5 text-neutral-700"
                stroke={2}
              />
            }
          >
            <span className="font-medium text-black">Leads</span>
            <IconLock className="size-3.5 text-neutral-800" stroke={2.25} />
          </Row>
          <Row
            indent
            icon={<IconClipboardText className="size-5" stroke={1.75} />}
          >
            Sales
          </Row>
          <Row indent icon={<IconChecklist className="size-5" stroke={1.75} />}>
            Contacts
          </Row>

          <Row icon={<SpaceBadge className="bg-teal-500">L</SpaceBadge>}>
            LMS &amp; GPT Content
          </Row>
          <Row
            icon={<ProjectBadge />}
            trailing={
              <IconLock className="size-3.5 text-neutral-400" stroke={2.25} />
            }
          >
            <span className="truncate">Projects - Oct 13 to Dec 13</span>
          </Row>
          <Row
            muted
            icon={<IconPlus className="size-5" stroke={1.5} />}
            onClick={() => renderDialogBox()}
          >
            New Space
          </Row>

          {/* AI Chats */}
          <div className="mt-4" />
          <SectionLabel>AI Chats</SectionLabel>
          <p className="px-3.5 py-1.5 text-[13px] text-neutral-500">
            Last month
          </p>
          <Row
            icon={<IconMessage className="size-5" stroke={1.5} />}
            trailing={
              <span className="ml-auto shrink-0 text-[12px] text-neutral-500">
                11:44 am
              </span>
            }
          >
            <span className="truncate">Board Organizer Ag…</span>
          </Row>
          <Row
            icon={<IconMessage className="size-5" stroke={1.5} />}
            trailing={
              <span className="ml-auto shrink-0 text-[12px] text-neutral-500">
                11:28 am
              </span>
            }
          >
            <span className="truncate">Lead and Call Templ…</span>
          </Row>
          <Row muted icon={<IconPlus className="size-5" stroke={1.5} />}>
            Ask, Build, Create
          </Row>

          {/* Super Agents */}
          <div className="mt-4" />
          <SectionLabel>Super Agents</SectionLabel>
          <Row
            bold
            icon={
              <AgentAvatar
                online
                className="bg-linear-to-br from-pink-200 to-amber-100 text-neutral-700"
              >
                OA
              </AgentAvatar>
            }
            trailing={
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-pink-500 text-[12px] font-bold leading-none text-white">
                2
              </span>
            }
          >
            Onboarding Assistant
          </Row>
          <Row icon={<BrainGlyph />}>Brain</Row>
          <Row
            icon={
              <AgentAvatar
                online
                className="bg-linear-to-br from-rose-200 to-fuchsia-200 text-neutral-700"
              >
                LL
              </AgentAvatar>
            }
          >
            Leads Lenny
          </Row>
          <Row muted icon={<IconPlus className="size-5" stroke={1.5} />}>
            New Super Agent
          </Row>

          {/* Channels */}
          <div className="mt-4" />
          <SectionLabel>Channels</SectionLabel>
          <Row icon={<IconHash className="size-5" stroke={1.75} />}>
            Welcome
          </Row>
        </div>
      </div>
    </aside>
  );
}

export default SidebarSecondary;
