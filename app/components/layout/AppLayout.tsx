import { Link, useLocation, Form } from "react-router";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileText,
  LogOut,
  Menu,
  X,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/prescriptions", label: "Prescriptions", icon: FileText },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function AppLayout({ children, title, breadcrumb }: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { config, loading } = useConfigurables();
  const { user } = useAuth();

  const appName = loading ? "Clinic Coordinator" : (config?.appName ?? "Clinic Coordinator");
  const footerText = loading ? "" : (config?.footerText ?? "© 2026 Clinic Coordinator");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-slate-100 shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{appName}</p>
            <p className="text-xs text-slate-500">Clinic Management</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-teal-50 text-teal-700 border border-teal-200/80"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0",
                      isActive ? "text-teal-600" : "text-slate-400"
                    )}
                    size={18}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-teal-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase shrink-0">
              {user?.username?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.username ?? "User"}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user?.role ?? "staff"}
              </p>
            </div>
          </div>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} className="shrink-0" />
              Sign out
            </button>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-400 text-center">{footerText}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 ? (
              breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="text-slate-500 hover:text-teal-700 font-medium transition-colors truncate"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900 truncate">{item.label}</span>
                  )}
                </span>
              ))
            ) : (
              <span className="font-semibold text-slate-900 truncate">{title}</span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
