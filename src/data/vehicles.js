// Fake vehicles for testing. Later, the backend will provide real data.
// Each vehicle now also carries maintenance info.
export const vehicles = [
  {
    id: 1,
    name: 'Toyota Camry - ABC 1234',
    plate: 'ABC 1234',
    lat: 24.7136,
    lng: 46.6753,
    speed: 65,
    engineOn: true,
    mileage: 45230,
    driver: 'Ahmed',
    // maintenance
    lastOilChangeKm: 40000,
    nextOilChangeKm: 45000, // OVERDUE (mileage > nextOilChangeKm)
    nextServiceDate: '2026-05-15', // soon
    // zone scope: 'city' or 'country'
    zoneScope: 'city',
  },
  {
    id: 2,
    name: 'Hyundai Sonata - XYZ 5678',
    plate: 'XYZ 5678',
    lat: 24.7500,
    lng: 46.7000,
    speed: 0,
    engineOn: false,
    mileage: 28100,
    driver: 'Khalid',
    lastOilChangeKm: 25000,
    nextOilChangeKm: 30000,
    nextServiceDate: '2026-08-01',
    zoneScope: 'city',
  },
  {
    id: 3,
    name: 'Nissan Altima - DEF 9012',
    plate: 'DEF 9012',
    lat: 24.6900,
    lng: 46.6500,
    speed: 110,
    engineOn: true,
    mileage: 67890,
    driver: 'Omar',
    lastOilChangeKm: 65000,
    nextOilChangeKm: 70000, // due in ~2100 km
    nextServiceDate: '2026-06-20',
    zoneScope: 'country', // long distance
  },
  {
    id: 4,
    name: 'Kia Optima - GHI 3456',
    plate: 'GHI 3456',
    lat: 24.7300,
    lng: 46.6300,
    speed: 40,
    engineOn: true,
    mileage: 12450,
    driver: 'Faisal',
    lastOilChangeKm: 10000,
    nextOilChangeKm: 15000,
    nextServiceDate: '2026-07-05',
    zoneScope: 'city',
  },
  {
    id: 5,
    name: 'Chevrolet Malibu - JKL 7890',
    plate: 'JKL 7890',
    lat: 24.6800,
    lng: 46.7200,
    speed: 0,
    engineOn: false,
    mileage: 89500,
    driver: 'Yousef',
    lastOilChangeKm: 85000,
    nextOilChangeKm: 90000, // very soon
    nextServiceDate: '2026-05-08', // very soon
    zoneScope: 'country',
  },
]

// Maintenance helpers
export function maintenanceStatus(vehicle) {
  const kmLeft = vehicle.nextOilChangeKm - vehicle.mileage
  const today = new Date()
  const serviceDate = new Date(vehicle.nextServiceDate)
  const daysLeft = Math.round((serviceDate - today) / (1000 * 60 * 60 * 24))

  let status = 'ok'
  if (kmLeft <= 0 || daysLeft <= 0) status = 'overdue'
  else if (kmLeft <= 1000 || daysLeft <= 7) status = 'soon'

  return { kmLeft, daysLeft, status }
}
