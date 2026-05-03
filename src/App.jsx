import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { vehicles as initialVehicles } from './data/vehicles'
import { zones } from './data/zones'
import Sidebar from './components/Sidebar'
import VehicleDetail from './components/VehicleDetail'
import TopBar from './components/TopBar'
import AlertsPanel from './components/AlertsPanel'
import MaintenancePanel from './components/MaintenancePanel'
import CustomersPage from './components/CustomersPage'
import AccountSettings from './components/AccountSettings'
import Login from './components/Login'
import { useLiveMovement } from './hooks/useLiveMovement'

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
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('vehicles')
  const [overlay, setOverlay] = useState(null) // 'alerts' | 'maintenance' | 'customers' | 'account' | null
  const [vehicleOverrides, setVehicleOverrides] = useState({})

  // Live moving vehicles (only when logged in)
  const liveVehicles = useLiveMovement(initialVehicles, 1500)

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

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const center = [24.7136, 46.6753]

  return (
    <div className="h-screen w-screen flex flex-col">
      <TopBar
        user={user}
        onOpen={setOverlay}
        onLogout={() => {
          setUser(null)
          setSelected(null)
          setOverlay(null)
        }}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          vehicles={vehicles}
          zones={zones}
          onSelect={setSelected}
          selectedId={selected?.id}
          tab={tab}
          onTabChange={setTab}
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

            {/* Zones */}
            {zones.map((zone) => (
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

      {/* Overlays */}
      {overlay === 'alerts' && (
        <AlertsPanel
          onClose={() => setOverlay(null)}
          onSelectVehicle={(v) => setSelected(v)}
        />
      )}
      {overlay === 'maintenance' && (
        <MaintenancePanel
          onClose={() => setOverlay(null)}
          onSelectVehicle={(v) => setSelected(v)}
        />
      )}
      {overlay === 'customers' && (
        <CustomersPage onClose={() => setOverlay(null)} />
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
