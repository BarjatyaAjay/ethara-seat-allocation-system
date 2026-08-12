import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTrash, FaSearch, FaTimes, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import api from "../services/api";
import EmployeeModal from "../components/employees/EmployeeModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 20;

const initialFilters = {
  name: "",
  email: "",
  department: "",
  team: "",
  role: "",
  seat: "",
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  const buildSearchQuery = useCallback(() => {
    const terms = [
      debouncedFilters.name,
      debouncedFilters.email,
      debouncedFilters.department,
      debouncedFilters.team,
      debouncedFilters.role,
      debouncedFilters.seat,
    ].filter(Boolean);
    return terms.join(" ").trim() || undefined;
  }, [debouncedFilters]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get("/employees", {
        params: {
          page,
          page_size: PAGE_SIZE,
          search: buildSearchQuery(),
          department: debouncedFilters.department || undefined,
        },
      });
      setEmployees(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 0);
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, buildSearchQuery, debouncedFilters.department]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    setEditEmployee(null);
    setModalOpen(true);
  };

  const handleEdit = (emp) => {
    setEditEmployee(emp);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/employees/${deleteTarget.id}`);
      toast.success("Employee deleted successfully");
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const getInitials = (name) => {
    if (!name) return "EM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 stagger-1 animate-page-entrance">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-primary">
              Workforce Directory
            </h1>
            {!error && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {total} Total
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Manage employee assignments, roles, and seat allocations across teams.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-lg btn-micro btn-shine transition duration-200"
        >
          <FaPlus size={12} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4 stagger-2 animate-page-entrance">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <FaSearch size={12} className="text-cyan-400" /> Filter Employees
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            placeholder="Search by email..."
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            placeholder="Search by department..."
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            placeholder="Search by team..."
            value={filters.team}
            onChange={(e) => handleFilterChange("team", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            placeholder="Search by role..."
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            placeholder="Search by seat code..."
            value={filters.seat}
            onChange={(e) => handleFilterChange("seat", e.target.value)}
            className="glass-input rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {hasFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              <FaTimes size={10} /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl stagger-3 animate-page-entrance">
        {loading ? (
          <Skeleton type="table" />
        ) : error ? (
          <div className="p-8 text-center space-y-4 my-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
              <FaExclamationTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Unable to load employees</h3>
              <p className="text-xs text-slate-400">Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchEmployees}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg btn-micro btn-shine"
            >
              <FaSyncAlt size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              hasFilters
                ? "Try adjusting your search criteria."
                : "Get started by adding a new employee to your directory."
            }
            action={
              !hasFilters && (
                <button
                  onClick={handleAdd}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs btn-micro btn-shine"
                >
                  Add Employee
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4 pl-6 min-w-[100px]">Code</th>
                  <th className="p-4 min-w-[180px]">Employee</th>
                  <th className="p-4 hidden md:table-cell min-w-[200px]">Email</th>
                  <th className="p-4 hidden lg:table-cell min-w-[130px]">Department</th>
                  <th className="p-4 hidden lg:table-cell min-w-[130px]">Team</th>
                  <th className="p-4 hidden xl:table-cell min-w-[140px]">Role</th>
                  <th className="p-4 min-w-[150px]">Seat</th>
                  <th className="p-4 pr-6 text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {employees.map((emp, i) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-800/50 transition-colors duration-150 animate-row-entrance"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <td className="p-4 pl-6 font-mono text-slate-400 font-medium whitespace-nowrap">
                      {emp.employee_code}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-cyan-400 shadow-sm shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <span className="font-semibold text-slate-100">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-slate-400 whitespace-nowrap">{emp.email}</td>
                    <td className="p-4 hidden lg:table-cell whitespace-nowrap">{emp.department || "-"}</td>
                    <td className="p-4 hidden lg:table-cell whitespace-nowrap">{emp.team || "-"}</td>
                    <td className="p-4 hidden xl:table-cell text-slate-400 whitespace-nowrap">{emp.role || "-"}</td>
                    <td className="p-4 whitespace-nowrap">
                      {emp.seat_code ? (
                        <span className="seat-code-pill">
                          <span>{emp.seat_code}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition btn-micro"
                          title="Edit Employee"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition btn-micro"
                          title="Delete Employee"
                        >
                          <FaTrash size={14} />
                        </button>
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

      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEmployee(null);
        }}
        onSuccess={fetchEmployees}
        employee={editEmployee}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  );
}

export default Employees;
