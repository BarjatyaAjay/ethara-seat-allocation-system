import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaProjectDiagram,
  FaChair,
  FaRobot,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCube,
} from "react-icons/fa";

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/", icon: FaHome },
    { name: "Employees", path: "/employees", icon: FaUsers },
    { name: "Projects", path: "/projects", icon: FaProjectDiagram },
    { name: "Seats", path: "/seats", icon: FaChair },
    { name: "AI Assistant", path: "/assistant", icon: FaRobot, badge: "AI" },
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col glass-header border-r border-slate-800/80 transition-all duration-300 ease-out ${
        collapsed ? "w-20" : "w-64"
      } ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Top Logo Section */}
      <div className="flex items-center justify-between px-5 h-18 border-b border-slate-800/60">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <FaCube className="text-sky-400 text-lg group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-wider gradient-text-blue">
                ETHARA
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                Enterprise SaaS
              </span>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menus.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              title={collapsed ? item.name : undefined}
              className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-slate-800/80 text-sky-400 border border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.18)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              {/* Left Accent Glow Bar on Active Item */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-400 rounded-r-full shadow-[0_0_10px_#38bdf8]" />
              )}

              <div
                className={`p-2 rounded-lg transition-transform duration-200 ${
                  active
                    ? "bg-sky-500/20 text-sky-400 scale-105"
                    : "text-slate-400 group-hover:text-sky-300 group-hover:scale-105"
                }`}
              >
                <Icon size={16} />
              </div>

              {!collapsed && (
                <span className="flex-1 tracking-wide transition-colors duration-200 group-hover:text-slate-100">
                  {item.name}
                </span>
              )}

              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer (Desktop) */}
      <div className="hidden lg:flex items-center justify-between p-4 border-t border-slate-800/60">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800/80 btn-micro"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          {!collapsed && <span className="text-xs font-semibold">Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
