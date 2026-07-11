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
    `border rounded-lg p-3 w-full ${errors[field] ? "border-red-500" : "border-gray-300"}`;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Project" : "Add Project"}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            name="project_code"
            placeholder="Project Code *"
            value={formData.project_code}
            onChange={handleChange}
            className={inputClass("project_code")}
          />
          {errors.project_code && <p className="text-red-500 text-sm mt-1">{errors.project_code}</p>}
        </div>

        <div>
          <input
            name="name"
            placeholder="Project Name *"
            value={formData.name}
            onChange={handleChange}
            className={inputClass("name")}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border rounded-lg p-3 sm:col-span-2"
          rows={3}
        />

        <div>
          <input
            name="required_seats"
            type="number"
            min="0"
            placeholder="Required Seats"
            value={formData.required_seats}
            onChange={handleChange}
            className={inputClass("required_seats")}
          />
          {errors.required_seats && <p className="text-red-500 text-sm mt-1">{errors.required_seats}</p>}
        </div>

        <div>
          <input
            name="priority"
            type="number"
            min="1"
            max="10"
            placeholder="Priority (1-10)"
            value={formData.priority}
            onChange={handleChange}
            className={inputClass("priority")}
          />
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
        </div>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border rounded-lg p-3"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="border px-5 py-2 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Project" : "Save Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
