import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Criar ou encontrar Company padrão
  let company = await prisma.company.findFirst({
    where: { name: 'Harmony House Construction' },
  });

  if (!company) {
    console.log('📦 Creating default company...');
    company = await prisma.company.create({
      data: {
        name: 'Harmony House Construction',
        plan: 'STARTER',
        subscriptionStatus: 'ACTIVE',
      },
    });
    console.log('✅ Company created:', company.id);
  } else {
    console.log('✅ Company already exists:', company.id);
  }

  // Criar usuários admin se não existirem
  const adminEmails = [
    { email: 'caio@dev.com', name: 'Caio' },
    { email: 'olivia@harmonyhouse.com', name: 'Olivia' },
  ];

  for (const adminData of adminEmails) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminData.email}`);
      continue;
    }

    console.log(`👤 Creating admin user: ${adminData.email}...`);
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    console.log(`✅ Admin user created successfully: ${adminData.email}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: 123456`);
    console.log(`👑 Role: ADMIN`);
    console.log(`🏢 Company: ${company.name}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
