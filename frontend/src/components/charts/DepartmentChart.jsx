import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";

const DepartmentChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/department-stats")
      .then((res) => {
        setData(
          (res.data || []).slice(0, 10).map((d) => ({
            name: d.department,
            count: d.count,
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
          <h2 className="text-lg font-bold text-slate-100">Department Wise Count</h2>
          <p className="text-xs text-slate-400">Headcount breakdown per department</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="deptBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />
            <Tooltip
              formatter={(val) => [`${val} employees`, "Count"]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(148, 163, 184, 0.15)",
                borderRadius: "0.75rem",
                color: "#f8fafc",
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#deptBarGradient)"
              radius={[0, 6, 6, 0]}
              barSize={18}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentChart;
