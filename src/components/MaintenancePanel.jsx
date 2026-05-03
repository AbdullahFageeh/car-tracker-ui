import { X, Wrench, Calendar, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { vehicles, maintenanceStatus } from '../data/vehicles'

export default function MaintenancePanel({ onClose, onSelectVehicle }) {
  // Sort: overdue first, then soon, then ok
  const sorted = [...vehicles].sort((a, b) => {
    const order = { overdue: 0, soon: 1, ok: 2 }
    return order[maintenanceStatus(a).status] - order[maintenanceStatus(b).status]
  })

  const overdueCount = vehicles.filter((v) => maintenanceStatus(v).status === 'overdue').length
  const soonCount = vehicles.filter((v) => maintenanceStatus(v).status === 'soon').length

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[460px] h-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench size={18} /> Maintenance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {overdueCount} overdue • {soonCount} due soon
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sorted.map((v) => {
            const m = maintenanceStatus(v)
            const colors = statusColors(m.status)
            return (
              <div
                key={v.id}
                onClick={() => {
                  onSelectVehicle(v)
                  onClose()
                }}
                className={`border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{v.plate}</div>
                    <div className="text-xs text-slate-500">{v.name}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  {/* Oil change */}
                  <div className={`rounded-lg p-2.5 ${colors.tile}`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 mb-1">
                      <Activity size={12} /> Oil change
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {m.kmLeft <= 0 ? (
                        <span className="text-red-600">
                          {Math.abs(m.kmLeft).toLocaleString()} km overdue
                        </span>
                      ) : (
                        <span>in {m.kmLeft.toLocaleString()} km</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Next at {v.nextOilChangeKm.toLocaleString()} km
                    </div>
                  </div>

                  {/* Service date */}
                  <div className={`rounded-lg p-2.5 ${colors.tile}`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 mb-1">
                      <Calendar size={12} /> Service
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {m.daysLeft <= 0 ? (
                        <span className="text-red-600">
                          {Math.abs(m.daysLeft)} days overdue
                        </span>
                      ) : (
                        <span>in {m.daysLeft} days</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Due {v.nextServiceDate}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'overdue') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase bg-red-100 text-red-700 px-2 py-1 rounded-full">
        <AlertTriangle size={11} /> Overdue
      </span>
    )
  }
  if (status === 'soon') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
        <AlertTriangle size={11} /> Soon
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-bold uppercase bg-green-100 text-green-700 px-2 py-1 rounded-full">
      <CheckCircle2 size={11} /> OK
    </span>
  )
}

function statusColors(status) {
  if (status === 'overdue')
    return { border: 'border-red-200 bg-red-50/50', tile: 'bg-white' }
  if (status === 'soon')
    return { border: 'border-amber-200 bg-amber-50/50', tile: 'bg-white' }
  return { border: 'border-slate-200', tile: 'bg-slate-50' }
}
