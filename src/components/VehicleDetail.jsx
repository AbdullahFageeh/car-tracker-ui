import { useState } from 'react'
import {
  X,
  Gauge,
  User,
  Power,
  MapPin,
  Activity,
  AlertTriangle,
  History,
  Phone,
  Calendar,
  DollarSign,
  Settings,
  Share2,
} from 'lucide-react'
import {
  getRentalsForVehicle,
  getActiveRental,
  rentalDays,
  rentalStats,
} from '../data/rentals'
import { findCustomer } from '../data/customers'
import VehicleSettings from './VehicleSettings'
import ShareTripModal from './ShareTripModal'

export default function VehicleDetail({ vehicle, onClose, onSaveVehicle }) {
  const [tab, setTab] = useState('live')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare] = useState(false)

  if (!vehicle) return null

  const handleDeactivate = () => {
    alert(`✅ Deactivation request sent for ${vehicle.plate}`)
    setShowConfirm(false)
  }

  const activeRental = getActiveRental(vehicle.id)
  const activeCustomer = activeRental ? findCustomer(activeRental.customerId) : null

  return (
    <div className="w-96 h-full bg-white border-l border-slate-200 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-3xl">{vehicle.icon || '🚗'}</div>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Vehicle</div>
            <h2 className="text-lg font-bold text-slate-900 truncate">{vehicle.plate}</h2>
            <div className="text-sm text-slate-600 truncate">{vehicle.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowShare(true)}
            title="Share live location"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            title="Vehicle settings"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Currently rented banner */}
      {activeCustomer && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="text-xs uppercase text-amber-700 font-medium mb-1">
            Currently rented
          </div>
          <div className="text-sm font-semibold text-amber-900">
            {activeCustomer.name}
          </div>
          <div className="text-xs text-amber-800 mt-1">
            Until {activeRental.endDate} ({rentalDays(activeRental.startDate, activeRental.endDate)} days)
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-4">
        <DetailTab
          active={tab === 'live'}
          onClick={() => setTab('live')}
          label="Live"
        />
        <DetailTab
          active={tab === 'rentals'}
          onClick={() => setTab('rentals')}
          label="Rentals"
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'live' ? (
          <LiveTab vehicle={vehicle} />
        ) : (
          <RentalsTab vehicleId={vehicle.id} />
        )}
      </div>

      {/* Modals */}
      {showSettings && (
        <VehicleSettings
          vehicle={vehicle}
          onClose={() => setShowSettings(false)}
          onSave={(updated) => onSaveVehicle && onSaveVehicle(updated)}
        />
      )}
      {showShare && (
        <ShareTripModal
          vehicle={vehicle}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Deactivate button */}
      <div className="p-4 border-t border-slate-200">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <Power size={18} /> Deactivate Vehicle
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="text-sm text-red-800 font-medium mb-2">
              Are you sure? This will safely shut down {vehicle.plate}.
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeactivate}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-sm"
              >
                Yes, deactivate
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailTab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'text-slate-900 border-b-2 border-blue-500'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function LiveTab({ vehicle }) {
  return (
    <div className="p-4">
      {/* Status */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
          vehicle.engineOn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            vehicle.engineOn ? 'bg-green-500' : 'bg-slate-400'
          }`}
        />
        {vehicle.engineOn ? 'Engine ON • Active' : 'Engine OFF • Parked'}
      </div>

      {/* Big speed */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center mb-4">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
          Current Speed
        </div>
        <div className="text-6xl font-bold">
          {vehicle.speed}
          <span className="text-2xl text-slate-400 ml-2">km/h</span>
        </div>
        {vehicle.speed > 100 && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
            <AlertTriangle size={12} /> Speeding alert
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<User size={16} />} label="Driver" value={vehicle.driver} />
        <StatCard
          icon={<Activity size={16} />}
          label="Mileage"
          value={`${vehicle.mileage.toLocaleString()} km`}
        />
        <StatCard
          icon={<MapPin size={16} />}
          label="Location"
          value={`${vehicle.lat.toFixed(3)}, ${vehicle.lng.toFixed(3)}`}
        />
        <StatCard icon={<Gauge size={16} />} label="Avg speed" value="—" />
      </div>
    </div>
  )
}

function RentalsTab({ vehicleId }) {
  const list = getRentalsForVehicle(vehicleId)
  const stats = rentalStats(vehicleId)

  return (
    <div className="p-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <SummaryCard label="Rentals" value={stats.totalRentals} />
        <SummaryCard label="Total days" value={stats.totalDays} />
        <SummaryCard
          label="Revenue"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          small
        />
      </div>

      {/* Rental list */}
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-6">
            No rentals yet
          </div>
        )}
        {list.map((r) => {
          const customer = findCustomer(r.customerId)
          const days = rentalDays(r.startDate, r.endDate)
          const revenue = days * r.pricePerDay
          return (
            <div
              key={r.id}
              className="border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm text-slate-900">
                  {customer?.name ?? 'Unknown'}
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} /> {customer?.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} /> {r.startDate} → {r.endDate} ({days} days)
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={12} /> {r.totalKm.toLocaleString()} km driven
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} /> {revenue.toLocaleString()} ر.س
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {icon} {label}
      </div>
      <div className="text-sm font-semibold text-slate-900 truncate">{value}</div>
    </div>
  )
}

function SummaryCard({ label, value, small }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
      <div className={`font-bold text-slate-900 ${small ? 'text-xs' : 'text-lg'}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase text-slate-500 tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}
