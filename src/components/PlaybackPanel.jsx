import { useState } from 'react'
import { X, Play, Pause, History, Trash2, MapPin, Clock, Gauge, Navigation, RotateCcw } from 'lucide-react'
import { vehicles } from '../data/vehicles'
import { getRouteForVehicle, getRouteStats } from '../data/routes'

export default function PlaybackPanel({
  onClose,
  onLoadRoute,
  route,
  onClearRoute,
  playbackIndex = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  playSpeed = 1,
  onChangeSpeed,
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [vehicleId, setVehicleId] = useState(route?.vehicleId || vehicles[0]?.id || '')
  const [date, setDate] = useState(route?.date || today)

  const handleLoad = () => {
    const points = getRouteForVehicle(vehicleId, date)
    const stats = getRouteStats(points)
    const vehicle = vehicles.find((v) => v.id === Number(vehicleId))
    onLoadRoute({ vehicleId, date, points, stats, vehicle })
  }

  const handleClear = () => {
    onClearRoute()
  }

  const stats = route?.stats
  const totalPoints = route?.points?.length || 0
  const currentPoint = route?.points?.[playbackIndex]
  const progressPct =
    totalPoints > 1 ? Math.round((playbackIndex / (totalPoints - 1)) * 100) : 0
  const currentTime = currentPoint
    ? new Date(currentPoint.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--'

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="relative w-[420px] h-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="h-14 px-4 border-b flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2 font-semibold">
            <History size={18} />
            Track Playback
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-slate-600">
            Pick a vehicle and a date to replay its route on the map.
          </p>

          {/* Vehicle picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.icon} {v.name} — {v.plate}
                </option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            />
          </div>

          {/* Buttons */}
          <button
            onClick={handleLoad}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            <Play size={16} />
            Load route
          </button>

          {route && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm"
            >
              <Trash2 size={14} />
              Clear route
            </button>
          )}

          {/* Playback controls */}
          {route && (
            <div className="border-t pt-4 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Playback
              </div>

              {/* Progress bar */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={totalPoints - 1}
                  value={playbackIndex}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{progressPct}%</span>
                  <span>🕒 {currentTime}</span>
                  <span>
                    {playbackIndex + 1} / {totalPoints}
                  </span>
                </div>
              </div>

              {/* Play/Pause + Restart */}
              <div className="flex gap-2">
                <button
                  onClick={onTogglePlay}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Play
                    </>
                  )}
                </button>
                <button
                  onClick={() => onSeek(0)}
                  title="Restart"
                  className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Speed buttons */}
              <div className="flex gap-2">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeed(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                      playSpeed === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Current speed */}
              {currentPoint && (
                <div className="text-center text-sm bg-slate-50 rounded-lg py-2">
                  Current speed:{' '}
                  <span className="font-bold text-slate-900">
                    {currentPoint.speed} km/h
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Route stats */}
          {stats && (
            <div className="border-t pt-4 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Route Summary
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Navigation size={12} />
                    Distance
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.distanceKm} km
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Clock size={12} />
                    Duration
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.durationMin} min
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Gauge size={12} />
                    Avg speed
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.avgSpeed} km/h
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Gauge size={12} />
                    Max speed
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stats.maxSpeed} km/h
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <MapPin size={14} className="text-blue-600 shrink-0" />
                <div>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" /> Start
                  &nbsp;·&nbsp;
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" /> End
                  &nbsp;·&nbsp; Blue line = route
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
