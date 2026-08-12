import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";

const FloorUtilizationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/floor-utilization")
      .then((res) => {
        setData(
          (res.data || []).map((f) => ({
            name: `Floor ${f.floor}`,
            allocated: f.allocated_seats,
            available: f.available_seats,
            occupancy: f.occupancy_rate,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton type="chart" />;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 h-96 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Floor Utilization</h2>
          <p className="text-xs text-slate-400">Allocated vs Available seats per floor</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(148, 163, 184, 0.15)",
                borderRadius: "0.75rem",
                color: "#f8fafc",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", color: "#94a3b8" }} />
            <Bar dataKey="allocated" fill="#34d399" name="Allocated" stackId="a" radius={[0, 0, 4, 4]} isAnimationActive={true} />
            <Bar dataKey="available" fill="#22d3ee" name="Available" stackId="a" radius={[4, 4, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FloorUtilizationChart;
