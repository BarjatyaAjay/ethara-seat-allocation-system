import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Modal from "../ui/Modal";

const AllocateModal = ({ open, onClose, onSuccess, seat }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setEmployeeId("");
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Please enter an employee ID");
      return;
    }

    try {
      setLoading(true);
      await api.post("/seats/allocate", {
        employee_id: Number(employeeId),
        seat_id: seat.id,
      });
      toast.success(`Seat ${seat.seat_code} allocated successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      toast.error(typeof detail === "string" ? detail : "Failed to allocate seat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Allocate Seat ${seat?.seat_code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-300 leading-relaxed">
          Assign seat <span className="font-bold text-emerald-400">{seat?.seat_code}</span> ({seat?.building}, Floor {seat?.floor}) to an employee by entering their numerical Employee ID.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Employee ID *
          </label>
          <input
            type="number"
            placeholder="e.g. 105"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="glass-input rounded-xl p-3 text-xs w-full focus:ring-2 focus:ring-emerald-500/50"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs border border-slate-700 text-slate-300 hover:bg-slate-800 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Allocating..." : "Allocate Seat"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AllocateModal;
