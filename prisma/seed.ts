import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edutrack.com' },
    update: {},
    create: {
      email: 'admin@edutrack.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)
  console.log('📧 Email: admin@edutrack.com')
  console.log('🔑 Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })