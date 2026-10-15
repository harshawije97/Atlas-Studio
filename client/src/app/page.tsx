import AdminHeader from "@/components/local/admin-header";
import PrimarySidebar from "@/components/local/primary-sidebar";
import SidebarSecondary from "@/components/local/secondary-sidebar";

export default function Home() {
  return (
    <main className="w-full">
      {/* Header */}
      <AdminHeader />
      {/* Sidebar Primary */}
      <div className="flex w-full h-full">
        <PrimarySidebar />
        {/* Sidebar Secondary */}
        <SidebarSecondary />
        {/* Content area */}
        <section className="min-w-0 flex-1">{/* Content area */}</section>
      </div>
    </main>
  );
}
