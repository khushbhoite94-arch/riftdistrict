import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rift-base to-black">
      <AdminSidebar />
      <main className="lg:pl-[260px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}