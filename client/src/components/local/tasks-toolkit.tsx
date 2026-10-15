"use client";

import { Button } from "../ui/button";
import { IconChecks, IconRefresh, IconSettings } from "@tabler/icons-react";

export function TasksToolKit() {
  return (
    <>
      <Button
        variant={"outline"}
        size={"xs"}
        className="shrink-0 rounded-full text-slate-600 capitalize"
      >
        <IconRefresh stroke={1.25} className="animate animate-spin" />
        refreshing
      </Button>
      <Button
        variant={"secondary"}
        size={"xs"}
        className="shrink-0 rounded-full text-slate-600"
      >
        Auto refresh on
      </Button>
      <Button variant={"default"} size={"xs"} className="shrink-0">
        Add Task
      </Button>
    </>
  );
}

export function InboxToolKit() {
  return (
    <>
      <Button
        variant={"outline"}
        className="shrink-0 size-6 rounded text-slate-600 capitalize"
      >
        <IconSettings stroke={1.25} />
      </Button>
      <Button
        variant={"secondary"}
        size={"xs"}
        className="shrink-0 rounded-full text-slate-600"
      >
        Clear all
        <IconChecks stroke={1.25} />
      </Button>
    </>
  );
}
