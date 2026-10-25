export default function FormInput({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative mt-1">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
        <input
          {...props}
          className="w-full rounded-lg border border-slate-300 py-2.5 pr-3 pl-10 text-sm
                     focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </label>
  )
}