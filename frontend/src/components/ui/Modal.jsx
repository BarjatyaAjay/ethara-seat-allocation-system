import { FaTimes } from "react-icons/fa";

const Modal = ({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className={`glass-panel border border-slate-700/60 rounded-2xl shadow-2xl w-full ${sizes[size]} p-6 max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 slide-in-from-bottom-2 duration-250`}
      >
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-800/80">
          <h2 className="text-xl font-bold gradient-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition btn-micro"
          >
            <FaTimes size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
