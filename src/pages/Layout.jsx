
import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/contexts/AuthContext";

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        {/* This div correctly offsets the main content area */}
        <div className="ml-64 flex-1"> {/* This div occupies the space to the right of the sidebar */}
          <main className="h-full overflow-auto relative z-10 p-6"> {/* The main content scrolls within this space */}
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

