"use client";

import { IconHome2 } from "@tabler/icons-react";

function HomeLogo({ badge }: { badge?: number }) {
  return (
    <span className="relative flex size-11 items-center justify-center">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#7c3aed,#ec4899,#f59e0b,#22d3ee,#7c3aed)] opacity-90 blur-[6px]"
      />
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-white text-black shadow-md">
        <IconHome2 className="size-4.5" stroke={2} />
      </span>
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-pink-500 text-[11px] font-bold leading-none text-white ring-2 ring-black">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

export default HomeLogo;
