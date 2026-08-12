import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaChair,
  FaCheckCircle,
  FaDoorOpen,
  FaChartPie,
  FaProjectDiagram,
} from "react-icons/fa";
import AnimatedNumber from "../ui/AnimatedNumber";

const ICON_MAP = {
  "Total Employees": FaUsers,
  "Active Employees": FaUserCheck,
  "Unassigned": FaUserClock,
  "Total Seats": FaChair,
  "Allocated Seats": FaCheckCircle,
  "Available Seats": FaDoorOpen,
  "Occupancy Rate": FaChartPie,
  "Active Projects": FaProjectDiagram,
};

const COLOR_THEMES = {
  "Total Employees": {
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    valColor: "text-cyan-400",
    glow: "hover:border-cyan-500/40",
  },
  "Active Employees": {
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    valColor: "text-emerald-400",
    glow: "hover:border-emerald-500/40",
  },
  "Unassigned": {
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    valColor: "text-amber-400",
    glow: "hover:border-amber-500/40",
  },
  "Total Seats": {
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    valColor: "text-indigo-400",
    glow: "hover:border-indigo-500/40",
  },
  "Allocated Seats": {
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    valColor: "text-emerald-400",
    glow: "hover:border-emerald-500/40",
  },
  "Available Seats": {
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    valColor: "text-cyan-400",
    glow: "hover:border-cyan-500/40",
  },
  "Occupancy Rate": {
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    valColor: "text-indigo-400 font-extrabold",
    glow: "hover:border-indigo-500/40",
  },
  "Active Projects": {
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    valColor: "text-cyan-400",
    glow: "hover:border-cyan-500/40",
  },
};

const StatCard = ({ title, value, index = 0 }) => {
  const IconComponent = ICON_MAP[title] || FaChair;
  const theme = COLOR_THEMES[title] || {
    iconBg: "bg-slate-800 text-slate-300 border-slate-700",
    valColor: "text-slate-100",
    glow: "hover:border-slate-700",
  };

  return (
    <div
      className={`glass-panel card-shine-surface p-5 rounded-2xl border border-slate-800/80 transition-all duration-300 transform hover:-translate-y-1 ${theme.glow} flex flex-col justify-between group cursor-pointer`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors duration-200">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${theme.iconBg}`}
        >
          <IconComponent size={16} />
        </div>
      </div>

      <div className="mt-1">
        <div className={`text-2xl md:text-3xl font-bold tracking-tight ${theme.valColor}`}>
          <AnimatedNumber value={value} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
