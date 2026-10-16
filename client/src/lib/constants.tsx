import UpgradeGradient from "@/components/svg/upgrade-gradient";
import {
  IconBrain,
  IconCalendarEvent,
  IconClipboardCheck,
  IconDownload,
  IconFileText,
  IconGridDots,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

const prefix = "/portal";
export const mainItems = [
  {
    href: `${prefix}/planner`,
    label: "Planner",
    icon: <IconCalendarEvent stroke={1.5} />,
  },
  { href: `${prefix}/ai`, label: "AI", icon: <IconBrain stroke={1.5} /> },
  { href: `${prefix}/teams`, label: "Teams", icon: <IconUsers stroke={1.5} /> },
  {
    href: `${prefix}/docs`,
    label: "Docs",
    icon: <IconFileText stroke={1.5} />,
  },
  { href: "/forms", label: "Forms", icon: <IconClipboardCheck stroke={1.5} /> },
  { href: "/more", label: "More", icon: <IconGridDots stroke={1.5} /> },
];

export const bottomItems = [
  { href: "/install", label: "Install", icon: <IconDownload stroke={1.5} /> },
  { href: "/invite", label: "Invite", icon: <IconUserPlus stroke={1.5} /> },
  { href: "/upgrade", label: "Upgrade", icon: <UpgradeGradient /> },
];
