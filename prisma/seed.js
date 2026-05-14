import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { initialCompanies } from '../src/data/companies.js'

const prisma = new PrismaClient()

async function main() {
  const demoPasswordHash = await bcrypt.hash('demo123', 10)

  await prisma.session.deleteMany()

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
