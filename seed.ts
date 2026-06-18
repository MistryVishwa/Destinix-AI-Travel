import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { MOCK_PACKAGES } from './constants';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Start seeding...`);
  for (const pkg of MOCK_PACKAGES) {
    const travelPkg = await prisma.travelPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        destination: pkg.destination,
        price: pkg.price,
        currency: pkg.currency,
        duration: pkg.duration,
        image: pkg.image,
        type: pkg.type,
        description: pkg.description,
      },
    });
    console.log(`Created package with id: ${travelPkg.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
