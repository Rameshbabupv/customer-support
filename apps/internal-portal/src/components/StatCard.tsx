interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color?: string
}

export default function StatCard({ icon, label, value, color = 'bg-blue-50 text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`size-12 rounded-lg ${color} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
      </div>
    </div>
  )
}
