import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  GitBranch,
  Home,
  LayoutDashboard,
  Target,
  Milestone,
  History,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import GuideBot from "./GuideBot.jsx";

const NAV_ITEMS = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/planner", label: "Roadmap", icon: Milestone },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const PAGE_TITLES = {
  "/app": "Home",
  "/dashboard": "Dashboard",
  "/skill-gap": "Skill Gap",
  "/planner": "Roadmap",
  "/history": "History",
  "/settings": "Settings",
};

const COLLAPSE_KEY = "devtrack_sidebar_collapsed";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/repo/") ? "Repository Analysis" : "");

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, !c ? "1" : "0");
      return !c;
    });
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }
  return (
    <div className="min-h-screen flex bg-bg">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-bg flex items-center justify-between px-4 z-50">
        <NavLink
          to="/app"
          className="flex items-center gap-2 font-display font-semibold text-lg"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
            <GitBranch size={15} strokeWidth={2.5} />
          </span>
          DevTrack
        </NavLink>

        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-card text-ink-soft hover:text-ink hover:bg-panel transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen shrink-0
        border-r border-border flex flex-col px-4 py-6 bg-bg z-50
        transition-all duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        w-60 ${collapsed ? "md:w-[72px] md:px-2.5" : "md:w-60"}`}
      >
        <div
          className={`flex items-center mb-8 ${
            collapsed ? "md:flex-col md:gap-3" : "justify-between px-2"
          }`}
        >
          <NavLink
            to="/app"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 font-display font-semibold text-lg"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center shrink-0">
              <GitBranch size={15} strokeWidth={2.5} />
            </span>

            <span className={collapsed ? "md:hidden" : ""}>DevTrack</span>
          </NavLink>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-card text-ink-soft hover:text-ink hover:bg-panel"
          >
            <X size={18} />
          </button>

          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-card text-ink-faint hover:text-ink hover:bg-panel transition-colors"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-card text-sm font-mono transition-colors ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  isActive
                    ? "bg-violet-soft text-violet font-semibold"
                    : "text-ink-soft hover:text-ink hover:bg-panel"
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/settings"
          title="Settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-card hover:bg-panel transition-colors ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-semibold text-bg shrink-0"
            style={{ background: profile?.avatar_color || "#8B5CF6" }}
          >
            {(profile?.first_name || "U").charAt(0).toUpperCase()}
          </span>

          <div className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
            <p className="text-xs font-mono font-semibold truncate">
              {profile?.first_name
                ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                : "Set your name"}
            </p>

            <p className="text-[10px] text-ink-faint font-mono truncate">
              {profile?.email}
            </p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          title="Log out"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-card text-sm font-mono text-flag hover:bg-flag-soft transition-colors mt-1 ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Log out</span>
        </button>
      </aside>

      <main
        className="relative flex-1 flex flex-col pt-16 md:pt-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundPosition: "center 25%",
        }}
      >
        <div className="absolute inset-0 bg-bg/40" />

        <div className="relative hidden md:flex items-center justify-between px-8 h-16 border-b border-border bg-bg/70 backdrop-blur-sm sticky top-0 z-10">
          <p className="font-display text-sm font-semibold text-ink-soft">
            {pageTitle}
          </p>

          <NavLink
            to="/settings"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-card hover:bg-panel transition-colors"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-semibold text-bg shrink-0"
              style={{ background: profile?.avatar_color || "#8B5CF6" }}
            >
              {(profile?.first_name || "U").charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 text-right">
              <p className="text-xs font-mono font-semibold truncate">
                {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                  : "Set your name"}
              </p>

              <p className="text-[10px] text-ink-faint font-mono truncate">
                {profile?.email}
              </p>
            </div>
          </NavLink>
        </div>

        <div className="relative px-5 md:px-8 py-8 md:py-10 max-w-6xl w-full">
          <Outlet />
        </div>
      </main>

      <GuideBot />
    </div>
  );
}
