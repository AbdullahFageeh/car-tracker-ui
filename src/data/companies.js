export const planCatalog = {
  Starter: { monthlyFee: 199, vehicleLimit: 10 },
  Pro: { monthlyFee: 499, vehicleLimit: 50 },
  Enterprise: { monthlyFee: 1499, vehicleLimit: 200 },
}

export const featureCatalog = [
  {
    id: 'live_tracking',
    name: 'Live tracking',
    description: 'Map view, vehicle list, and live vehicle details.',
    required: true,
  },
  {
    id: 'zones',
    name: 'Zones & geofences',
    description: 'Draw zones and control allowed operating areas.',
  },
  {
    id: 'alerts',
    name: 'Alerts',
    description: 'Alerts panel and live violation notifications.',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Service schedules and oil-change tracking.',
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer records and rental visibility.',
  },
  {
    id: 'playback',
    name: 'Track playback',
    description: 'Replay routes and view trip history.',
  },
]

export const allFeatureIds = featureCatalog.map((feature) => feature.id)

export const companyTemplates = [
  {
    id: 'car_rental',
    name: 'Car rental',
    icon: '🚗',
    description: 'Built for rental fleets that need customers, maintenance, and trip playback.',
    recommendedPlan: 'Pro',
    defaultFeatures: allFeatureIds,
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚌',
    description: 'Good for buses, staff transport, and passenger fleet operations.',
    recommendedPlan: 'Pro',
    defaultFeatures: ['live_tracking', 'zones', 'alerts', 'maintenance', 'playback'],
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: '🚛',
    description: 'Designed for heavy fleets, shipping, machinery, and distribution teams.',
    recommendedPlan: 'Enterprise',
    defaultFeatures: ['live_tracking', 'zones', 'alerts', 'maintenance', 'playback'],
  },
  {
    id: 'food_delivery',
    name: 'Food delivery',
    icon: '🛵',
    description: 'Fast-moving fleets for delivery cars and motorbikes.',
    recommendedPlan: 'Starter',
    defaultFeatures: ['live_tracking', 'zones', 'alerts', 'playback'],
  },
]

export function getTemplateById(templateId) {
  return (
    companyTemplates.find((template) => template.id === templateId) ||
    companyTemplates[0]
  )
}

export function getDefaultFeaturesForTemplate(templateId) {
  const template = getTemplateById(templateId)
  return featureCatalog
    .map((feature) => feature.id)
    .filter((featureId) => template.defaultFeatures.includes(featureId))
}

export function getPlanMeta(plan) {
  return planCatalog[plan] || planCatalog.Starter
}
export const devicePackageCatalog = [
  {
    id: 'tracking_only',
    name: 'Tracking only',
    icon: '📍',
    description: 'A tracking device for every vehicle plus the yearly tracking subscription.',
    defaultPricing: {
      trackingDeviceUnitPrice: 230,
      dashcamUnitPrice: 0,
      yearlySubscriptionUnitPrice: 180,
    },
  },
  {
    id: 'tracking_dashcam',
    name: 'Tracking + dashcam',
    icon: '📷',
    description: 'Tracking device, dashcam hardware, and the combined yearly service package.',
    defaultPricing: {
      trackingDeviceUnitPrice: 230,
      dashcamUnitPrice: 260,
      yearlySubscriptionUnitPrice: 290,
    },
  },
]

export function getDevicePackageById(packageId) {
  return (
    devicePackageCatalog.find((devicePackage) => devicePackage.id === packageId) ||
    devicePackageCatalog[0]
  )
}

export function calculateDeviceBilling({
  devicePackageId,
  vehicleCount,
  trackingDeviceUnitPrice,
  dashcamUnitPrice,
  yearlySubscriptionUnitPrice,
}) {
  const devicePackage = getDevicePackageById(devicePackageId)
  const safeVehicleCount = Math.max(Number(vehicleCount) || 0, 0)
  const safeTrackingPrice = Math.max(Number(trackingDeviceUnitPrice) || 0, 0)
  const safeDashcamPrice =
    devicePackage.id === 'tracking_dashcam'
      ? Math.max(Number(dashcamUnitPrice) || 0, 0)
      : 0
  const safeYearlyPrice = Math.max(Number(yearlySubscriptionUnitPrice) || 0, 0)
  const trackingHardwareTotal = safeVehicleCount * safeTrackingPrice
  const dashcamHardwareTotal = safeVehicleCount * safeDashcamPrice
  const hardwareTotal = trackingHardwareTotal + dashcamHardwareTotal
  const annualSubscriptionTotal = safeVehicleCount * safeYearlyPrice

  return {
    trackingHardwareTotal,
    dashcamHardwareTotal,
    hardwareTotal,
    annualSubscriptionTotal,
  }
}

function withTemplate(company, templateId, devicePackageId = 'tracking_only', pricing = {}) {
  const devicePackage = getDevicePackageById(devicePackageId)
  const trackingDeviceUnitPrice =
    pricing.trackingDeviceUnitPrice ??
    devicePackage.defaultPricing.trackingDeviceUnitPrice
  const dashcamUnitPrice =
    devicePackageId === 'tracking_dashcam'
      ? pricing.dashcamUnitPrice ?? devicePackage.defaultPricing.dashcamUnitPrice
      : 0
  const yearlySubscriptionUnitPrice =
    pricing.yearlySubscriptionUnitPrice ??
    devicePackage.defaultPricing.yearlySubscriptionUnitPrice
  const billing = calculateDeviceBilling({
    devicePackageId,
    vehicleCount: company.vehicleCount,
    trackingDeviceUnitPrice,
    dashcamUnitPrice,
    yearlySubscriptionUnitPrice,
  })

  return {
    ...company,
    templateId,
    enabledFeatures: getDefaultFeaturesForTemplate(templateId),
    devicePackageId,
    trackingDeviceUnitPrice,
    dashcamUnitPrice,
    yearlySubscriptionUnitPrice,
    ...billing,
  }
}

// Fake companies (master-level data).
// Later: backend will provide these via API.
export const initialCompanies = [
  withTemplate(
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
    'car_rental',
    'tracking_only'
  ),
  withTemplate(
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
    'car_rental',
    'tracking_dashcam'
  ),
  withTemplate(
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
    'car_rental',
    'tracking_only'
  ),
  withTemplate(
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
    'logistics',
    'tracking_dashcam'
  ),
  withTemplate(
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
    'car_rental',
    'tracking_only'
  ),
  withTemplate(
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
    'transportation',
    'tracking_dashcam'
  ),
]

export function getPlatformStats(companies = initialCompanies) {
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((company) => company.status === 'active').length
  const totalVehicles = companies.reduce((sum, company) => sum + company.vehicleCount, 0)
  const annualSubscriptionRevenue = companies
    .filter((company) => company.status === 'active')
    .reduce((sum, company) => sum + company.annualSubscriptionTotal, 0)
  const trialCount = companies.filter((company) => company.status === 'trial').length
  const suspendedCount = companies.filter((company) => company.status === 'suspended').length
  const hardwareRevenue = companies.reduce((sum, company) => sum + company.hardwareTotal, 0)

  return {
    totalCompanies,
    activeCompanies,
    totalVehicles,
    annualSubscriptionRevenue,
    hardwareRevenue,
    trialCount,
    suspendedCount,
  }
}
