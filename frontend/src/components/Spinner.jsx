const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
    <span className="text-sm text-slate-500">{label}</span>
  </div>
);

export default Spinner;
