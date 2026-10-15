import AdminHeader from "@/components/local/admin-header";
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
            <header className="w-full h-19 flex flex-col gap-1 border-b border-b-muted px-3.5 ">
              <h2 className="text-[15px] font-semibold tracking-tight">
                Home
              </h2>
            </header>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem,
              accusamus soluta quasi voluptates sit ab et natus explicabo
              commodi nesciunt dolorum odio fugiat architecto doloremque quis
              corrupti deleniti ullam aperiam.
            </p>
          </section>
        </div>
      </main>
    </SidebarProviderProvider>
  );
}
