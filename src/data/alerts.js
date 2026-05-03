// Fake alerts/notifications. Backend will generate these from real events.
// type: 'speeding' | 'outside_zone' | 'accident' | 'reckless' | 'engine_off' | 'maintenance'
// severity: 'critical' | 'warning' | 'info'
export const alerts = [
  {
    id: 'A001',
    vehicleId: 3,
    type: 'speeding',
    severity: 'warning',
    title: 'Speeding detected',
    message: 'Vehicle exceeded 100 km/h on King Fahd Road',
    timestamp: '2026-05-02 18:42',
    acknowledged: false,
  },
  {
    id: 'A002',
    vehicleId: 1,
    type: 'reckless',
    severity: 'warning',
    title: 'Harsh braking',
    message: 'Sudden stop detected at Olaya district',
    timestamp: '2026-05-02 17:15',
    acknowledged: false,
  },
  {
    id: 'A003',
    vehicleId: 4,
    type: 'outside_zone',
    severity: 'warning',
    title: 'Vehicle left allowed zone',
    message: 'Kia Optima exited Riyadh Downtown zone',
    timestamp: '2026-05-02 16:30',
    acknowledged: false,
  },
  {
    id: 'A004',
    vehicleId: 5,
    type: 'accident',
    severity: 'critical',
    title: '🚨 Possible accident',
    message: 'Sudden impact detected. Driver not responding.',
    timestamp: '2026-05-02 14:08',
    acknowledged: false,
  },
  {
    id: 'A005',
    vehicleId: 2,
    type: 'reckless',
    severity: 'warning',
    title: 'Sharp turn detected',
    message: 'Aggressive cornering on Northern Ring Road',
    timestamp: '2026-05-02 12:55',
    acknowledged: true,
  },
  {
    id: 'A006',
    vehicleId: 1,
    type: 'speeding',
    severity: 'warning',
    title: 'Speeding detected',
    message: 'Vehicle exceeded 120 km/h on highway',
    timestamp: '2026-05-01 22:30',
    acknowledged: true,
  },
  {
    id: 'A007',
    vehicleId: 3,
    type: 'engine_off',
    severity: 'info',
    title: 'Engine turned off',
    message: 'Vehicle parked at fuel station',
    timestamp: '2026-05-01 19:10',
    acknowledged: true,
  },
]

export function alertsForVehicle(vehicleId) {
  return alerts.filter((a) => a.vehicleId === vehicleId)
}

export function unreadAlertsCount() {
  return alerts.filter((a) => !a.acknowledged).length
}

export function criticalAlertsCount() {
  return alerts.filter((a) => !a.acknowledged && a.severity === 'critical').length
}
