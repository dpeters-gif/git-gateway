import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "./BottomNav";
import AppBar from "./AppBar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { profile } = useAuth();
  const isChild = profile?.role === "child";

  return (
    <div className={`min-h-screen ${isChild ? "bg-child-bg" : "bg-background"}`}>
      <AppBar />
      <main className="pt-app-bar pb-bottom-nav px-6 md:px-8 max-w-content-max mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
