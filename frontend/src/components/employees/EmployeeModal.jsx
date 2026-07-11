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
    `border rounded-lg p-3 w-full ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Employee" : "Add Employee"}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            name="employee_code"
            placeholder="Employee Code *"
            value={formData.employee_code}
            onChange={handleChange}
            className={inputClass("employee_code")}
          />
          {errors.employee_code && (
            <p className="text-red-500 text-sm mt-1">{errors.employee_code}</p>
          )}
        </div>

        <div>
          <input
            name="name"
            placeholder="Employee Name *"
            value={formData.name}
            onChange={handleChange}
            className={inputClass("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            name="email"
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <input
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="team"
          placeholder="Team"
          value={formData.team}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="project_id"
          type="number"
          placeholder="Project ID"
          value={formData.project_id}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border rounded-lg p-3"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
