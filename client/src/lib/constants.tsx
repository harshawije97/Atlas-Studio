import UpgradeGradient from "@/components/svg/upgrade-gradient";
import { IconBrain, IconCalendarEvent, IconClipboardCheck, IconDownload, IconFileText, IconGridDots, IconUserPlus, IconUsers } from "@tabler/icons-react";

export const mainItems = [
  {
    href: "/planner",
    label: "Planner",
    icon: <IconCalendarEvent stroke={1.5} />,
  },
  { href: "/ai", label: "AI", icon: <IconBrain stroke={1.5} /> },
  { href: "/teams", label: "Teams", icon: <IconUsers stroke={1.5} /> },
  { href: "/docs", label: "Docs", icon: <IconFileText stroke={1.5} /> },
  { href: "/forms", label: "Forms", icon: <IconClipboardCheck stroke={1.5} /> },
  { href: "/more", label: "More", icon: <IconGridDots stroke={1.5} /> },
];
 
export const bottomItems = [
  { href: "/install", label: "Install", icon: <IconDownload stroke={1.5} /> },
  { href: "/invite", label: "Invite", icon: <IconUserPlus stroke={1.5} /> },
  { href: "/upgrade", label: "Upgrade", icon: <UpgradeGradient /> },
];