import { useState } from 'react'
import {
  X,
  AlertTriangle,
  Zap,
  ShieldAlert,
  AlertOctagon,
  PowerOff,
  CheckCircle2,
} from 'lucide-react'
import { alerts as initialAlerts } from '../data/alerts'
import { vehicles } from '../data/vehicles'

const TYPE_META = {
  speeding: { icon: Zap, color: 'amber' },
  reckless: { icon: AlertTriangle, color: 'amber' },
  outside_zone: { icon: ShieldAlert, color: 'amber' },
  accident: { icon: AlertOctagon, color: 'red' },
  engine_off: { icon: PowerOff, color: 'slate' },
  maintenance: { icon: AlertTriangle, color: 'amber' },
}

export default function AlertsPanel({ onClose, onSelectVehicle }) {
  const [list, setList] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')

  const filtered = list.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !a.acknowledged
    if (filter === 'critical') return a.severity === 'critical'
    return true
  })

  const acknowledge = (id) => {
    setList((curr) => curr.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)))
  }

  const acknowledgeAll = () => {
    setList((curr) => curr.map((a) => ({ ...a, acknowledged: true })))
  }

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[420px] h-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Alerts</h2>
            <p className="text-xs text-slate-500">
              {list.filter((a) => !a.acknowledged).length} unread
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({list.length})
          </FilterPill>
          <FilterPill active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread ({list.filter((a) => !a.acknowledged).length})
          </FilterPill>
          <FilterPill
            active={filter === 'critical'}
            onClick={() => setFilter('critical')}
          >
            Critical ({list.filter((a) => a.severity === 'critical').length})
          </FilterPill>
          <div className="flex-1" />
          <button
            onClick={acknowledgeAll}
            className="text-blue-600 hover:underline"
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-12">
              <CheckCircle2 className="mx-auto mb-2 text-green-500" size={32} />
              All clear!
            </div>
          )}
          {filtered.map((a) => {
            const meta = TYPE_META[a.type] || { icon: AlertTriangle, color: 'slate' }
            const Icon = meta.icon
            const vehicle = vehicles.find((v) => v.id === a.vehicleId)
            const colors = colorClasses(meta.color, a.severity === 'critical')

            return (
              <div
                key={a.id}
                className={`p-4 border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !a.acknowledged ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => {
                  if (vehicle) onSelectVehicle(vehicle)
                  acknowledge(a.id)
                  onClose()
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon size={16} className={colors.text} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div className="font-semibold text-sm text-slate-900">
                        {a.title}
                      </div>
                      {!a.acknowledged && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mb-1.5">{a.message}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {vehicle && (
                        <span className="font-medium text-slate-700">
                          {vehicle.plate}
                        </span>
                      )}
                      <span>•</span>
                      <span>{a.timestamp}</span>
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

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full font-medium ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function colorClasses(color, critical) {
  if (critical) return { bg: 'bg-red-100', text: 'text-red-600' }
  if (color === 'amber') return { bg: 'bg-amber-100', text: 'text-amber-600' }
  if (color === 'red') return { bg: 'bg-red-100', text: 'text-red-600' }
  return { bg: 'bg-slate-100', text: 'text-slate-600' }
}
