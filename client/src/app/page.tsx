import AdminHeader from "@/components/local/admin-header";
import ListHeader from "@/components/local/list-header";
import OverviewContent from "@/components/local/overview-content";
import PrimarySidebar from "@/components/local/primary-sidebar";
import SidebarSecondary from "@/components/local/secondary-sidebar";
import SidebarProviderProvider from "@/providers/sidebar-provider-ctx";

export default function Home() {
  return (
    <SidebarProviderProvider>
      <main className="w-full">
        {/* Header */}
        <AdminHeader />
        {/* Sidebar Primary */}
        <div className="flex w-full h-full">
          <PrimarySidebar />
          {/* Sidebar Secondary */}
          <SidebarSecondary />
          {/* Content area */}
          <section className="min-w-0 pb-2 pt-3 mr-2 flex-1 border border-l-0 rounded-r-2xl opacity-100 mt-2 h-[calc(100svh-4.5rem)]">
            <ListHeader />
            <div className="flex w-full flex-wrap">
              <OverviewContent />
            </div>
          </section>
        </div>
      </main>
    </SidebarProviderProvider>
  );
}
