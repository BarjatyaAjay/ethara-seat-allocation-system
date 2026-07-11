import { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../ui/LoadingSpinner";

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
    const icons = {
      seat_allocated: "🪑",
      employee_added: "👤",
    };
    return icons[action] || "📋";
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      {loading ? (
        <LoadingSpinner message="Loading activity..." />
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
            >
              <span className="text-xl">{actionIcon(activity.action)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
