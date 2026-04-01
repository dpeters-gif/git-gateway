import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "./BottomNav";
import AppBar from "./AppBar";
import DesktopSidebar from "./DesktopSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { profile } = useAuth();
  const isChild = profile?.role === "child";

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full ${isChild ? "bg-child-bg" : "bg-background"}`}>
        {!isChild && <DesktopSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <AppBar />
          <main className="flex-1 pt-app-bar pb-bottom-nav xl:pb-0 px-6 md:px-8 max-w-content-max mx-auto w-full">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
