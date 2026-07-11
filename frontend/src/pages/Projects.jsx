import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import api from "../services/api";
import ProjectModal from "../components/projects/ProjectModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";

const PAGE_SIZE = 20;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects", {
        params: {
          page,
          page_size: PAGE_SIZE,
          search: debouncedSearch || undefined,
        },
      });
      setProjects(res.data.items || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success("Project deleted successfully");
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => { setEditProject(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
          >
            <FaPlus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600 text-sm">
          {total} project{total !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={search ? "Try adjusting your search" : "Get started by adding a new project"}
            action={
              !search && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Add Project
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
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Project</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Seats</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Priority</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium">{project.project_code}</td>
                    <td className="p-4">
                      <div className="font-semibold text-sm">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{project.description}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm">{project.required_seats}</td>
                    <td className="p-4 text-sm">{project.priority}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditProject(project); setModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      <ProjectModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProject(null); }}
        onSuccess={fetchProjects}
        project={editProject}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default Projects;
