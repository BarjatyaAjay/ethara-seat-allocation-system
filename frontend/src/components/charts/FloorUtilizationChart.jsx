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
import LoadingSpinner from "../ui/LoadingSpinner";

const FloorUtilizationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/floor-utilization")
      .then((res) => {
        setData(
          (res.data || []).map((f) => ({
            name: `F${f.floor}`,
            allocated: f.allocated_seats,
            available: f.available_seats,
            occupancy: f.occupancy_rate,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading chart..." />;

  return (
    <div className="bg-white p-5 rounded-xl shadow h-96">
      <h2 className="text-xl font-semibold mb-4">Floor Utilization</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="allocated" fill="#22c55e" name="Allocated" stackId="a" />
          <Bar dataKey="available" fill="#94a3b8" name="Available" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FloorUtilizationChart;
