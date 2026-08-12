const Skeleton = ({ className = "", type = "box" }) => {
  if (type === "card") {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-shimmer space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-slate-800/80 rounded-md" />
          <div className="w-9 h-9 bg-slate-800/80 rounded-xl" />
        </div>
        <div className="h-8 w-20 bg-slate-800/80 rounded-lg" />
        <div className="h-3 w-28 bg-slate-800/60 rounded-md" />
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="glass-panel p-6 rounded-2xl h-96 animate-shimmer flex flex-col justify-between">
        <div className="h-6 w-40 bg-slate-800/80 rounded-md" />
        <div className="flex-1 my-4 flex items-end gap-3 px-4">
          <div className="h-[40%] flex-1 bg-slate-800/60 rounded-t-md" />
          <div className="h-[75%] flex-1 bg-slate-800/60 rounded-t-md" />
          <div className="h-[60%] flex-1 bg-slate-800/60 rounded-t-md" />
          <div className="h-[90%] flex-1 bg-slate-800/60 rounded-t-md" />
          <div className="h-[50%] flex-1 bg-slate-800/60 rounded-t-md" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="glass-panel rounded-2xl p-6 animate-shimmer space-y-4">
        <div className="h-6 w-48 bg-slate-800/80 rounded-md" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-800/40 rounded-xl flex items-center px-4 gap-4">
            <div className="h-4 w-12 bg-slate-800/80 rounded" />
            <div className="h-4 w-32 bg-slate-800/80 rounded" />
            <div className="h-4 w-44 bg-slate-800/60 rounded hidden md:block" />
            <div className="h-4 w-24 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-shimmer bg-slate-800/60 rounded-lg ${className}`} />
  );
};

export default Skeleton;
