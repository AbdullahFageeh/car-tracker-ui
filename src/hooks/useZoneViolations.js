import { useEffect, useRef } from 'react'
import { isInsideAllowedArea } from '../data/zones'
import { alerts } from '../data/alerts'

/**
 * Watches vehicles and pushes a new alert when one leaves its allowed area.
 * - city vehicles: alert when outside all zones
 * - country vehicles: alert when outside Saudi border
 *
 * Uses a ref to remember each vehicle's last known status, so we only fire
 * an alert on the EDGE (when it transitions from inside -> outside),
 * not every tick while it's outside.
 */
export function useZoneViolations(vehicles, zones, saudiBorder, onNewAlert) {
  const statusRef = useRef({}) // { [vehicleId]: 'inside' | 'outside' }

  useEffect(() => {
    vehicles.forEach((v) => {
      const inside = isInsideAllowedArea(v, zones, saudiBorder)
      const newStatus = inside ? 'inside' : 'outside'
      const prev = statusRef.current[v.id]

      // Only fire an alert when the vehicle JUST left the area
      if (prev === 'inside' && newStatus === 'outside') {
        const alert = {
          id: `Z-${v.id}-${Date.now()}`,
          vehicleId: v.id,
          type: 'outside_zone',
          severity: 'warning',
          title: 'Vehicle left allowed area',
          message:
            v.zoneScope === 'country'
              ? `${v.name} exited Saudi Arabia`
              : `${v.name} left its city zone`,
          timestamp: new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          acknowledged: false,
        }
        // Push to the live alerts array (mock backend)
        alerts.unshift(alert)
        if (onNewAlert) onNewAlert(alert)
      }

      statusRef.current[v.id] = newStatus
    })
  }, [vehicles, zones, saudiBorder, onNewAlert])
}
