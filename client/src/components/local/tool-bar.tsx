"use client";

import React from "react";
import { Button } from "../ui/button";
import { IconFilter2, IconRefresh } from "@tabler/icons-react";
import { InboxToolKit, TasksToolKit } from "./tasks-toolkit";

function Toolbar() {
  return (
    <div className="w-full h-9 bg-white grid grid-cols-[1fr_300px]">
      <div className="w-full h-9 flex flex-wrap">
        <Button
          variant={"outline"}
          size={"xs"}
          className="shrink-0 rounded-full text-slate-600 capitalize"
        >
          <IconFilter2 stroke={1.25} />
          filters
        </Button>
      </div>
      <div className="w-full h-9 flex flex-wrap gap-x-1 justify-end">
        {/* <TasksToolKit /> */}
        <InboxToolKit />
      </div>
    </div>
  );
}

export default Toolbar;
