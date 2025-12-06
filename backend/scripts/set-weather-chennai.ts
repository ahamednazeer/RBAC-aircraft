import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating System Settings for Weather Location...');

  // Set Location to Chennai
  await prisma.systemSettings.upsert({
    where: { key: 'baseLocation' },
    update: { value: 'Chennai' },
    create: {
      key: 'baseLocation',
      value: 'Chennai',
      category: 'general',
    },
  });

  // Optional: Set Lat/Lon if supported in future
  // await prisma.systemSettings.upsert({
  //   where: { key: 'baseLat' },
  //   update: { value: '13.0827' },
  //   create: { key: 'baseLat', value: '13.0827', category: 'general' },
  // });
  // await prisma.systemSettings.upsert({
  //   where: { key: 'baseLon' },
  //   update: { value: '80.2707' },
  //   create: { key: 'baseLon', value: '80.2707', category: 'general' },
  // });

  console.log('✅ Weather location updated to Chennai (13.0827, 80.2707)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
