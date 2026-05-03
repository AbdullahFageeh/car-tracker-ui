import { Car, Gauge, User, Shield, MapPin, AlertTriangle } from 'lucide-react'
import { vehicleStatus } from '../data/zones'

export default function Sidebar({
  vehicles,
  zones,
  onSelect,
  selectedId,
  tab,
  onTabChange,
}) {
  const onlineCount = vehicles.filter((v) => v.engineOn).length
  const outsideCount = vehicles.filter(
    (v) => vehicleStatus(v, zones) === 'outside'
  ).length

  return (
    <div className="w-80 h-full bg-slate-900 text-white flex flex-col border-r border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Car size={22} /> Fleet Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {onlineCount} of {vehicles.length} active
          {outsideCount > 0 && (
            <span className="ml-2 text-red-400">• {outsideCount} outside zone</span>
          )}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-slate-700">
        <TabButton
          active={tab === 'vehicles'}
          onClick={() => onTabChange('vehicles')}
          icon={<Car size={14} />}
          label="Vehicles"
          count={vehicles.length}
        />
        <TabButton
          active={tab === 'zones'}
          onClick={() => onTabChange('zones')}
          icon={<Shield size={14} />}
          label="Zones"
          count={zones.length}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'vehicles' ? (
          <VehicleList
            vehicles={vehicles}
            zones={zones}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ) : (
          <ZoneList zones={zones} vehicles={vehicles} />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-white border-b-2 border-blue-500 bg-slate-800'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon} {label}
      <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{count}</span>
    </button>
  )
}

function VehicleList({ vehicles, zones, onSelect, selectedId }) {
  return (
    <>
      {vehicles.map((v) => {
        const isSelected = v.id === selectedId
        const status = vehicleStatus(v, zones)
        const outside = status === 'outside'
        return (
          <div
            key={v.id}
            onClick={() => onSelect(v)}
            className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${
              isSelected ? 'bg-slate-700' : 'hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  v.engineOn ? 'bg-green-500' : 'bg-slate-500'
                }`}
              />
              <div className="font-semibold text-sm">{v.plate}</div>
              {outside && (
                <span
                  title="Outside allowed zone"
                  className="ml-auto flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded"
                >
                  <AlertTriangle size={10} /> Outside
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 mb-2">{v.name}</div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <User size={12} /> {v.driver}
              </span>
              <span className="flex items-center gap-1">
                <Gauge size={12} /> {v.speed} km/h
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}

function ZoneList({ zones, vehicles }) {
  return (
    <>
      {zones.map((zone) => {
        const inside = vehicles.filter((v) => {
          // count vehicles inside this specific zone
          const R = 6371000
          const toRad = (deg) => (deg * Math.PI) / 180
          const dLat = toRad(v.lat - zone.lat)
          const dLng = toRad(v.lng - zone.lng)
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(zone.lat)) *
              Math.cos(toRad(v.lat)) *
              Math.sin(dLng / 2) ** 2
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          return R * c <= zone.radius
        }).length
        return (
          <div
            key={zone.id}
            className="p-4 border-b border-slate-800 hover:bg-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full border-2"
                style={{ borderColor: zone.color, background: zone.color + '40' }}
              />
              <div className="font-semibold text-sm">{zone.name}</div>
            </div>
            <div className="text-xs text-slate-400 mb-2">{zone.description}</div>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {(zone.radius / 1000).toFixed(1)} km radius
              </span>
              <span className="flex items-center gap-1">
                <Car size={12} /> {inside} inside
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
