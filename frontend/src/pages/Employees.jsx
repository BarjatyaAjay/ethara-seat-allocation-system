import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import api from "../services/api";
import EmployeeModal from "../components/employees/EmployeeModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";

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
      console.error(err);
      toast.error("Failed to load employees");
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

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus size={14} />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Search by email"
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Search by department"
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Search by team"
            value={filters.team}
            onChange={(e) => handleFilterChange("team", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Search by role"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Search by seat"
            value={filters.seat}
            onChange={(e) => handleFilterChange("seat", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600 text-sm">
          {total} employee{total !== 1 ? "s" : ""} found
        </span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
          Total: {total}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              hasFilters
                ? "Try adjusting your search filters"
                : "Get started by adding a new employee"
            }
            action={
              !hasFilters && (
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Add Employee
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Code</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Email</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Department</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Team</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600 hidden xl:table-cell">Role</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Seat</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-sm">{emp.employee_code}</td>
                    <td className="p-4 text-sm font-medium">{emp.name}</td>
                    <td className="p-4 text-sm hidden md:table-cell">{emp.email}</td>
                    <td className="p-4 text-sm hidden lg:table-cell">{emp.department || "-"}</td>
                    <td className="p-4 text-sm hidden lg:table-cell">{emp.team || "-"}</td>
                    <td className="p-4 text-sm hidden xl:table-cell">{emp.role || "-"}</td>
                    <td className="p-4 text-sm">
                      {emp.seat_code ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {emp.seat_code}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
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

      <Pagination
        page={page}
        pages={pages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

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
