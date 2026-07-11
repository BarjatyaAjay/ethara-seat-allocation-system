import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/ui/card";
import DepartmentChart from "../components/charts/DepartmentChart";
import FloorUtilizationChart from "../components/charts/FloorUtilizationChart";
import ProjectChart from "../components/charts/ProjectChart";
import ProjectUtilizationChart from "../components/charts/ProjectUtilizationChart";
import SeatChart from "../components/charts/SeatChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load dashboard data
      </div>
    );
  }

  const occupancyCards = [
    { title: "Total Employees", value: summary.total_employees, color: "text-blue-600" },
    { title: "Active Employees", value: summary.active_employees, color: "text-green-600" },
    { title: "Unassigned", value: summary.unassigned_employees, color: "text-orange-600" },
    { title: "Total Seats", value: summary.total_seats, color: "text-indigo-600" },
    { title: "Allocated Seats", value: summary.allocated_seats, color: "text-emerald-600" },
    { title: "Available Seats", value: summary.available_seats, color: "text-sky-600" },
    { title: "Occupancy Rate", value: `${summary.occupancy_rate}%`, color: "text-purple-600" },
    { title: "Active Projects", value: summary.active_projects, color: "text-rose-600" },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Ethara Seat Allocation Overview</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {occupancyCards.map((card) => (
          <Card key={card.title} title={card.title}>
            <p className={`text-2xl md:text-3xl font-bold ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SeatChart />
        <DepartmentChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FloorUtilizationChart />
        <ProjectUtilizationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectChart />
        <RecentActivity />
      </div>
    </div>
  );
}

export default Dashboard;
