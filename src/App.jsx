import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import { vehicles as initialVehicles } from './data/vehicles'
import { zones as initialZones } from './data/zones'
import { saudiBorder } from './data/saudiBorder'
import Sidebar from './components/Sidebar'
import VehicleDetail from './components/VehicleDetail'
import TopBar from './components/TopBar'
import AlertsPanel from './components/AlertsPanel'
import MaintenancePanel from './components/MaintenancePanel'
import CustomersPage from './components/CustomersPage'
import PlaybackPanel from './components/PlaybackPanel'
import MasterDashboard from './components/MasterDashboard'
import { ZoneDrawHandler, ZoneSaveDialog } from './components/ZoneDrawing'
import AccountSettings from './components/AccountSettings'
import Login from './components/Login'
import { useLiveMovement } from './hooks/useLiveMovement'
import { useZoneViolations } from './hooks/useZoneViolations'
import {
  allFeatureIds,
  calculateDeviceBilling,
  getPlanMeta,
  getTemplateById,
  initialCompanies,
} from './data/companies'

// Custom car marker — green if engine ON, gray if OFF
function carIcon(engineOn, emoji = '🚗') {
  const color = engineOn ? '#22c55e' : '#94a3b8'
  const html = `
    <div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    ">${emoji}</div>
  `
  return L.divIcon({
    html,
    className: 'car-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

function FlyToVehicle({ vehicle }) {
  const map = useMap()
  if (vehicle) {
    map.flyTo([vehicle.lat, vehicle.lng], 15, { duration: 1.2 })
  }
  return null
}

function App() {
  const [user, setUser] = useState(null)
  const [companies, setCompanies] = useState(initialCompanies)
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('vehicles')
  const [overlay, setOverlay] = useState(null) // 'alerts' | 'maintenance' | 'customers' | 'account' | null
  const [vehicleOverrides, setVehicleOverrides] = useState({})
  const [zoneToast, setZoneToast] = useState(null)
  const [zones, setZones] = useState(initialZones)
  const [drawMode, setDrawMode] = useState(null) // null | 'pickCenter' | 'pickRadius'
  const [draftZone, setDraftZone] = useState(null) // { lat, lng, radius }
  const [showZoneDialog, setShowZoneDialog] = useState(false)
  const [route, setRoute] = useState(null) // { vehicleId, date, points, stats, vehicle }
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1) // 1x, 2x, 5x
  const impersonatedCompany =
    user?.role === 'master' && user?.impersonatingCompanyId
      ? companies.find((company) => company.id === user.impersonatingCompanyId) || null
      : null
  const signedInCompany =
    user?.role === 'admin'
      ? companies.find((company) => company.id === user.companyId) || companies[0] || null
      : null
  const activeCompany = impersonatedCompany || signedInCompany
  const enabledFeatures =
    activeCompany?.enabledFeatures?.length ? activeCompany.enabledFeatures : allFeatureIds
  const zonesEnabled = enabledFeatures.includes('zones')
  const alertsEnabled = enabledFeatures.includes('alerts')
  const maintenanceEnabled = enabledFeatures.includes('maintenance')
  const customersEnabled = enabledFeatures.includes('customers')
  const playbackEnabled = enabledFeatures.includes('playback')
  const visibleZones = zonesEnabled ? zones : []

  // Animate playback marker
  useEffect(() => {
    if (!isPlaying || !route) return
    const interval = setInterval(() => {
      setPlaybackIndex((i) => {
        if (i >= route.points.length - 1) {
          setIsPlaying(false)
          return i
        }
        return i + 1
      })
    }, 200 / playSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, route, playSpeed])


  // Live moving vehicles (only when logged in)
  const liveVehicles = useLiveMovement(initialVehicles, 1500)

  // Watch for zone-violation alerts (live)
  useZoneViolations(liveVehicles, visibleZones, zonesEnabled ? saudiBorder : [], (alert) => {
    if (!alertsEnabled) return
    setZoneToast(alert)
    setTimeout(() => setZoneToast(null), 5000)
  })

  // Apply user edits on top of live data
  const vehicles = liveVehicles.map((v) =>
    vehicleOverrides[v.id] ? { ...v, ...vehicleOverrides[v.id] } : v
  )

  // Keep selected in sync with the live moving copy
  const selectedLive = selected ? vehicles.find((v) => v.id === selected.id) : null

  const handleSaveVehicle = (updated) => {
    setVehicleOverrides((prev) => ({
      ...prev,
      [updated.id]: {
        name: updated.name,
        plate: updated.plate,
        driver: updated.driver,
        mileage: updated.mileage,
        icon: updated.icon,
        color: updated.color,
        year: updated.year,
        fuelType: updated.fuelType,
        zoneScope: updated.zoneScope,
        speedLimit: updated.speedLimit,
      },
    }))
  }

  const handleCreateCompany = (draftCompany) => {
    const template = getTemplateById(draftCompany.templateId)
    const planMeta = getPlanMeta(draftCompany.plan)
    const createdAt = new Date().toISOString()
    const billing = calculateDeviceBilling({
      devicePackageId: draftCompany.devicePackageId,
      vehicleCount: draftCompany.vehicleCount,
      trackingDeviceUnitPrice: draftCompany.trackingDeviceUnitPrice,
      dashcamUnitPrice: draftCompany.dashcamUnitPrice,
      yearlySubscriptionUnitPrice: draftCompany.yearlySubscriptionUnitPrice,
    })

    setCompanies((current) => [
      {
        id: `co_${Date.now()}`,
        name: draftCompany.name,
        logo: template.icon,
        contact: draftCompany.contact,
        email: draftCompany.email,
        phone: draftCompany.phone,
        city: draftCompany.city,
        plan: draftCompany.plan,
        monthlyFee: planMeta.monthlyFee,
        vehicleCount: draftCompany.vehicleCount,
        vehicleLimit: Math.max(planMeta.vehicleLimit, draftCompany.vehicleCount),
        status: 'trial',
        createdAt: createdAt.slice(0, 10),
        lastActiveAt: createdAt,
        templateId: draftCompany.templateId,
        devicePackageId: draftCompany.devicePackageId,
        trackingDeviceUnitPrice: draftCompany.trackingDeviceUnitPrice,
        dashcamUnitPrice:
          draftCompany.devicePackageId === 'tracking_dashcam'
            ? draftCompany.dashcamUnitPrice
            : 0,
        yearlySubscriptionUnitPrice: draftCompany.yearlySubscriptionUnitPrice,
        enabledFeatures: draftCompany.enabledFeatures,
        ...billing,
      },
      ...current,
    ])
  }

  const resetWorkspaceView = () => {
    setSelected(null)
    setTab('vehicles')
    setOverlay(null)
    setZoneToast(null)
    setDrawMode(null)
    setDraftZone(null)
    setShowZoneDialog(false)
    setRoute(null)
    setPlaybackIndex(0)
    setIsPlaying(false)
  }


  if (!user) {
    return <Login onLogin={setUser} />
  }

  // Master mode: show platform dashboard instead of company app
  if (user.role === 'master' && !user.impersonatingCompanyId) {
    return (
      <MasterDashboard
        user={user}
        companies={companies}
        onCreateCompany={handleCreateCompany}
        onOpenCompany={(company) => {
          resetWorkspaceView()
          setUser({ ...user, impersonatingCompanyId: company.id })
        }}
        onLogout={() => {
          resetWorkspaceView()
          setUser(null)
        }}
      />
    )
  }

  const center = [24.7136, 46.6753]

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Impersonation banner (only when master is viewing as a company) */}
      {user.role === 'master' && impersonatedCompany && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            👁️ Viewing as <span className="font-bold">{impersonatedCompany.name}</span>
            <span className="text-amber-800">· Master mode</span>
          </div>
          <button
            onClick={() => {
              resetWorkspaceView()
              setUser({ ...user, impersonatingCompanyId: null })
            }}
            className="px-3 py-1 bg-amber-950 text-amber-50 rounded-lg text-xs font-semibold hover:bg-amber-900"
          >
            ← Back to Master
          </button>
        </div>
      )}

      <TopBar
        user={impersonatedCompany ? { ...user, name: impersonatedCompany.contact, role: 'admin' } : user}
        impersonating={impersonatedCompany}
        enabledFeatures={enabledFeatures}
        onOpen={setOverlay}
        onLogout={() => {
          resetWorkspaceView()
          setUser(null)
          setSelected(null)
          setOverlay(null)
        }}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          vehicles={vehicles}
          zones={visibleZones}
          enabledFeatures={enabledFeatures}
          onSelect={setSelected}
          selectedId={selected?.id}
          tab={tab}
          onTabChange={setTab}
          drawMode={drawMode}
          onStartDraw={() => {
            setDrawMode('pickCenter')
            setDraftZone(null)
          }}
          onCancelDraw={() => {
            setDrawMode(null)
            setDraftZone(null)
          }}
          onDeleteZone={(id) => setZones((z) => z.filter((zone) => zone.id !== id))}
        />

        <div className="flex-1 h-full relative">
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToVehicle vehicle={selected} />

            {/* Zone drawing handler (only listens during draw mode) */}
            {drawMode && zonesEnabled && (
              <ZoneDrawHandler
                drawMode={drawMode}
                draftZone={draftZone}
                setDraftZone={setDraftZone}
                setDrawMode={setDrawMode}
                onComplete={() => setShowZoneDialog(true)}
              />
            )}

            {/* Draft zone preview while drawing */}
            {draftZone && zonesEnabled && (
              <Circle
                center={[draftZone.lat, draftZone.lng]}
                radius={draftZone.radius}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '6 4',
                }}
              />
            )}

            {/* Saudi country border (visual outline for country-wide vehicles) */}
            {zonesEnabled && (
              <Polygon
                positions={saudiBorder}
                pathOptions={{
                  color: '#16a34a',
                  fillColor: '#16a34a',
                  fillOpacity: 0.04,
                  weight: 2,
                  dashArray: '8 6',
                }}
              />
            )}

            {/* Playback route */}
            {route && route.points.length > 0 && (
              <>
                <Polyline
                  positions={route.points.map((p) => [p.lat, p.lng])}
                  pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }}
                />
                {/* Start marker */}
                <Circle
                  center={[route.points[0].lat, route.points[0].lng]}
                  radius={40}
                  pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.8 }}
                />
                {/* End marker */}
                <Circle
                  center={[
                    route.points[route.points.length - 1].lat,
                    route.points[route.points.length - 1].lng,
                  ]}
                  radius={40}
                  pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}
                />
                {/* Playback marker (moving car) */}
                {route.points[playbackIndex] && (
                  <Marker
                    position={[
                      route.points[playbackIndex].lat,
                      route.points[playbackIndex].lng,
                    ]}
                    icon={carIcon(true, route.vehicle?.icon || '🚗')}
                  >
                    <Popup>
                      <div style={{ fontSize: '13px' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {route.vehicle?.name}
                        </div>
                        <div>⚡ Speed: {route.points[playbackIndex].speed} km/h</div>
                        <div>
                          🕒{' '}
                          {new Date(route.points[playbackIndex].time).toLocaleTimeString(
                            [],
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}

            {/* Zones */}
            {visibleZones.map((zone) => (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      🛡️ {zone.name}
                    </div>
                    <div>{zone.description}</div>
                    <div style={{ marginTop: '4px', color: '#64748b' }}>
                      Radius: {(zone.radius / 1000).toFixed(1)} km
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Vehicles */}
            {vehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={[vehicle.lat, vehicle.lng]}
                icon={carIcon(vehicle.engineOn, vehicle.icon)}
                eventHandlers={{
                  click: () => setSelected(vehicle),
                }}
              >
                <Popup>
                  <div style={{ fontSize: '13px', minWidth: '180px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                      {vehicle.name}
                    </div>
                    <div>👤 Driver: {vehicle.driver}</div>
                    <div>⚡ Speed: {vehicle.speed} km/h</div>
                    <div>
                      🔑 Engine:{' '}
                      <span style={{ color: vehicle.engineOn ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        {vehicle.engineOn ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div>📊 Mileage: {vehicle.mileage.toLocaleString()} km</div>
                    <div>
                      {vehicle.zoneScope === 'country' ? '🇸🇦' : '🏙️'} Allowed area:{' '}
                      <span style={{ fontWeight: 'bold' }}>
                        {vehicle.zoneScope === 'country' ? 'Saudi Arabia' : 'City only'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedLive && (
          <VehicleDetail
            vehicle={selectedLive}
            onClose={() => setSelected(null)}
            onSaveVehicle={handleSaveVehicle}
          />
        )}
      </div>

      {/* Drawing mode banner */}
      {drawMode && zonesEnabled && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1500] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-3">
          {drawMode === 'pickCenter' ? (
            <>
              📍 Click on the map to place the zone center
            </>
          ) : (
            <>
              ⭕ Move your mouse to size it, click to confirm
            </>
          )}
          <button
            onClick={() => {
              setDrawMode(null)
              setDraftZone(null)
            }}
            className="ml-2 text-blue-100 hover:text-white text-xs underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Save zone dialog */}
      {showZoneDialog && zonesEnabled && (
        <ZoneSaveDialog
          draftZone={draftZone}
          onSave={(newZone) => {
            setZones((z) => [...z, newZone])
            setDraftZone(null)
            setShowZoneDialog(false)
            setDrawMode(null)
          }}
          onCancel={() => {
            setDraftZone(null)
            setShowZoneDialog(false)
            setDrawMode(null)
          }}
        />
      )}

      {/* Zone violation toast */}
      {zoneToast && (
        <div className="fixed bottom-6 right-6 z-[2000] bg-amber-500 text-white rounded-xl shadow-2xl px-4 py-3 max-w-sm flex items-start gap-3 animate-pulse">
          <div className="text-2xl">🚨</div>
          <div>
            <div className="font-bold text-sm">{zoneToast.title}</div>
            <div className="text-xs text-amber-50 mt-0.5">{zoneToast.message}</div>
          </div>
          <button
            onClick={() => setZoneToast(null)}
            className="text-amber-100 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Overlays */}
      {overlay === 'alerts' && alertsEnabled && (
        <AlertsPanel
          onClose={() => setOverlay(null)}
          onSelectVehicle={(v) => setSelected(v)}
        />
      )}
      {overlay === 'maintenance' && maintenanceEnabled && (
        <MaintenancePanel
          onClose={() => setOverlay(null)}
          onSelectVehicle={(v) => setSelected(v)}
        />
      )}
      {overlay === 'customers' && customersEnabled && (
        <CustomersPage onClose={() => setOverlay(null)} />
      )}
      {overlay === 'playback' && playbackEnabled && (
        <PlaybackPanel
          onClose={() => setOverlay(null)}
          onLoadRoute={(r) => {
            setRoute(r)
            setIsPlaying(false)
            setPlaybackIndex(0)
          }}
          route={route}
          onClearRoute={() => {
            setRoute(null)
            setIsPlaying(false)
            setPlaybackIndex(0)
          }}
          playbackIndex={playbackIndex}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeek={(i) => setPlaybackIndex(i)}
          playSpeed={playSpeed}
          onChangeSpeed={setPlaySpeed}
        />
      )}
      {overlay === 'account' && (
        <AccountSettings
          user={user}
          onClose={() => setOverlay(null)}
          onSave={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  )
}

export default App
