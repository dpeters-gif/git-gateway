import { ReactNode, useState, createContext, useContext, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "./BottomNav";
import AppBar from "./AppBar";
import DesktopSidebar from "./DesktopSidebar";
import FAB from "./FAB";
import { SidebarProvider } from "@/components/ui/sidebar";
import TaskCreateForm, { type TaskFormData } from "@/components/calendar/TaskCreateForm";
import EventCreateForm, { type EventFormData } from "@/components/calendar/EventCreateForm";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useBoardNotes } from "@/hooks/useBoardNotes";
import { useNavigate } from "react-router-dom";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { profile, user } = useAuth();
  const isChild = profile?.role === "child";
  const { createTask } = useTasks();
  const { createEvent } = useEvents();
  const { createNote } = useBoardNotes();
  const navigate = useNavigate();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const handleCreateTask = useCallback(() => setShowTaskForm(true), []);
  const handleCreateEvent = useCallback(() => setShowEventForm(true), []);
  const handleCreateRoutine = useCallback(() => navigate("/settings?tab=routines"), [navigate]);
  const handleCreateNote = useCallback(() => setShowNoteForm(true), []);

  const handleTaskSubmit = useCallback((data: TaskFormData) => {
    createTask.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createTask, user]);

  const handleEventSubmit = useCallback((data: EventFormData) => {
    createEvent.mutate({ ...data, created_by_user_id: user?.id ?? null });
  }, [createEvent, user]);

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

      <FAB
        onCreateTask={handleCreateTask}
        onCreateEvent={handleCreateEvent}
        onCreateRoutine={handleCreateRoutine}
        onCreateNote={handleCreateNote}
      />

      <TaskCreateForm open={showTaskForm} onOpenChange={setShowTaskForm} onSubmit={handleTaskSubmit} />
      <EventCreateForm open={showEventForm} onOpenChange={setShowEventForm} onSubmit={handleEventSubmit} />
    </SidebarProvider>
  );
}
