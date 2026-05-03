// Fake companies (master-level data).
// Later: backend will provide these via API.

export const companies = [
  {
    id: 'co_1',
    name: 'Riyadh Rentals',
    logo: '🏢',
    contact: 'Ahmed Al-Saud',
    email: 'admin@riyadhrentals.com',
    phone: '+966 11 000 0000',
    city: 'Riyadh',
    plan: 'Pro',
    monthlyFee: 499,
    vehicleCount: 5,
    vehicleLimit: 50,
    status: 'active',
    createdAt: '2025-08-12',
    lastActiveAt: '2026-05-03T13:42:00',
  },
  {
    id: 'co_2',
    name: 'Jeddah Express Cars',
    logo: '🚗',
    contact: 'Salem Al-Harbi',
    email: 'fleet@jeddahexpress.com',
    phone: '+966 12 000 0000',
    city: 'Jeddah',
    plan: 'Pro',
    monthlyFee: 499,
    vehicleCount: 12,
    vehicleLimit: 50,
    status: 'active',
    createdAt: '2025-11-20',
    lastActiveAt: '2026-05-03T11:15:00',
  },
  {
    id: 'co_3',
    name: 'Dammam Auto Lease',
    logo: '🚙',
    contact: 'Fahad Al-Qahtani',
    email: 'manager@dammamlease.sa',
    phone: '+966 13 000 0000',
    city: 'Dammam',
    plan: 'Starter',
    monthlyFee: 199,
    vehicleCount: 3,
    vehicleLimit: 10,
    status: 'active',
    createdAt: '2026-01-05',
    lastActiveAt: '2026-05-02T19:30:00',
  },
  {
    id: 'co_4',
    name: 'Al-Khobar Fleet Co.',
    logo: '🚐',
    contact: 'Omar Al-Mansour',
    email: 'ops@alkhobarfleet.com',
    phone: '+966 13 555 0000',
    city: 'Al-Khobar',
    plan: 'Enterprise',
    monthlyFee: 1499,
    vehicleCount: 87,
    vehicleLimit: 200,
    status: 'active',
    createdAt: '2025-04-18',
    lastActiveAt: '2026-05-03T14:01:00',
  },
  {
    id: 'co_5',
    name: 'Madinah Rent A Car',
    logo: '🏬',
    contact: 'Yousef Al-Najdi',
    email: 'info@madinahrent.com',
    phone: '+966 14 222 0000',
    city: 'Madinah',
    plan: 'Starter',
    monthlyFee: 199,
    vehicleCount: 2,
    vehicleLimit: 10,
    status: 'suspended',
    createdAt: '2026-02-10',
    lastActiveAt: '2026-04-15T09:00:00',
  },
  {
    id: 'co_6',
    name: 'Mecca Holy Tours Vehicles',
    logo: '🕋',
    contact: 'Bandar Al-Otaibi',
    email: 'admin@meccatours.com',
    phone: '+966 12 888 0000',
    city: 'Mecca',
    plan: 'Pro',
    monthlyFee: 499,
    vehicleCount: 23,
    vehicleLimit: 50,
    status: 'trial',
    createdAt: '2026-04-25',
    lastActiveAt: '2026-05-03T08:22:00',
  },
]

export function getPlatformStats() {
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((c) => c.status === 'active').length
  const totalVehicles = companies.reduce((sum, c) => sum + c.vehicleCount, 0)
  const mrr = companies
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyFee, 0)
  const trialCount = companies.filter((c) => c.status === 'trial').length
  const suspendedCount = companies.filter((c) => c.status === 'suspended').length

  return {
    totalCompanies,
    activeCompanies,
    totalVehicles,
    mrr,
    trialCount,
    suspendedCount,
  }
}
