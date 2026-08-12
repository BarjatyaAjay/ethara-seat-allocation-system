import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ page, pages, total, pageSize, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/80">
      <span className="text-xs font-medium text-slate-400">
        Showing <span className="text-slate-200 font-semibold">{from}</span>–
        <span className="text-slate-200 font-semibold">{to}</span> of{" "}
        <span className="text-slate-200 font-semibold">{total}</span> items
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 text-xs hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Previous Page"
        >
          <FaChevronLeft size={10} />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`min-w-[34px] h-[34px] rounded-xl text-xs font-semibold border transition ${
              num === page
                ? "bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 text-xs hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Next Page"
        >
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
