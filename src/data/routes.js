// Fake route data generator.
// Generates a believable GPS path for a vehicle on a given date.
// Later, the backend will replace this with real history data.

import { vehicles } from './vehicles'

// Simple seeded random so same (vehicleId + date) always gives the same route
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Generates a fake driving route.
 * Returns an array of points: [{ lat, lng, time, speed }]
 *
 * The route looks like a real drive — random turns, varying speeds,
 * occasional stops (speed = 0).
 */
export function getRouteForVehicle(vehicleId, dateStr) {
  const vehicle = vehicles.find((v) => v.id === Number(vehicleId))
  if (!vehicle) return []

  const seed = hashString(`${vehicleId}-${dateStr}`)
  const numPoints = 80 + Math.floor(seededRandom(seed) * 40) // 80–120 points

  const points = []
  let lat = vehicle.lat
  let lng = vehicle.lng

  // Direction angle in radians, changes slightly each step
  let heading = seededRandom(seed + 1) * Math.PI * 2

  // Start time = 08:00 on the given date
  const startTime = new Date(`${dateStr}T08:00:00`).getTime()

  for (let i = 0; i < numPoints; i++) {
    // Slightly change heading (turns)
    heading += (seededRandom(seed + i * 3) - 0.5) * 0.4

    // Step size in degrees (~50–150 m per step)
    const step = 0.0005 + seededRandom(seed + i * 7) * 0.001

    lat += Math.cos(heading) * step
    lng += Math.sin(heading) * step

    // Speed: mostly 30–80, sometimes stops
    const r = seededRandom(seed + i * 11)
    let speed
    if (r < 0.1) speed = 0 // stopped
    else if (r < 0.3) speed = Math.round(20 + r * 40)
    else speed = Math.round(40 + r * 60)

    // Time progresses ~30 seconds per point => ~40-60 min total drive
    const time = startTime + i * 30 * 1000

    points.push({ lat, lng, time, speed })
  }

  return points
}

// Returns a quick summary stat for the route
export function getRouteStats(points) {
  if (points.length === 0) return { distanceKm: 0, durationMin: 0, avgSpeed: 0, maxSpeed: 0 }

  let distance = 0
  for (let i = 1; i < points.length; i++) {
    const dLat = points[i].lat - points[i - 1].lat
    const dLng = points[i].lng - points[i - 1].lng
    // Rough km conversion (good enough for fake data)
    distance += Math.sqrt(dLat * dLat + dLng * dLng) * 111
  }

  const durationMs = points[points.length - 1].time - points[0].time
  const durationMin = Math.round(durationMs / 60000)
  const speeds = points.map((p) => p.speed).filter((s) => s > 0)
  const avgSpeed = speeds.length
    ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)
    : 0
  const maxSpeed = Math.max(...points.map((p) => p.speed))

  return {
    distanceKm: Number(distance.toFixed(1)),
    durationMin,
    avgSpeed,
    maxSpeed,
  }
}
