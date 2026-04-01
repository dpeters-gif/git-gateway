import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import FAB from "@/components/layout/FAB";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import HomePage from "@/pages/HomePage";
import ParentCalendar from "@/pages/ParentCalendar";
import ParentTasks from "@/pages/ParentTasks";
import ParentRewards from "@/pages/ParentRewards";
import ParentSettings from "@/pages/ParentSettings";
import ChildQuests from "@/pages/ChildQuests";
import ChildProgress from "@/pages/ChildProgress";
import ChildRewards from "@/pages/ChildRewards";
import OnboardingFlow from "@/pages/OnboardingFlow";
import ShoppingList from "@/pages/ShoppingList";
import CareShare from "@/pages/CareShare";
import GrandparentView from "@/pages/GrandparentView";
import SeedPage from "@/pages/SeedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  return (
    <AppShell>
      <Routes>
        {/* Parent routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<ParentCalendar />} />
        <Route path="/tasks" element={<ParentTasks />} />
        <Route path="/rewards" element={<ParentRewards />} />
        <Route path="/settings" element={<ParentSettings />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/care-share" element={<CareShare />} />
        {/* Child routes */}
        <Route path="/quests" element={<ChildQuests />} />
        <Route path="/progress" element={<ChildProgress />} />
        <Route path="/child-rewards" element={<ChildRewards />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FAB />
    </AppShell>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/share" element={<GrandparentView />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
