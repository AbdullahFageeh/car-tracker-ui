import { useEffect, useState } from 'react'
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
import MarketingPage from './components/MarketingPage'
import { ZoneDrawHandler, ZoneSaveDialog } from './components/ZoneDrawing'
import AccountSettings from './components/AccountSettings'
import Login from './components/Login'
import {
  changePassword as changePasswordRequest,
  createCompany as createCompanyRequest,
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  signupTrial,
  updateProfile,
} from './lib/api'
import { useLiveMovement } from './hooks/useLiveMovement'
import { useZoneViolations } from './hooks/useZoneViolations'
import { allFeatureIds } from './data/companies'

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
  const [authView, setAuthView] = useState('landing')
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState(null)
  const [companies, setCompanies] = useState([])
  const [impersonatingCompanyId, setImpersonatingCompanyId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('vehicles')
  const [overlay, setOverlay] = useState(null)
  const [vehicleOverrides, setVehicleOverrides] = useState({})
  const [zoneToast, setZoneToast] = useState(null)
  const [zones, setZones] = useState(initialZones)
  const [drawMode, setDrawMode] = useState(null)
  const [draftZone, setDraftZone] = useState(null)
  const [showZoneDialog, setShowZoneDialog] = useState(false)
  const [route, setRoute] = useState(null)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1)

  useEffect(() => {
    let cancelled = false

    getSession()
      .then((payload) => {
        if (cancelled) return
        setUser(payload.user)
        setCompanies(Array.isArray(payload.companies) ? payload.companies : [])
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setCompanies([])
      })
      .finally(() => {
        if (!cancelled) {
          setAuthReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const sessionUser = (() => {
    if (!user) return null

    if (user.role === 'master') {
      const safeImpersonatingCompanyId =
        impersonatingCompanyId &&
        companies.some((company) => company.id === impersonatingCompanyId)
          ? impersonatingCompanyId
          : null

      return {
        ...user,
        impersonatingCompanyId: safeImpersonatingCompanyId,
      }
    }

    const matchingCompany =
      companies.find((company) => company.id === user.companyId) || null

    if (!matchingCompany) return null

    return {
      ...user,
      companyId: matchingCompany.id,
      company: matchingCompany.name,
    }
  })()

  const impersonatedCompany =
    sessionUser?.role === 'master' && sessionUser?.impersonatingCompanyId
      ? companies.find((company) => company.id === sessionUser.impersonatingCompanyId) || null
      : null
  const signedInCompany =
    sessionUser?.role === 'admin'
      ? companies.find((company) => company.id === sessionUser.companyId) || null
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

  useEffect(() => {
    if (!isPlaying || !route) return

    const interval = setInterval(() => {
      setPlaybackIndex((index) => {
        if (index >= route.points.length - 1) {
          setIsPlaying(false)
          return index
        }

        return index + 1
      })
    }, 200 / playSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, route, playSpeed])

  const liveVehicles = useLiveMovement(initialVehicles, 1500)

  useZoneViolations(
    liveVehicles,
    visibleZones,
    zonesEnabled ? saudiBorder : [],
    (alert) => {
      if (!alertsEnabled) return
      setZoneToast(alert)
      setTimeout(() => setZoneToast(null), 5000)
    }
  )

  const vehicles = liveVehicles.map((vehicle) =>
    vehicleOverrides[vehicle.id]
      ? { ...vehicle, ...vehicleOverrides[vehicle.id] }
      : vehicle
  )
  const selectedLive = selected ? vehicles.find((vehicle) => vehicle.id === selected.id) : null

  const handleSaveVehicle = (updated) => {
    setVehicleOverrides((current) => ({
      ...current,
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

  const applyAuthPayload = (payload) => {
    setUser(payload.user)
    setCompanies(Array.isArray(payload.companies) ? payload.companies : [])
    setImpersonatingCompanyId(null)
  }

  const handleCreateCompany = async (draftCompany) => {
    const { company } = await createCompanyRequest(draftCompany)
    setCompanies((currentCompanies) => [company, ...currentCompanies])
  }

  const handleCreateTrial = async (draftCompany) => {
    const payload = await signupTrial(draftCompany)
    resetWorkspaceView()
    setAuthView('landing')
    applyAuthPayload(payload)
  }

  const handleLogin = async (credentials) => {
    const payload = await loginRequest(credentials)
    resetWorkspaceView()
    setAuthView('landing')
    applyAuthPayload(payload)
  }

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Ignore logout cleanup failures and clear local auth state anyway.
    }

    resetWorkspaceView()
    setAuthView('landing')
    setImpersonatingCompanyId(null)
    setUser(null)
    setCompanies([])
  }

  const handleSaveUser = async (updatedUser) => {
    try {
      const payload = await updateProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
        units: updatedUser.units,
      })

      setUser(payload.user)
      setCompanies(Array.isArray(payload.companies) ? payload.companies : companies)

      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      await changePasswordRequest({
        currentPassword,
        newPassword,
      })

      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }

  if (!authReady) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading workspace…</div>
          <div className="text-sm text-slate-400 mt-2">
            Checking your signed-in session.
          </div>
        </div>
      </div>
    )
  }

  if (!sessionUser) {
    if (authView === 'login') {
      return <Login onBack={() => setAuthView('landing')} onLogin={handleLogin} />
    }

    return (
      <MarketingPage
        onCreateTrial={handleCreateTrial}
        onOpenLogin={() => setAuthView('login')}
      />
    )
  }

  if (sessionUser.role === 'master' && !sessionUser.impersonatingCompanyId) {
    return (
      <MasterDashboard
        user={sessionUser}
        companies={companies}
        onCreateCompany={handleCreateCompany}
        onOpenCompany={(company) => {
          resetWorkspaceView()
          setImpersonatingCompanyId(company.id)
        }}
        onLogout={handleLogout}
      />
    )
  }

  const center = [24.7136, 46.6753]

  return (
    <div className="h-screen w-screen flex flex-col">
      {sessionUser.role === 'master' && impersonatedCompany && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            👁️ Viewing as <span className="font-bold">{impersonatedCompany.name}</span>
            <span className="text-amber-800">· Master mode</span>
          </div>
          <button
            onClick={() => {
              resetWorkspaceView()
              setImpersonatingCompanyId(null)
            }}
            className="px-3 py-1 bg-amber-950 text-amber-50 rounded-lg text-xs font-semibold hover:bg-amber-900"
          >
            ← Back to Master
          </button>
        </div>
      )}

      <TopBar
        user={
          impersonatedCompany
            ? { ...sessionUser, name: impersonatedCompany.contact, role: 'admin' }
            : sessionUser
        }
        impersonating={impersonatedCompany}
        enabledFeatures={enabledFeatures}
        onOpen={setOverlay}
        onLogout={handleLogout}
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
          onDeleteZone={(id) => setZones((currentZones) => currentZones.filter((zone) => zone.id !== id))}
        />

        <div className="flex-1 h-full relative">
          <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToVehicle vehicle={selected} />

            {drawMode && zonesEnabled && (
              <ZoneDrawHandler
                drawMode={drawMode}
                draftZone={draftZone}
                setDraftZone={setDraftZone}
                setDrawMode={setDrawMode}
                onComplete={() => setShowZoneDialog(true)}
              />
            )}

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

            {route && route.points.length > 0 && (
              <>
                <Polyline
                  positions={route.points.map((point) => [point.lat, point.lng])}
                  pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }}
                />
                <Circle
                  center={[route.points[0].lat, route.points[0].lng]}
                  radius={40}
                  pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.8 }}
                />
                <Circle
                  center={[
                    route.points[route.points.length - 1].lat,
                    route.points[route.points.length - 1].lng,
                  ]}
                  radius={40}
                  pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}
                />
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
                        <div style={{ fontWeight: 'bold' }}>{route.vehicle?.name}</div>
                        <div>⚡ Speed: {route.points[playbackIndex].speed} km/h</div>
                        <div>
                          🕒{' '}
                          {new Date(route.points[playbackIndex].time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}

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
                      <span
                        style={{
                          color: vehicle.engineOn ? '#16a34a' : '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
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

      {drawMode && zonesEnabled && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[1500] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-3">
          {drawMode === 'pickCenter' ? (
            <>📍 Click on the map to place the zone center</>
          ) : (
            <>⭕ Move your mouse to size it, click to confirm</>
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

      {showZoneDialog && zonesEnabled && (
        <ZoneSaveDialog
          draftZone={draftZone}
          onSave={(newZone) => {
            setZones((currentZones) => [...currentZones, newZone])
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

      {overlay === 'alerts' && alertsEnabled && (
        <AlertsPanel onClose={() => setOverlay(null)} onSelectVehicle={(vehicle) => setSelected(vehicle)} />
      )}
      {overlay === 'maintenance' && maintenanceEnabled && (
        <MaintenancePanel
          onClose={() => setOverlay(null)}
          onSelectVehicle={(vehicle) => setSelected(vehicle)}
        />
      )}
      {overlay === 'customers' && customersEnabled && (
        <CustomersPage onClose={() => setOverlay(null)} />
      )}
      {overlay === 'playback' && playbackEnabled && (
        <PlaybackPanel
          onClose={() => setOverlay(null)}
          onLoadRoute={(nextRoute) => {
            setRoute(nextRoute)
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
          onTogglePlay={() => setIsPlaying((playing) => !playing)}
          onSeek={(index) => setPlaybackIndex(index)}
          playSpeed={playSpeed}
          onChangeSpeed={setPlaySpeed}
        />
      )}
      {overlay === 'account' && (
        <AccountSettings
          user={sessionUser}
          onClose={() => setOverlay(null)}
          onSave={handleSaveUser}
          onChangePassword={handleChangePassword}
        />
      )}
    </div>
  )
}

export default App
