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
        <p className="text-gray-600 text-sm">
          Assign this seat to an employee by entering their ID.
        </p>
        <input
          type="number"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="border px-5 py-2 rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Allocating..." : "Allocate"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AllocateModal;
