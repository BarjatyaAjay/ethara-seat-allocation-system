import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Modal from "../ui/Modal";

const initialState = {
  employee_code: "",
  name: "",
  email: "",
  department: "",
  team: "",
  role: "",
  project_id: "",
  status: "active",
};

const EmployeeModal = ({ open, onClose, onSuccess, employee = null }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(employee);

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_code: employee.employee_code || "",
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department || "",
        team: employee.team || "",
        role: employee.role || "",
        project_id: employee.project_id?.toString() || "",
        status: employee.status || "active",
      });
    } else {
      setFormData(initialState);
    }
    setErrors({});
  }, [employee, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.employee_code.trim()) {
      newErrors.employee_code = "Employee code is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      project_id: formData.project_id ? Number(formData.project_id) : null,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/employees/${employee.id}`, payload);
        toast.success("Employee updated successfully");
      } else {
        await api.post("/employees", payload);
        toast.success("Employee added successfully");
      }
      setFormData(initialState);
      onSuccess();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : `Failed to ${isEdit ? "update" : "add"} employee`
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `glass-input rounded-xl p-3 text-xs w-full ${
      errors[field] ? "border-rose-500/80 focus:ring-rose-500/50" : ""
    }`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Employee Profile" : "Add New Employee"}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Employee Code *
          </label>
          <input
            name="employee_code"
            placeholder="EMP-1001"
            value={formData.employee_code}
            onChange={handleChange}
            className={inputClass("employee_code")}
          />
          {errors.employee_code && (
            <p className="text-rose-400 text-xs mt-1">{errors.employee_code}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Full Name *
          </label>
          <input
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className={inputClass("name")}
          />
          {errors.name && (
            <p className="text-rose-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Email Address *
          </label>
          <input
            name="email"
            type="email"
            placeholder="john.doe@company.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Department
          </label>
          <input
            name="department"
            placeholder="Engineering"
            value={formData.department}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Team
          </label>
          <input
            name="team"
            placeholder="Backend Systems"
            value={formData.team}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Role
          </label>
          <input
            name="role"
            placeholder="Senior Developer"
            value={formData.role}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Project ID
          </label>
          <input
            name="project_id"
            type="number"
            placeholder="1"
            value={formData.project_id}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full bg-slate-900"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
