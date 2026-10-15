"use client";

import React from "react";

type SecondarySidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggle: () => void;
};

const SecondarySidebarContext =
  React.createContext<SecondarySidebarContextValue | null>(null);

function SidebarProviderProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const toggle = React.useCallback(() => setCollapsed((c) => !c), []);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggle }),
    [collapsed, toggle],
  );

  return (
    <SecondarySidebarContext.Provider value={value}>
      {children}
    </SecondarySidebarContext.Provider>
  );
}

export function useSecondarySidebar() {
  const ctx = React.useContext(SecondarySidebarContext);
  if (!ctx) {
    throw new Error(
      "useSecondarySidebar must be used inside <SecondarySidebarProvider>",
    );
  }
  return ctx;
}

export default SidebarProviderProvider;
