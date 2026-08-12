import { useEffect, useState, useCallback } from "react";
import { FaSyncAlt, FaCircle, FaShieldAlt, FaBolt, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";
import api from "../services/api";
import StatCard from "../components/cards/StatCard";
import DepartmentChart from "../components/charts/DepartmentChart";
import FloorUtilizationChart from "../components/charts/FloorUtilizationChart";
import ProjectChart from "../components/charts/ProjectChart";
import ProjectUtilizationChart from "../components/charts/ProjectUtilizationChart";
import SeatChart from "../components/charts/SeatChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import Skeleton from "../components/ui/Skeleton";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchSummary = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);

    try {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Loading State
  if (loading && !summary) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-page-entrance">
        <div className="h-24 bg-slate-900/60 rounded-3xl animate-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} type="card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton type="chart" />
          <Skeleton type="chart" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !summary) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh] animate-page-entrance">
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800/80 text-center max-w-md w-full space-y-4 shadow-2xl">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
            <FaExclamationTriangle size={22} />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Unable to load dashboard data</h3>
            <p className="text-xs text-slate-400">Check your connection and try again.</p>
          </div>

          <button
            onClick={() => fetchSummary(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg btn-micro btn-shine"
          >
            <FaSyncAlt size={12} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Retrying..." : "Retry"}</span>
          </button>
        </div>
      </div>
    );
  }

  const occupancyCards = [
    { title: "Total Employees", value: summary.total_employees },
    { title: "Active Employees", value: summary.active_employees },
    { title: "Unassigned", value: summary.unassigned_employees },
    { title: "Total Seats", value: summary.total_seats },
    { title: "Allocated Seats", value: summary.allocated_seats },
    { title: "Available Seats", value: summary.available_seats },
    { title: "Occupancy Rate", value: `${summary.occupancy_rate}%` },
    { title: "Active Projects", value: summary.active_projects },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden stagger-1 animate-page-entrance">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <FaCircle className="text-[8px] animate-pulse" />
                System Operational
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <FaShieldAlt className="text-slate-500" /> Enterprise v2.4
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text-primary">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
              Real-time overview of your organization's workforce, seat utilization, and active projects.
            </p>
          </div>

          {/* Action / Refresh controls */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">Last updated</p>
                <p className="text-xs font-semibold text-slate-200">{lastUpdated}</p>
              </div>
            )}

            <button
              onClick={() => fetchSummary(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 text-slate-200 text-xs font-semibold hover:bg-slate-800 hover:text-white btn-micro btn-shine disabled:opacity-50 shadow-lg"
              title="Refresh Dashboard Data"
            >
              <FaSyncAlt className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="stagger-2 animate-page-entrance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {occupancyCards.map((card, idx) => (
            <StatCard key={card.title} title={card.title} value={card.value} index={idx} />
          ))}
        </div>
      </section>

      {/* Quick Insights Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-3 animate-page-entrance">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FaBolt size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupancy Status</p>
            <p className="text-sm font-bold text-slate-200">
              {summary.occupancy_rate > 85 ? "High Demand" : "Optimal Utilization"}
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FaCheckCircle size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Capacity</p>
            <p className="text-sm font-bold text-slate-200">
              {summary.available_seats} Seats Open
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FaExclamationCircle size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Assignment</p>
            <p className="text-sm font-bold text-slate-200">
              {summary.unassigned_employees} Unassigned
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FaCircle size={14} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Operations</p>
            <p className="text-sm font-bold text-slate-200">
              {summary.active_projects} Projects Live
            </p>
          </div>
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-4 animate-page-entrance">
        <SeatChart />
        <DepartmentChart />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-page-entrance">
        <FloorUtilizationChart />
        <ProjectUtilizationChart />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-page-entrance">
        <ProjectChart />
        <RecentActivity />
      </section>
    </div>
  );
}

export default Dashboard;
