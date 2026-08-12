import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import api from "../../services/api";
import Skeleton from "../ui/Skeleton";
import AnimatedNumber from "../ui/AnimatedNumber";

const COLORS = ["#34d399", "#22d3ee", "#fbbf24"];

const SeatChart = () => {
  const [data, setData] = useState([]);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => {
        setOccupancyRate(res.data.occupancy_rate || 0);
        const chartItems = [
          { name: "Allocated", value: res.data.allocated_seats || 0 },
          { name: "Available", value: res.data.available_seats || 0 },
          { name: "Maintenance", value: res.data.maintenance_seats || 0 },
        ].filter((item) => item.value > 0);

        setData(chartItems);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton type="chart" />;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 h-96 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Seat Distribution</h2>
          <p className="text-xs text-slate-400">Current allocation breakdown</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Live Data
        </span>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={activeIndex !== null ? 106 : 98}
              paddingAngle={4}
              cornerRadius={6}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(11, 18, 32, 0.9)"
                  strokeWidth={2}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [`${val} seats`, name]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(148, 163, 184, 0.15)",
                borderRadius: "0.75rem",
                color: "#f8fafc",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold text-cyan-400">
            <AnimatedNumber value={`${occupancyRate}%`} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Occupancy
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/60">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-slate-300 font-medium">{item.name}:</span>
            <span className="text-slate-400 font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatChart;