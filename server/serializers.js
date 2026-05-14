import { calculateDeviceBilling } from '../src/data/companies.js'

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
