"use client";

import React from "react";
import Toolbar from "./tool-bar";
import StatusCanvas from "./status-canvas";

function OverviewContent() {
  return (
    <div className="w-full pt-4 px-3 flex flex-col gap-y-3">
      <Toolbar />
      <StatusCanvas />
    </div>
  );
}

export default OverviewContent;
