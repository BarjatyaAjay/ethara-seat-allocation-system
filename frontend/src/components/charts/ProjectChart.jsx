import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import api from "../../services/api";

const ProjectChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setData(
        res.data.items.map((p) => ({
          name: p.project_code,
          seats: p.required_seats,
        }))
      );
    });
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow h-96">
      <h2 className="text-xl font-semibold mb-4">
        Project Seat Requirements
      </h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="seats" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectChart;