const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative flex items-center justify-center w-12 h-12">
        <div className="w-10 h-10 border-3 border-slate-800 border-t-sky-400 border-r-purple-500 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
