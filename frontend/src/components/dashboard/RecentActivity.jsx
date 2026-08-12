import { useEffect, useState } from "react";
import { FaChair, FaUserPlus, FaHistory } from "react-icons/fa";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/recent-activity")
      .then((res) => setActivities(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionIcon = (action) => {
    switch (action) {
      case "seat_allocated":
        return <FaChair className="text-emerald-400" />;
      case "employee_added":
        return <FaUserPlus className="text-sky-400" />;
      default:
        return <FaHistory className="text-purple-400" />;
    }
  };

  const formatTime = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return ts;
    }
  };

  if (loading) return <Skeleton type="chart" />;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 h-96 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Recent Activity</h2>
          <p className="text-xs text-slate-400">Live audit log & event stream</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Realtime
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <FaHistory className="text-3xl text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No recent activity recorded</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/40 transition group"
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition">
                {actionIcon(activity.action)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  {activity.description}
                </p>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 inline-block">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
