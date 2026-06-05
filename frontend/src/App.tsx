import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Film, Users, Tag, Settings, Upload } from "lucide-react";
import WorksPage from "@/pages/WorksPage";
import WorkDetailPage from "@/pages/WorkDetailPage";
import PerformersPage from "@/pages/PerformersPage";
import PerformerDetailPage from "@/pages/PerformerDetailPage";
import TagsPage from "@/pages/TagsPage";
import CustomFieldsPage from "@/pages/CustomFieldsPage";
import ImportPage from "@/pages/ImportPage";

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-48 border-r bg-card flex flex-col gap-1 p-3 shrink-0">
          <div className="px-3 py-2 text-base font-bold text-foreground mb-2">Video Ratings</div>
          <NavItem to="/works" icon={Film} label="作品" />
          <NavItem to="/performers" icon={Users} label="出演者" />
          <NavItem to="/tags" icon={Tag} label="タグ管理" />
          <NavItem to="/import" icon={Upload} label="インポート" />
          <NavItem to="/settings" icon={Settings} label="設定" />
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<WorksPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/works/:id" element={<WorkDetailPage />} />
            <Route path="/performers" element={<PerformersPage />} />
            <Route path="/performers/:id" element={<PerformerDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/settings" element={<CustomFieldsPage />} />
            <Route path="/import" element={<ImportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
