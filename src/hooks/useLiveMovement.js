import { useEffect, useState } from 'react'

// Simulates cars moving in real time.
// Every interval: cars with engineOn move slightly + speed wobbles a bit.
// Cars with engineOff stay still.
export function useLiveMovement(initialVehicles, intervalMs = 1500) {
  const [list, setList] = useState(initialVehicles)

  useEffect(() => {
    const id = setInterval(() => {
      setList((curr) =>
        curr.map((v) => {
          if (!v.engineOn) return v

          // Move in a small random direction
          const direction = Math.random() * Math.PI * 2
          // Distance per tick depends on speed (km/h) and interval (ms)
          const km = (v.speed * intervalMs) / 1000 / 3600
          // ~111 km per degree latitude
          const dLat = (km / 111) * Math.cos(direction)
          const dLng =
            (km / (111 * Math.cos((v.lat * Math.PI) / 180))) * Math.sin(direction)

          // Speed wobble (-5 .. +5 km/h), kept within 0..130
          const newSpeed = Math.max(
            0,
            Math.min(130, v.speed + (Math.random() * 10 - 5))
          )

          return {
            ...v,
            lat: v.lat + dLat,
            lng: v.lng + dLng,
            speed: Math.round(newSpeed),
          }
        })
      )
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs])

  return list
}
