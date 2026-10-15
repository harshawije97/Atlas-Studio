import { Icon } from "@tabler/icons-react";

export type NavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

export type SidebarNavListProps = {
  items?: NavListItem[];
  activeHref?: string;
  className?: string;
};

export type NavListItem = {
  label: string;
  href: string;
  icon: Icon;
};
