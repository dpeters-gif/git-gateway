import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Users, User, CreditCard, ToggleLeft, Wrench, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Families", path: "/admin/families" },
  { icon: User, label: "Users", path: "/admin/users" },
  { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
  { icon: ToggleLeft, label: "Flags", path: "/admin/flags" },
  { icon: Wrench, label: "Tools", path: "/admin/tools" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
