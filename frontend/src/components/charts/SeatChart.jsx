import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import api from "../../services/api";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444"];

const SeatChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => {
      setData([
        {
          name: "Allocated",
          value: res.data.allocated_seats,
        },
        {
          name: "Available",
          value: res.data.available_seats,
        },
        {
          name: "Maintenance",
          value: res.data.maintenance_seats,
        },
      ]);
    });
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow h-96">
      <h2 className="text-xl font-semibold mb-4">
        Seat Distribution
      </h2>

      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeatChart;