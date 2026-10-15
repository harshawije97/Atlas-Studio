"use client";
import React from "react";

function UpgradeGradient({ className }: { className?: string }) {
  const id = React.useId();

  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bulb`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="0.55" stopColor="#f472b6" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M14 4.5a7 7 0 0 0-4 12.7V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.8A7 7 0 0 0 14 4.5Z"
        fill={`url(#${id}-bulb)`}
      />
      <rect x="11" y="21.5" width="6" height="2" rx="1" fill="#c084fc" />
      <path
        d="M22.5 3.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z"
        fill="#38bdf8"
      />
      <path
        d="M5 20l.6 1.4 1.4.6-1.4.6L5 24l-.6-1.4L3 22l1.4-.6L5 20Z"
        fill="#a78bfa"
      />
    </svg>
  );
}

export default UpgradeGradient;
