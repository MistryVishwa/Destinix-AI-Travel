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

// Bootstrap admin allowlist (kept in sync with server.ts). Existing accounts matching
// these emails get promoted to the DB-backed admin role; this does not create new
// user accounts, it only flips the flag on users that have already registered.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@destinix.com,admin@travel.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

  if (ADMIN_EMAILS.length > 0) {
    const { count } = await prisma.user.updateMany({
      where: { email: { in: ADMIN_EMAILS } },
      data: { isAdmin: true },
    });
    console.log(`Promoted ${count} existing user(s) to admin: ${ADMIN_EMAILS.join(", ")}`);
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
