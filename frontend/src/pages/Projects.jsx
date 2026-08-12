import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaTrash, FaSearch, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import api from "../services/api";
import ProjectModal from "../components/projects/ProjectModal";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 20;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
      setError(false);
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
      console.error("Fetch projects error:", err);
      setError(true);
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

  const statusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "completed":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800/80 stagger-1 animate-page-entrance">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-text-primary">
              Project Directory
            </h1>
            {!error && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {total} Projects
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Track active initiatives, priority ratings, and required seat allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input rounded-xl pl-9 pr-3.5 py-2 text-xs w-full sm:w-60 focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <button
            onClick={() => {
              setEditProject(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-lg btn-micro btn-shine transition duration-200 whitespace-nowrap"
          >
            <FaPlus size={12} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl stagger-2 animate-page-entrance">
        {loading ? (
          <Skeleton type="table" />
        ) : error ? (
          <div className="p-8 text-center space-y-4 my-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
              <FaExclamationTriangle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Unable to load projects</h3>
              <p className="text-xs text-slate-400">Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchProjects}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg btn-micro btn-shine"
            >
              <FaSyncAlt size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={search ? "Try adjusting your search query." : "Create your first project to begin tracking required seats."}
            action={
              !search && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs btn-micro btn-shine"
                >
                  Add Project
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4 pl-6 min-w-[120px]">Code</th>
                  <th className="p-4 min-w-[200px]">Project Name</th>
                  <th className="p-4 min-w-[140px]">Required Seats</th>
                  <th className="p-4 min-w-[100px]">Priority</th>
                  <th className="p-4 min-w-[120px]">Status</th>
                  <th className="p-4 pr-6 text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {projects.map((project, i) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-800/50 transition-colors duration-150 animate-row-entrance"
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <td className="p-4 pl-6 font-mono text-slate-400 font-medium whitespace-nowrap">
                      {project.project_code}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-100">{project.name}</div>
                      {project.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-cyan-400 whitespace-nowrap">
                      {project.required_seats} seats
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                        P{project.priority}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditProject(project);
                            setModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition btn-micro"
                          title="Edit Project"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition btn-micro"
                          title="Delete Project"
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

      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProject(null);
        }}
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
