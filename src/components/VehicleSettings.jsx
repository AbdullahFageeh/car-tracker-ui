import { useState } from 'react'
import { X, Save, Car } from 'lucide-react'

const ICON_CHOICES = ['🚗', '🚙', '🚕', '🚐', '🛻', '🚓', '🚛', '🏎️']

export default function VehicleSettings({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({
    name: vehicle.name,
    plate: vehicle.plate,
    driver: vehicle.driver,
    mileage: vehicle.mileage,
    icon: vehicle.icon || '🚗',
    photo: vehicle.photo || '',
    color: vehicle.color || '',
    year: vehicle.year || '',
    fuelType: vehicle.fuelType || 'petrol',
    zoneScope: vehicle.zoneScope || 'city',
    speedLimit: vehicle.speedLimit || 120,
  })

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = () => {
    onSave({ ...vehicle, ...form, mileage: Number(form.mileage), speedLimit: Number(form.speedLimit) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
              <Car size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vehicle Settings</h2>
              <div className="text-xs text-slate-500">{vehicle.plate}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Icon picker */}
          <div>
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {ICON_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => update('icon', emoji)}
                  className={`w-11 h-11 rounded-xl border-2 text-2xl flex items-center justify-center transition-all ${
                    form.icon === emoji
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <Field label="Vehicle name" value={form.name} onChange={(v) => update('name', v)} />

          {/* Plate + Driver */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plate" value={form.plate} onChange={(v) => update('plate', v)} />
            <Field label="Driver" value={form.driver} onChange={(v) => update('driver', v)} />
          </div>

          {/* Year + Color */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Year"
              type="number"
              value={form.year}
              onChange={(v) => update('year', v)}
              placeholder="2024"
            />
            <Field
              label="Color"
              value={form.color}
              onChange={(v) => update('color', v)}
              placeholder="White"
            />
          </div>

          {/* Mileage */}
          <Field
            label="Odometer (km)"
            type="number"
            value={form.mileage}
            onChange={(v) => update('mileage', v)}
          />

          {/* Speed limit */}
          <div>
            <Label>Speed limit (km/h)</Label>
            <input
              type="range"
              min="60"
              max="180"
              step="10"
              value={form.speedLimit}
              onChange={(e) => update('speedLimit', e.target.value)}
              className="w-full mt-2"
            />
            <div className="text-sm text-slate-700 font-medium">
              Alert if above <span className="text-blue-600">{form.speedLimit} km/h</span>
            </div>
          </div>

          {/* Fuel type */}
          <div>
            <Label>Fuel type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {['petrol', 'diesel', 'electric'].map((f) => (
                <button
                  key={f}
                  onClick={() => update('fuelType', f)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-colors ${
                    form.fuelType === f
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Zone scope */}
          <div>
            <Label>Allowed area</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                onClick={() => update('zoneScope', 'city')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                  form.zoneScope === 'city'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                🏙️ City only
              </button>
              <button
                onClick={() => update('zoneScope', 'country')}
                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                  form.zoneScope === 'country'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                🇸🇦 Country-wide
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">{children}</div>
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
