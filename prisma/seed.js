import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { initialCompanies } from '../src/data/companies.js'
import { customers as customerTemplates } from '../src/data/customers.js'
import { vehicles as vehicleTemplates } from '../src/data/vehicles.js'

const prisma = new PrismaClient()
const RIYADH_CENTER = {
  lat: 24.7136,
  lng: 46.6753,
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildDriverSeed(company, index) {
  const template = vehicleTemplates[index % vehicleTemplates.length]
  const cityCode = company.city.slice(0, 3).toLowerCase()
  const suffix = index < vehicleTemplates.length ? '' : ` ${index + 1}`
  const baseName = template.driver || `Driver ${index + 1}`
  const name = `${baseName}${suffix}`
  const safeSlug = slugify(name) || `driver-${index + 1}`

  return {
    id: `drv_${company.id}_${String(index + 1).padStart(3, '0')}`,
    companyId: company.id,
    name,
    phone: `+966 50 ${String(1100000 + index).padStart(7, '0')}`,
    email: `${safeSlug}.${cityCode}.${index + 1}@example.com`,
    licenseNumber: `DL-${company.id.toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
    status: index % 9 === 0 ? 'off_duty' : 'active',
  }
}

function buildVehicleSeed(company, index, driverId) {
  const template = vehicleTemplates[index % vehicleTemplates.length]
  const cityCode = company.city.slice(0, 3).toUpperCase() || 'FLT'
  const row = Math.floor(index / 6)
  const column = index % 6
  const lat = template.lat + row * 0.012 + column * 0.003
  const lng = template.lng + row * 0.01 - column * 0.0025
  const plate =
    company.id === 'co_1' && index < vehicleTemplates.length
      ? template.plate
      : `${cityCode} ${String(1000 + index).padStart(4, '0')}`
  const modelName = template.name.split(' - ')[0]
  const name =
    company.id === 'co_1' && index < vehicleTemplates.length
      ? template.name
      : `${modelName} - ${plate}`

  return {
    id: `veh_${company.id}_${String(index + 1).padStart(3, '0')}`,
    companyId: company.id,
    driverId,
    name,
    plate,
    icon: template.icon || '🚗',
    photo: template.photo || null,
    color: template.color || null,
    year: template.year || 2022 + (index % 3),
    fuelType: template.fuelType || (index % 8 === 0 ? 'electric' : 'petrol'),
    lat: Number.isFinite(lat) ? lat : RIYADH_CENTER.lat,
    lng: Number.isFinite(lng) ? lng : RIYADH_CENTER.lng,
    speed: template.speed,
    engineOn: template.engineOn,
    mileage: template.mileage + index * 280,
    zoneScope: template.zoneScope || 'city',
    speedLimit: template.speedLimit || 120,
    lastOilChangeKm: template.lastOilChangeKm,
    nextOilChangeKm: template.nextOilChangeKm + index * 250,
    nextServiceDate: new Date(template.nextServiceDate),
  }
}

function buildCustomerSeed(company, index) {
  const template = customerTemplates[index % customerTemplates.length]
  const suffix = index < customerTemplates.length ? '' : ` ${index + 1}`
  const name = `${template.name}${suffix}`
  const safeSlug = slugify(name) || `customer-${index + 1}`

  return {
    id: `cus_${company.id}_${String(index + 1).padStart(3, '0')}`,
    companyId: company.id,
    name,
    phone: `+966 55 ${String(2200000 + index).padStart(7, '0')}`,
    nationalId: `${String(1050000000 + index).padStart(10, '0')}`,
    email: `${safeSlug}.${company.id}@example.com`,
    joinedDate: new Date(template.joinedDate),
  }
}

async function main() {
  const demoPasswordHash = await bcrypt.hash('demo123', 10)

  await prisma.session.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.driver.deleteMany()

  for (const company of initialCompanies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {
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
        templateId: company.templateId,
        devicePackageId: company.devicePackageId,
        trackingDeviceUnitPrice: company.trackingDeviceUnitPrice,
        dashcamUnitPrice: company.dashcamUnitPrice,
        yearlySubscriptionUnitPrice: company.yearlySubscriptionUnitPrice,
        enabledFeatures: company.enabledFeatures,
        createdAt: new Date(company.createdAt),
        lastActiveAt: new Date(company.lastActiveAt),
      },
      create: {
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
        templateId: company.templateId,
        devicePackageId: company.devicePackageId,
        trackingDeviceUnitPrice: company.trackingDeviceUnitPrice,
        dashcamUnitPrice: company.dashcamUnitPrice,
        yearlySubscriptionUnitPrice: company.yearlySubscriptionUnitPrice,
        enabledFeatures: company.enabledFeatures,
        createdAt: new Date(company.createdAt),
        lastActiveAt: new Date(company.lastActiveAt),
      },
    })

    await prisma.user.upsert({
      where: { email: company.email.toLowerCase() },
      update: {
        id: `acct_${company.id}`,
        name: company.contact,
        passwordHash: demoPasswordHash,
        role: 'admin',
        phone: company.phone,
        companyId: company.id,
      },
      create: {
        id: `acct_${company.id}`,
        name: company.contact,
        email: company.email.toLowerCase(),
        passwordHash: demoPasswordHash,
        role: 'admin',
        phone: company.phone,
        companyId: company.id,
      },
    })

    const driverCount = Math.max(company.vehicleCount, 1)
    const customerCount = Math.max(customerTemplates.length, Math.ceil(company.vehicleCount / 3))

    for (let index = 0; index < driverCount; index += 1) {
      const driver = buildDriverSeed(company, index)

      await prisma.driver.upsert({
        where: { id: driver.id },
        update: {
          companyId: driver.companyId,
          name: driver.name,
          phone: driver.phone,
          email: driver.email,
          licenseNumber: driver.licenseNumber,
          status: driver.status,
        },
        create: driver,
      })
    }

    for (let index = 0; index < customerCount; index += 1) {
      const customer = buildCustomerSeed(company, index)

      await prisma.customer.upsert({
        where: { id: customer.id },
        update: {
          companyId: customer.companyId,
          name: customer.name,
          phone: customer.phone,
          nationalId: customer.nationalId,
          email: customer.email,
          joinedDate: customer.joinedDate,
        },
        create: customer,
      })
    }

    for (let index = 0; index < company.vehicleCount; index += 1) {
      const driverId = `drv_${company.id}_${String(index + 1).padStart(3, '0')}`
      const vehicle = buildVehicleSeed(company, index, driverId)

      await prisma.vehicle.upsert({
        where: { id: vehicle.id },
        update: {
          companyId: vehicle.companyId,
          driverId: vehicle.driverId,
          name: vehicle.name,
          plate: vehicle.plate,
          icon: vehicle.icon,
          photo: vehicle.photo,
          color: vehicle.color,
          year: vehicle.year,
          fuelType: vehicle.fuelType,
          lat: vehicle.lat,
          lng: vehicle.lng,
          speed: vehicle.speed,
          engineOn: vehicle.engineOn,
          mileage: vehicle.mileage,
          zoneScope: vehicle.zoneScope,
          speedLimit: vehicle.speedLimit,
          lastOilChangeKm: vehicle.lastOilChangeKm,
          nextOilChangeKm: vehicle.nextOilChangeKm,
          nextServiceDate: vehicle.nextServiceDate,
        },
        create: vehicle,
      })
    }
  }

  await prisma.user.upsert({
    where: { email: 'master@platform.com' },
    update: {
      id: 'acct_master',
      name: 'Platform Admin',
      passwordHash: demoPasswordHash,
      role: 'master',
      phone: '+966 50 000 0000',
    },
    create: {
      id: 'acct_master',
      name: 'Platform Admin',
      email: 'master@platform.com',
      passwordHash: demoPasswordHash,
      role: 'master',
      phone: '+966 50 000 0000',
    },
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
