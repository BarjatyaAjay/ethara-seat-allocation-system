import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaBell,
  FaRobot,
  FaUserShield,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const PAGE_NAMES = {
  "/": "Dashboard Overview",
  "/employees": "Workforce Directory",
  "/projects": "Project Management",
  "/seats": "Seat Allocation",
  "/assistant": "AI Command Center",
};

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const currentPage = PAGE_NAMES[location.pathname] || "Dashboard";

  return (
    <header className="h-18 glass-header sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 border-b border-slate-800/80">
      {/* Left section: Mobile menu toggle + Breadcrumb Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <FaBars size={18} />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-400">
          <span className="hidden sm:inline hover:text-slate-200 transition">Ethara OS</span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <span className="text-slate-100 font-semibold truncate gradient-text-primary">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Right Section: Actions + Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 text-xs cursor-pointer hover:border-sky-500/40 hover:shadow-[0_0_12px_rgba(56,189,248,0.15)] transition-all duration-200">
          <FaSearch size={12} className="text-slate-400" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </div>

        {/* AI Quick Shortcut with Ambient Pulse & Scale */}
        <button
          onClick={() => navigate("/assistant")}
          className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(192,132,252,0.25)] btn-micro relative"
          title="Open AI Assistant"
        >
          <FaRobot size={15} />
        </button>

        {/* Notifications Icon with Subtle Cyan Dot Pulse */}
        <button
          onClick={() => toast.success("System fully operational. 0 alerts.")}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 btn-micro relative"
          title="Notifications"
        >
          <FaBell size={15} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 animate-dot-pulse" />
        </button>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Admin Profile Section */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 pl-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 btn-micro"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md">
              AD
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100 leading-tight">Admin User</span>
              <span className="text-[10px] text-slate-400 font-medium">System Manager</span>
            </div>

            <FaChevronDown size={10} className="text-slate-400 ml-1 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu with Smooth Entrance Animation */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 glass-panel border border-slate-700/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                <p className="text-xs font-bold text-slate-100">Ethara Enterprise Admin</p>
                <p className="text-[11px] text-slate-400 truncate">admin@ethara.internal</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setProfileOpen(false); toast("Admin governance panel active"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                >
                  <FaUserShield className="text-sky-400" /> System Governance
                </button>
                <button
                  onClick={() => { setProfileOpen(false); toast("API Status: 100% operational"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                >
                  <FaCircle className="text-emerald-400 text-[8px]" /> API Health Check
                </button>
                <button
                  onClick={() => { setProfileOpen(false); toast("Settings saved"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
                >
                  <FaCog className="text-slate-400" /> Platform Preferences
                </button>
              </div>

              <div className="border-t border-slate-800/80 mt-1 pt-1">
                <button
                  onClick={() => { setProfileOpen(false); toast.success("Admin session active"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <FaSignOutAlt /> Active Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
