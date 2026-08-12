const Badge = ({ text, color = "green", icon: Icon }) => {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    blue: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    gray: "bg-slate-800/60 text-slate-400 border-slate-700/50",
  };

  const activeStyle = styles[color] || styles.gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${activeStyle}`}
    >
      {Icon && <Icon className="text-[11px]" />}
      {text}
    </span>
  );
};

export default Badge;