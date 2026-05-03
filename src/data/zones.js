// Fake zones (geofences). Later, the backend / user will create these.
export const zones = [
  {
    id: 1,
    name: 'Riyadh Downtown',
    description: 'Allowed area for rental cars',
    lat: 24.7136,
    lng: 46.6753,
    radius: 8000, // meters (8 km)
    color: '#22c55e',
  },
  {
    id: 2,
    name: 'King Khalid Airport',
    description: 'Pickup / drop-off zone',
    lat: 24.9576,
    lng: 46.6988,
    radius: 5000, // 5 km
    color: '#3b82f6',
  },
]

// Helper: check if a vehicle is inside a zone
// Uses simple distance formula (good enough for small distances)
export function isInsideZone(vehicle, zone) {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(vehicle.lat - zone.lat)
  const dLng = toRad(vehicle.lng - zone.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(zone.lat)) *
      Math.cos(toRad(vehicle.lat)) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance <= zone.radius
}

// For each vehicle, decide if it is inside ANY zone
export function vehicleStatus(vehicle, zones) {
  const inside = zones.some((z) => isInsideZone(vehicle, z))
  return inside ? 'inside' : 'outside'
}

// Point-in-polygon (ray casting algorithm) — used to check if vehicle is inside Saudi border
export function isInsidePolygon(lat, lng, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i]
    const [latJ, lngJ] = polygon[j]
    const intersect =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI
    if (intersect) inside = !inside
  }
  return inside
}

// Check if a vehicle is inside its allowed area
// - city scope: must be inside one of the geofence zones
// - country scope: must be inside the Saudi border
export function isInsideAllowedArea(vehicle, zones, saudiBorder) {
  if (vehicle.zoneScope === 'country') {
    return isInsidePolygon(vehicle.lat, vehicle.lng, saudiBorder)
  }
  // city scope (default)
  return zones.some((z) => isInsideZone(vehicle, z))
}
