// Fake rental history. Each rental links a vehicle to a customer.
// status: 'active' (still rented), 'completed', 'cancelled'
export const rentals = [
  // Vehicle 1 - Toyota Camry (currently rented)
  {
    id: 'R001',
    vehicleId: 1,
    customerId: 'C001',
    startDate: '2026-04-28',
    endDate: '2026-05-05',
    status: 'active',
    totalKm: 320,
    pricePerDay: 180,
  },
  {
    id: 'R002',
    vehicleId: 1,
    customerId: 'C002',
    startDate: '2026-04-10',
    endDate: '2026-04-20',
    status: 'completed',
    totalKm: 850,
    pricePerDay: 180,
  },
  {
    id: 'R003',
    vehicleId: 1,
    customerId: 'C003',
    startDate: '2026-03-15',
    endDate: '2026-03-22',
    status: 'completed',
    totalKm: 410,
    pricePerDay: 180,
  },

  // Vehicle 2 - Hyundai Sonata
  {
    id: 'R004',
    vehicleId: 2,
    customerId: 'C004',
    startDate: '2026-04-01',
    endDate: '2026-04-25',
    status: 'completed',
    totalKm: 1200,
    pricePerDay: 160,
  },
  {
    id: 'R005',
    vehicleId: 2,
    customerId: 'C005',
    startDate: '2026-02-10',
    endDate: '2026-02-17',
    status: 'completed',
    totalKm: 380,
    pricePerDay: 160,
  },

  // Vehicle 3 - Nissan Altima (currently rented)
  {
    id: 'R006',
    vehicleId: 3,
    customerId: 'C002',
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    status: 'active',
    totalKm: 95,
    pricePerDay: 170,
  },
  {
    id: 'R007',
    vehicleId: 3,
    customerId: 'C001',
    startDate: '2026-03-20',
    endDate: '2026-03-30',
    status: 'completed',
    totalKm: 720,
    pricePerDay: 170,
  },
  {
    id: 'R008',
    vehicleId: 3,
    customerId: 'C003',
    startDate: '2026-01-05',
    endDate: '2026-01-12',
    status: 'completed',
    totalKm: 540,
    pricePerDay: 170,
  },
  {
    id: 'R009',
    vehicleId: 3,
    customerId: 'C004',
    startDate: '2025-12-15',
    endDate: '2025-12-28',
    status: 'completed',
    totalKm: 1100,
    pricePerDay: 170,
  },

  // Vehicle 4 - Kia Optima (currently rented)
  {
    id: 'R010',
    vehicleId: 4,
    customerId: 'C005',
    startDate: '2026-04-30',
    endDate: '2026-05-07',
    status: 'active',
    totalKm: 145,
    pricePerDay: 150,
  },
  {
    id: 'R011',
    vehicleId: 4,
    customerId: 'C002',
    startDate: '2026-04-01',
    endDate: '2026-04-08',
    status: 'completed',
    totalKm: 290,
    pricePerDay: 150,
  },

  // Vehicle 5 - Chevrolet Malibu
  {
    id: 'R012',
    vehicleId: 5,
    customerId: 'C003',
    startDate: '2026-03-25',
    endDate: '2026-04-15',
    status: 'completed',
    totalKm: 1850,
    pricePerDay: 165,
  },
  {
    id: 'R013',
    vehicleId: 5,
    customerId: 'C001',
    startDate: '2026-02-20',
    endDate: '2026-03-05',
    status: 'completed',
    totalKm: 980,
    pricePerDay: 165,
  },
]

// Helper: get all rentals for a vehicle, newest first
export function getRentalsForVehicle(vehicleId) {
  return rentals
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

// Helper: get the active rental for a vehicle (if any)
export function getActiveRental(vehicleId) {
  return rentals.find(
    (r) => r.vehicleId === vehicleId && r.status === 'active'
  )
}

// Helper: count rental days between two YYYY-MM-DD strings
export function rentalDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const ms = end - start
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

// Helper: stats for a vehicle's rental history
export function rentalStats(vehicleId) {
  const list = rentals.filter((r) => r.vehicleId === vehicleId)
  const totalRentals = list.length
  const totalDays = list.reduce(
    (sum, r) => sum + rentalDays(r.startDate, r.endDate),
    0
  )
  const totalRevenue = list.reduce(
    (sum, r) => sum + rentalDays(r.startDate, r.endDate) * r.pricePerDay,
    0
  )
  return { totalRentals, totalDays, totalRevenue }
}
