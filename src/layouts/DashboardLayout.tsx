import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#f3f5f8]" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-dvh min-w-0 lg:mr-[260px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full min-w-0 max-w-[1720px] overflow-x-clip p-4 md:p-5 xl:p-6">
          <Suspense
            fallback={
              <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-live="polite">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <span className="sr-only">جاري تحميل الصفحة...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
