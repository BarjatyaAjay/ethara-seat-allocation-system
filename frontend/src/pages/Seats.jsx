import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChair, FaUserMinus, FaUserPlus, FaSearch, FaFilter, FaTimes, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import api from "../services/api";
import AllocateModal from "../components/seats/AllocateModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "available", label: "Available" },
  { value: "allocated", label: "Allocated" },
  { value: "maintenance", label: "Maintenance" },
  { value: "reserved", label: "Reserved" },
];

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [search, setSearch] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  const [allocateSeat, setAllocateSeat] = useState(null);
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, building, floor, status]);

  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const params = {
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        floor: floor ? Number(floor) : undefined,
        status: status || undefined,
      };
      const res = await api.get("/seats", { params });
      let items = res.data.items || [];

      if (building) {
        items = items.filter((s) => s.building === building);
      }

      setSeats(items);
      setTotal(building ? items.length : res.data.total || 0);
      setPages(building ? 1 : res.data.pages || 0);
    } catch (err) {
      console.error("Fetch seats error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, building, floor, status]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get("/seats", { params: { page_size: 100 } });
      const items = res.data.items || [];
      const uniqueBuildings = [...new Set(items.map((s) => s.building))].sort();
      const uniqueFloors = [...new Set(items.map((s) => s.floor))].sort((a, b) => a - b);
      setBuildings(uniqueBuildings);
      setFloors(uniqueFloors);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const handleRelease = async () => {
    if (!releaseTarget) return;
    try {
      setReleasing(true);
      await api.post("/seats/release", { seat_id: releaseTarget.id });
      toast.success(`Seat ${releaseTarget.seat_code} released successfully`);
      setReleaseTarget(null);
      fetchSeats();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      toast.error(typeof detail === "string" ? detail : "Failed to release seat");
    } finally {
      setReleasing(false);
    }
  };

  const statusBadge = (s) => {
    switch (s) {
      case "available":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "allocated":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "maintenance":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "reserved":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const hasFilters = search || building || floor || status;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 stagger-1 animate-page-entrance">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-primary">
              Seat Management
            </h1>
            {!error && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {total} Seats
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Monitor floor maps, availability status, and assign workforce seats.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4 stagger-2 animate-page-entrance">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <FaFilter size={12} className="text-cyan-400" /> Filter Seats
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-slate-500 text-xs" />
            <input
              placeholder="Search seat, zone, building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input rounded-xl pl-9 pr-3.5 py-2 text-xs w-full focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs bg-slate-900 focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs bg-slate-900 focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f}>Floor {f}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs bg-slate-900 focus:ring-2 focus:ring-cyan-500/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearch("");
                setBuilding("");
                setFloor("");
                setStatus("");
              }}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              <FaTimes size={10} /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table Container - Responsive Horizontal Scroll with Non-Breaking Seat Code Pills */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl stagger-3 animate-page-entrance">
        {loading ? (
          <Skeleton type="table" />
        ) : error ? (
          <div className="p-8 text-center space-y-4 my-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
              <FaExclamationTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Unable to load seats</h3>
              <p className="text-xs text-slate-400">Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchSeats}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg btn-micro btn-shine"
            >
              <FaSyncAlt size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : seats.length === 0 ? (
          <EmptyState
            title="No seats found"
            description={hasFilters ? "Try adjusting your filter selections." : "No seats are registered in the system."}
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4 pl-6 min-w-[160px]">Seat Code</th>
                  <th className="p-4 min-w-[130px]">Building</th>
                  <th className="p-4 min-w-[90px]">Floor</th>
                  <th className="p-4 hidden md:table-cell min-w-[100px]">Zone</th>
                  <th className="p-4 hidden lg:table-cell min-w-[100px]">Type</th>
                  <th className="p-4 min-w-[160px]">Occupant</th>
                  <th className="p-4 min-w-[120px]">Status</th>
                  <th className="p-4 pr-6 text-right min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {seats.map((seat, i) => (
                  <tr
                    key={seat.id}
                    className="hover:bg-slate-800/50 transition-colors duration-150 animate-row-entrance"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    {/* Seat Code: Guaranteed single line non-breaking pill */}
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <span className="seat-code-pill">
                        <FaChair className="text-cyan-400 text-[11px] shrink-0" />
                        <span>{seat.seat_code}</span>
                      </span>
                    </td>
                    <td className="p-4 font-medium whitespace-nowrap text-slate-200">{seat.building}</td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">Floor {seat.floor}</td>
                    <td className="p-4 hidden md:table-cell text-slate-400 whitespace-nowrap">{seat.zone || "-"}</td>
                    <td className="p-4 hidden lg:table-cell text-slate-400 capitalize whitespace-nowrap">{seat.seat_type}</td>
                    <td className="p-4 whitespace-nowrap">
                      {seat.employee_name ? (
                        <span className="font-semibold text-slate-100">{seat.employee_name}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unoccupied</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge(seat.status)}`}>
                        {seat.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        {seat.status === "available" && !seat.employee_id && (
                          <button
                            onClick={() => setAllocateSeat(seat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-semibold transition btn-micro"
                            title="Allocate Seat"
                          >
                            <FaUserPlus size={12} />
                            <span>Allocate</span>
                          </button>
                        )}
                        {seat.employee_id && (
                          <button
                            onClick={() => setReleaseTarget(seat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-semibold transition btn-micro"
                            title="Release Seat"
                          >
                            <FaUserMinus size={12} />
                            <span>Release</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!error && (
        <Pagination
          page={page}
          pages={pages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <AllocateModal
        open={Boolean(allocateSeat)}
        onClose={() => setAllocateSeat(null)}
        onSuccess={fetchSeats}
        seat={allocateSeat}
      />

      <ConfirmModal
        open={Boolean(releaseTarget)}
        title="Release Seat"
        message={`Are you sure you want to release seat ${releaseTarget?.seat_code} from ${releaseTarget?.employee_name}?`}
        confirmLabel="Release Seat"
        onConfirm={handleRelease}
        onCancel={() => setReleaseTarget(null)}
        loading={releasing}
        danger
      />
    </div>
  );
};

export default Seats;
