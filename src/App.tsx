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

// Admin
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminFamilies from "@/pages/admin/AdminFamilies";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminFlags from "@/pages/admin/AdminFlags";
import AdminTools from "@/pages/admin/AdminTools";

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
        <Route path="/seed" element={<SeedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FAB />
    </AppShell>
  );
}

function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="families" element={<AdminFamilies />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="tools" element={<AdminTools />} />
      </Routes>
    </AdminLayout>
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
              path="/admin/*"
              element={
                <AdminGuard>
                  <AdminApp />
                </AdminGuard>
              }
            />
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
