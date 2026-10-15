"use client";
function AiGraph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3.5c1.9 0 3 1.2 3 3 1.8 0 3 1.1 3 3 0 1.2-.6 2.1-1.5 2.6 1 .5 1.5 1.4 1.5 2.4 0 1.9-1.2 3-3 3 0 1.8-1.1 3-3 3s-3-1.2-3-3c-1.8 0-3-1.1-3-3 0-1 .5-1.9 1.5-2.4-.9-.5-1.5-1.4-1.5-2.6 0-1.9 1.2-3 3-3 0-1.8 1.1-3 3-3Z" />
      <circle cx="12" cy="12" r="1.6" />
    </svg>
  );
}

export default AiGraph;
