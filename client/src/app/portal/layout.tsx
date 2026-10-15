import AdminHeader from "@/components/local/admin-header";
import PrimarySidebar from "@/components/local/primary-sidebar";
import SidebarSecondary from "@/components/local/secondary-sidebar";
import SidebarProviderProvider from "@/providers/sidebar-provider-ctx";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProviderProvider>
      <main className="w-full">
        {/* Header */}
        <AdminHeader />
        <div className="flex w-full h-full">
          {/* Sidebar Primary */}
          <PrimarySidebar />
          {/* Sidebar Secondary */}
          <SidebarSecondary />
          <section className="min-w-0 pb-2 pt-3 mr-2 flex-1 border border-l-0 rounded-r-2xl opacity-100 mt-2 h-[calc(100svh-4.5rem)]">
            {children}
          </section>
        </div>
      </main>
    </SidebarProviderProvider>
  );
}
