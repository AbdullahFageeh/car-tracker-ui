import { useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import { X, Save, Shield } from 'lucide-react'

const COLOR_CHOICES = [
  { id: '#22c55e', label: '🟢 Green' },
  { id: '#3b82f6', label: '🔵 Blue' },
  { id: '#f59e0b', label: '🟡 Amber' },
  { id: '#ef4444', label: '🔴 Red' },
  { id: '#a855f7', label: '🟣 Purple' },
]

// Helper: distance in meters between two lat/lng points
function distMeters(a, b) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// Listens for map clicks/moves while in drawing mode
export function ZoneDrawHandler({ drawMode, draftZone, setDraftZone, setDrawMode, onComplete }) {
  useMapEvents({
    click(e) {
      if (drawMode === 'pickCenter') {
        setDraftZone({ lat: e.latlng.lat, lng: e.latlng.lng, radius: 500 })
        setDrawMode('pickRadius')
      } else if (drawMode === 'pickRadius' && draftZone) {
        const radius = Math.round(
          distMeters({ lat: draftZone.lat, lng: draftZone.lng }, e.latlng)
        )
        setDraftZone({ ...draftZone, radius: Math.max(100, radius) })
        setDrawMode(null)
        onComplete()
      }
    },
    mousemove(e) {
      if (drawMode === 'pickRadius' && draftZone) {
        const radius = Math.round(
          distMeters({ lat: draftZone.lat, lng: draftZone.lng }, e.latlng)
        )
        setDraftZone({ ...draftZone, radius: Math.max(100, radius) })
      }
    },
  })
  return null
}

// Dialog to name + save the new zone
export function ZoneSaveDialog({ draftZone, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#22c55e')

  if (!draftZone) return null

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please give the zone a name')
      return
    }
    onSave({
      id: `Z${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom zone',
      lat: draftZone.lat,
      lng: draftZone.lng,
      radius: draftZone.radius,
      color,
    })
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Zone</h2>
              <div className="text-xs text-slate-500">
                Radius: {(draftZone.radius / 1000).toFixed(2)} km
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Zone name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Riyadh Airport"
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this zone for?"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`h-10 rounded-xl border-2 transition-all ${
                    color === c.id ? 'border-slate-900 scale-110' : 'border-slate-200'
                  }`}
                  style={{ background: c.id }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save zone
          </button>
        </div>
      </div>
    </div>
  )
}
