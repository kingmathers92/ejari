import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  const host1 = await prisma.user.upsert({
    where: { phone: "+21698000001" },
    update: {},
    create: { phone: "+21698000001", fullName: "Ahmed Ben Ali", email: "ahmed@example.com", role: "HOST", idVerified: true },
  });

  const host2 = await prisma.user.upsert({
    where: { phone: "+21698000002" },
    update: {},
    create: { phone: "+21698000002", fullName: "Fatma Trabelsi", email: "fatma@example.com", role: "HOST", idVerified: true },
  });

  await prisma.user.upsert({
    where: { phone: "+21698000003" },
    update: {},
    create: { phone: "+21698000003", fullName: "Khaled Mansour", role: "GUEST" },
  });

  console.log("✅ 3 users created");

  const props = [
    { hostId: host1.id, title: "Appartement moderne au Lac 2", description: "Bel appartement meublé au Lac 2. WiFi, parking inclus.", city: "Tunis", address: "Les Berges du Lac 2", lat: 36.8464, lng: 10.2295, maxGuests: 4, bedrooms: 2, bathrooms: 1, pricePerNight: 195, photos: [{ url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: true, order: 0 }, { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: false, order: 1 }] },
    { hostId: host1.id, title: "Villa avec piscine à Gammarth", description: "Villa avec piscine privée, 4 chambres, terrasse panoramique.", city: "Tunis", address: "Gammarth Supérieur", lat: 36.9177, lng: 10.2864, maxGuests: 8, bedrooms: 4, bathrooms: 3, pricePerNight: 450, photos: [{ url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", isCover: true, order: 0 }, { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", isCover: false, order: 1 }] },
    { hostId: host2.id, title: "Studio cosy Centre-Ville Tunis", description: "Studio moderne au cœur de Tunis. Idéal 1-2 personnes.", city: "Tunis", address: "Avenue Habib Bourguiba", lat: 36.8189, lng: 10.1658, maxGuests: 2, bedrooms: 1, bathrooms: 1, pricePerNight: 120, photos: [{ url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", isCover: true, order: 0 }] },
    { hostId: host2.id, title: "Appartement vue mer à Hammamet", description: "Vue mer directe, accès plage privée, piscine commune.", city: "Hammamet", address: "Zone Touristique Nord", lat: 36.4, lng: 10.6167, maxGuests: 6, bedrooms: 3, bathrooms: 2, pricePerNight: 280, photos: [{ url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", isCover: true, order: 0 }, { url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", isCover: false, order: 1 }] },
    { hostId: host1.id, title: "Riad traditionnel Sidi Bou Said", description: "Authentique riad, patio avec fontaine, vue mer.", city: "Sidi Bou Said", address: "Rue Habib Thameur", lat: 36.8706, lng: 10.3417, maxGuests: 4, bedrooms: 2, bathrooms: 2, pricePerNight: 320, photos: [{ url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", isCover: true, order: 0 }] },
    { hostId: host2.id, title: "Appartement haut standing à Sousse", description: "Vue mer, piscine commune, Port El Kantaoui.", city: "Sousse", address: "Port El Kantaoui", lat: 35.8973, lng: 10.594, maxGuests: 5, bedrooms: 3, bathrooms: 2, pricePerNight: 240, photos: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", isCover: true, order: 0 }, { url: "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80", isCover: false, order: 1 }] },
  ];

  for (const { photos, ...data } of props) {
    const p = await prisma.property.create({ data: { ...data, photos: { create: photos } } });
    console.log(`✅ ${p.title}`);
  }

  console.log("\n✨ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());