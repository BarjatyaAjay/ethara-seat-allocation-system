const Card = ({ title, value, children, className = "" }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl border border-slate-800/80 transition-all hover:border-slate-700/80 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          {title}
        </h3>
      )}

      {value !== undefined && (
        <p className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
          {value}
        </p>
      )}

      {children}
    </div>
  );
};

export default Card;