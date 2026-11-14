import React from 'react';
import { headers } from 'next/headers';
import { MediaImportProvider } from '@/context/MediaImportContext';
import { AdminNavProvider } from '@/context/AdminNavContext';
import { BackgroundImportWidget } from '@/components/admin/BackgroundImportWidget';
import { AdminMediaJobBanner } from '@/components/admin/AdminMediaJobBanner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname');

  // If on login page, render clean full-page without admin sidebar & header
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <MediaImportProvider>
      <AdminNavProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7F4] text-stone-900 font-sans">
          {/* RESPONSIVE SIDEBAR */}
          <AdminSidebar />

          {/* RIGHT CONTENT COLUMN */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {/* TOP ADMIN HEADER */}
            <AdminHeader />

            {/* SCROLLABLE MAIN CONTENT AREA */}
            <main id="main-content" className="flex-1 overflow-y-auto bg-[#F8F7F4]">
              {children}
            </main>
          </div>
        </div>
        <BackgroundImportWidget />
        <AdminMediaJobBanner />
      </AdminNavProvider>
    </MediaImportProvider>
  );
}
