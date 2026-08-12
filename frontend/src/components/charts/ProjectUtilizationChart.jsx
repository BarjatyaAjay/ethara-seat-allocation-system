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

const ProjectUtilizationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/project-utilization")
      .then((res) => {
        setData(
          (res.data || []).slice(0, 10).map((p) => ({
            name: p.project_code,
            utilization: p.utilization_rate,
            fulfillment: p.seat_fulfillment_rate,
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
          <h2 className="text-lg font-bold text-slate-100">Project Utilization (%)</h2>
          <p className="text-xs text-slate-400">Employee utilization & seat fulfillment rate</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`${value}%`]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(148, 163, 184, 0.15)",
                borderRadius: "0.75rem",
                color: "#f8fafc",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", color: "#94a3b8" }} />
            <Bar dataKey="utilization" fill="#818cf8" name="Employee Utilization" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            <Bar dataKey="fulfillment" fill="#22d3ee" name="Seat Fulfillment" radius={[4, 4, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectUtilizationChart;
