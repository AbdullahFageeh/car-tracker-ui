import { calculateDeviceBilling } from '../src/data/companies.js'
function formatDateOnly(date) {
  return date ? date.toISOString().slice(0, 10) : null
}

export function serializeCompany(company) {
  const enabledFeatures = Array.isArray(company.enabledFeatures)
    ? company.enabledFeatures
    : []
  const billing = calculateDeviceBilling({
    devicePackageId: company.devicePackageId,
    vehicleCount: company.vehicleCount,
    trackingDeviceUnitPrice: company.trackingDeviceUnitPrice,
    dashcamUnitPrice: company.dashcamUnitPrice,
    yearlySubscriptionUnitPrice: company.yearlySubscriptionUnitPrice,
  })

  return {
    id: company.id,
    name: company.name,
    logo: company.logo,
    contact: company.contact,
    email: company.email,
    phone: company.phone,
    city: company.city,
    plan: company.plan,
    monthlyFee: company.monthlyFee,
    vehicleCount: company.vehicleCount,
    vehicleLimit: company.vehicleLimit,
    status: company.status,
    createdAt: company.createdAt.toISOString().slice(0, 10),
    lastActiveAt: (
      company.lastActiveAt ||
      company.updatedAt ||
      company.createdAt
    ).toISOString(),
    templateId: company.templateId,
    devicePackageId: company.devicePackageId,
    trackingDeviceUnitPrice: company.trackingDeviceUnitPrice,
    dashcamUnitPrice: company.dashcamUnitPrice,
    yearlySubscriptionUnitPrice: company.yearlySubscriptionUnitPrice,
    enabledFeatures,
    ...billing,
  }
}

function serializeDriverSummary(driver) {
  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone || '',
    email: driver.email || '',
    licenseNumber: driver.licenseNumber || '',
    status: driver.status || 'active',
  }
}
export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    language: user.language || 'en',
    timezone: user.timezone || 'Asia/Riyadh',
    units: user.units || 'metric',
    companyId: user.companyId || null,
    company: user.company?.name || '',
  }
}

export function serializeDriver(driver) {
  return {
    ...serializeDriverSummary(driver),
    companyId: driver.companyId,
    createdAt: driver.createdAt.toISOString(),
    updatedAt: driver.updatedAt.toISOString(),
    assignedVehicleCount:
      driver._count?.vehicles ??
      (Array.isArray(driver.vehicles) ? driver.vehicles.length : 0),
  }
}

export function serializeCustomer(customer) {
  return {
    id: customer.id,
    companyId: customer.companyId,
    name: customer.name,
    phone: customer.phone,
    nationalId: customer.nationalId,
    email: customer.email,
    joinedDate: formatDateOnly(customer.joinedDate),
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }
}

export function serializeVehicle(vehicle) {
  return {
    id: vehicle.id,
    companyId: vehicle.companyId,
    driverId: vehicle.driverId || null,
    driver: vehicle.driver?.name || '',
    driverRecord: vehicle.driver ? serializeDriverSummary(vehicle.driver) : null,
    name: vehicle.name,
    plate: vehicle.plate,
    icon: vehicle.icon || '🚗',
    photo: vehicle.photo || '',
    color: vehicle.color || '',
    year: vehicle.year,
    fuelType: vehicle.fuelType || 'petrol',
    lat: vehicle.lat,
    lng: vehicle.lng,
    speed: vehicle.speed,
    engineOn: vehicle.engineOn,
    mileage: vehicle.mileage,
    zoneScope: vehicle.zoneScope || 'city',
    speedLimit: vehicle.speedLimit ?? 120,
    lastOilChangeKm: vehicle.lastOilChangeKm,
    nextOilChangeKm: vehicle.nextOilChangeKm,
    nextServiceDate: formatDateOnly(vehicle.nextServiceDate),
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  }
}
