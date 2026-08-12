import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="glass-panel border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 transform animate-in zoom-in-95 slide-in-from-bottom-2 duration-250">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${danger ? "bg-rose-500/10 text-rose-400" : "bg-sky-500/10 text-sky-400"}`}>
            <FaExclamationTriangle size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        </div>
        
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm border border-slate-700/80 text-slate-300 hover:bg-slate-800 btn-micro transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg btn-micro btn-shine transition ${
              danger
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                : "bg-sky-600 hover:bg-sky-500 shadow-sky-600/20"
            } disabled:opacity-50`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
