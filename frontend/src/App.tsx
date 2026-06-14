import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Film, Users, Tag, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import WorksPage from "@/pages/WorksPage";
import WorkDetailPage from "@/pages/WorkDetailPage";
import PerformersPage from "@/pages/PerformersPage";
import PerformerDetailPage from "@/pages/PerformerDetailPage";
import TagsPage from "@/pages/TagsPage";
import SettingsPage from "@/pages/SettingsPage";

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  const content = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center rounded-md text-sm font-medium transition-colors ${
          collapsed ? "justify-center py-2 px-0" : "gap-2 px-3 py-2"
        } ${
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch (e) {
      console.error("Failed to read sidebar-collapsed from localStorage:", e);
      return false;
    }
  });

  const toggleSidebar = () => {
    const nextValue = !collapsed;
    setCollapsed(nextValue);
    try {
      localStorage.setItem("sidebar-collapsed", String(nextValue));
    } catch (e) {
      console.error("Failed to write sidebar-collapsed to localStorage:", e);
    }
  };

  return (
    <TooltipProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <aside className={`relative border-r bg-card flex flex-col gap-1 shrink-0 transition-all duration-200 ${collapsed ? "w-12 px-2 py-3" : "w-48 p-3"}`}>
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md hover:bg-accent hover:text-foreground transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
            </button>
            <div className={`flex items-center gap-2 py-2 mb-10 ${collapsed ? "justify-center" : "px-3"}`}>
              <img src="/favicon.svg" alt="Logo" className="w-6 h-6 shrink-0" />
              {!collapsed && <span className="text-base font-bold text-foreground truncate">Video Ratings</span>}
            </div>
            <NavItem to="/works" icon={Film} label="作品" collapsed={collapsed} />
            <NavItem to="/performers" icon={Users} label="出演者" collapsed={collapsed} />
            <NavItem to="/tags" icon={Tag} label="タグ管理" collapsed={collapsed} />
            <NavItem to="/settings" icon={Settings} label="設定" collapsed={collapsed} />
            {!collapsed && (
              <div className="mt-auto px-3 py-2 text-xs text-muted-foreground truncate">
                {import.meta.env.VITE_APP_VERSION}
              </div>
            )}
          </aside>
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<WorksPage />} />
              <Route path="/works" element={<WorksPage />} />
              <Route path="/works/:id" element={<WorkDetailPage />} />
              <Route path="/performers" element={<PerformersPage />} />
              <Route path="/performers/:id" element={<PerformerDetailPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
}
