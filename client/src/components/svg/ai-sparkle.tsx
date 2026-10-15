import { cn } from "cn";

function AiSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden>
      <circle cx="8" cy="8" r="4" fill="#7c3aed" />
      <circle cx="16" cy="8" r="4" fill="#ec4899" />
      <circle cx="8" cy="16" r="4" fill="#3b82f6" />
      <circle cx="16" cy="16" r="4" fill="#f59e0b" />
      <circle cx="12" cy="12" r="3" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}

export default AiSparkle