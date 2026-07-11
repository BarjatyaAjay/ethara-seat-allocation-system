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
import LoadingSpinner from "../ui/LoadingSpinner";

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

  if (loading) return <LoadingSpinner message="Loading chart..." />;

  return (
    <div className="bg-white p-5 rounded-xl shadow h-96">
      <h2 className="text-xl font-semibold mb-4">Project Utilization (%)</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="utilization" fill="#8b5cf6" name="Employee Utilization" />
          <Bar dataKey="fulfillment" fill="#f59e0b" name="Seat Fulfillment" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectUtilizationChart;
