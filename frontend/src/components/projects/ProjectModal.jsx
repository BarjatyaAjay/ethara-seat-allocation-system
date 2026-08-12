import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Modal from "../ui/Modal";

const initialState = {
  project_code: "",
  name: "",
  description: "",
  required_seats: 0,
  priority: 1,
  status: "active",
};

const ProjectModal = ({ open, onClose, onSuccess, project = null }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(project);

  useEffect(() => {
    if (project) {
      setFormData({
        project_code: project.project_code || "",
        name: project.name || "",
        description: project.description || "",
        required_seats: project.required_seats || 0,
        priority: project.priority || 1,
        status: project.status || "active",
      });
    } else {
      setFormData(initialState);
    }
    setErrors({});
  }, [project, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.project_code.trim()) newErrors.project_code = "Project code is required";
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (formData.required_seats < 0) newErrors.required_seats = "Must be 0 or more";
    if (formData.priority < 1 || formData.priority > 10) newErrors.priority = "Priority must be 1-10";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "required_seats" || name === "priority" ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/projects/${project.id}`, formData);
        toast.success("Project updated successfully");
      } else {
        await api.post("/projects", formData);
        toast.success("Project added successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : `Failed to ${isEdit ? "update" : "add"} project`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `glass-input rounded-xl p-3 text-xs w-full ${errors[field] ? "border-rose-500/80 focus:ring-rose-500/50" : ""}`;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Project" : "Add Project"}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Project Code *
          </label>
          <input
            name="project_code"
            placeholder="PRJ-101"
            value={formData.project_code}
            onChange={handleChange}
            className={inputClass("project_code")}
          />
          {errors.project_code && <p className="text-rose-400 text-xs mt-1">{errors.project_code}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Project Name *
          </label>
          <input
            name="name"
            placeholder="Alpha Core Initiative"
            value={formData.name}
            onChange={handleChange}
            className={inputClass("name")}
          />
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Key objectives and seat allocation requirements..."
            value={formData.description}
            onChange={handleChange}
            className="glass-input rounded-xl p-3 text-xs w-full sm:col-span-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Required Seats
          </label>
          <input
            name="required_seats"
            type="number"
            min="0"
            placeholder="10"
            value={formData.required_seats}
            onChange={handleChange}
            className={inputClass("required_seats")}
          />
          {errors.required_seats && <p className="text-rose-400 text-xs mt-1">{errors.required_seats}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Priority (1-10)
          </label>
          <input
            name="priority"
            type="number"
            min="1"
            max="10"
            placeholder="1"
            value={formData.priority}
            onChange={handleChange}
            className={inputClass("priority")}
          />
          {errors.priority && <p className="text-rose-400 text-xs mt-1">{errors.priority}</p>}
        </div>

        <div className="sm:col-span-2">
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
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs border border-slate-700 text-slate-300 hover:bg-slate-800 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Project" : "Save Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
