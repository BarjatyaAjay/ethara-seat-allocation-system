import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChair, FaUserMinus, FaUserPlus } from "react-icons/fa";
import api from "../services/api";
import AllocateModal from "../components/seats/AllocateModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";

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
      console.error(err);
      toast.error("Failed to load seats");
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

  const statusColor = (s) => {
    const colors = {
      available: "bg-blue-100 text-blue-700",
      allocated: "bg-green-100 text-green-700",
      maintenance: "bg-yellow-100 text-yellow-700",
      reserved: "bg-purple-100 text-purple-700",
    };
    return colors[s] || "bg-gray-100 text-gray-700";
  };

  const hasFilters = search || building || floor || status;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaChair /> Seat Management
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="Search seat, zone, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f}>Floor {f}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setBuilding(""); setFloor(""); setStatus(""); }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600 text-sm">{total} seat{total !== 1 ? "s" : ""} found</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading seats..." />
        ) : seats.length === 0 ? (
          <EmptyState
            title="No seats found"
            description={hasFilters ? "Try adjusting your filters" : "No seats available"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Seat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Building</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Floor</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Zone</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Type</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Employee</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seats.map((seat) => (
                  <tr key={seat.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-sm font-semibold">{seat.seat_code}</td>
                    <td className="p-4 text-sm">{seat.building}</td>
                    <td className="p-4 text-sm">{seat.floor}</td>
                    <td className="p-4 text-sm hidden md:table-cell">{seat.zone || "-"}</td>
                    <td className="p-4 text-sm hidden lg:table-cell">{seat.seat_type}</td>
                    <td className="p-4 text-sm">{seat.employee_name || "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusColor(seat.status)}`}>
                        {seat.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {seat.status === "available" && !seat.employee_id && (
                          <button
                            onClick={() => setAllocateSeat(seat)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Allocate"
                          >
                            <FaUserPlus size={14} />
                          </button>
                        )}
                        {seat.employee_id && (
                          <button
                            onClick={() => setReleaseTarget(seat)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Release"
                          >
                            <FaUserMinus size={14} />
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

      <Pagination
        page={page}
        pages={pages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <AllocateModal
        open={Boolean(allocateSeat)}
        onClose={() => setAllocateSeat(null)}
        onSuccess={fetchSeats}
        seat={allocateSeat}
      />

      <ConfirmModal
        open={Boolean(releaseTarget)}
        title="Release Seat"
        message={`Release seat ${releaseTarget?.seat_code} from ${releaseTarget?.employee_name}?`}
        confirmLabel="Release"
        onConfirm={handleRelease}
        onCancel={() => setReleaseTarget(null)}
        loading={releasing}
        danger
      />
    </div>
  );
};

export default Seats;
