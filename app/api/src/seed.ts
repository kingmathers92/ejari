import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const host1 = await prisma.user.upsert({
    where: { phone: "+21698000001" },
    update: {},
    create: {
      phone: "+21698000001",
      fullName: "Ahmed Ben Ali",
      email: "ahmed.benali@example.com",
      role: "HOST",
      idVerified: true,
    },
  });

  const host2 = await prisma.user.upsert({
    where: { phone: "+21698000002" },
    update: {},
    create: {
      phone: "+21698000002",
      fullName: "Fatma Trabelsi",
      email: "fatma.trabelsi@example.com",
      role: "HOST",
      idVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { phone: "+21698000003" },
    update: {},
    create: {
      phone: "+21698000003",
      fullName: "Khaled Mansour",
      role: "GUEST",
    },
  });

  console.log("✅ Created 3 users (2 hosts, 1 guest)");

  const propertiesData = [
    {
      hostId: host1.id,
      title: "Appartement moderne au Lac 2",
      description:
        "Bel appartement entièrement meublé dans le quartier prisé du Lac 2. Vue imprenable, proche de tous les commerces et restaurants. Idéal pour séjours professionnels ou touristiques. WiFi haut débit, parking inclus.",
      city: "Tunis",
      address: "Les Berges du Lac 2, Tunis",
      lat: 36.8464,
      lng: 10.2295,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      pricePerNight: 195,
      photos: [
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: false, order: 1 },
        { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", isCover: false, order: 2 },
      ],
    },
    {
      hostId: host1.id,
      title: "Villa avec piscine à Gammarth",
      description:
        "Magnifique villa avec piscine privée à Gammarth Supérieur. 4 chambres, grand salon, cuisine équipée, terrasse panoramique. À 5 min de la plage. Idéal pour vacances en famille ou entre amis.",
      city: "Tunis",
      address: "Gammarth Supérieur, La Marsa",
      lat: 36.9177,
      lng: 10.2864,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      pricePerNight: 450,
      photos: [
        { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", isCover: false, order: 1 },
        { url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80", isCover: false, order: 2 },
      ],
    },
    {
      hostId: host2.id,
      title: "Studio cosy Centre-Ville Tunis",
      description:
        "Studio moderne et confortable au cœur de Tunis. Parfaitement situé pour découvrir la médina, les souks et les musées. Tout le nécessaire est fourni. Idéal pour 1-2 personnes.",
      city: "Tunis",
      address: "Avenue Habib Bourguiba, Tunis",
      lat: 36.8189,
      lng: 10.1658,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 120,
      photos: [
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80", isCover: false, order: 1 },
      ],
    },
    {
      hostId: host2.id,
      title: "Appartement vue mer à Hammamet",
      description:
        "Superbe appartement avec vue mer directe. 3 chambres, balcon privatif face à la plage. Accès direct à la plage privée. Piscine commune, parking sécurisé. Idéal pour les vacances.",
      city: "Hammamet",
      address: "Zone Touristique Nord, Hammamet",
      lat: 36.4,
      lng: 10.6167,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      pricePerNight: 280,
      photos: [
        { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", isCover: false, order: 1 },
        { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80", isCover: false, order: 2 },
      ],
    },
    {
      hostId: host1.id,
      title: "Riad traditionnel Sidi Bou Said",
      description:
        "Authentique riad dans le village blanc et bleu de Sidi Bou Said. Architecture traditionnelle, patio avec fontaine, vue mer et golfe de Tunis. Une expérience unique entre modernité et tradition.",
      city: "Sidi Bou Said",
      address: "Rue Habib Thameur, Sidi Bou Said",
      lat: 36.8706,
      lng: 10.3417,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 320,
      photos: [
        { url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80", isCover: false, order: 1 },
      ],
    },
    {
      hostId: host2.id,
      title: "Appartement haut standing à Sousse",
      description:
        "Appartement luxueux dans la marina de Port El Kantaoui. Vue mer, piscine commune, accès direct à la plage. À 10 min du centre historique de Sousse. Tout le confort moderne.",
      city: "Sousse",
      address: "Port El Kantaoui, Sousse",
      lat: 35.8973,
      lng: 10.594,
      maxGuests: 5,
      bedrooms: 3,
      bathrooms: 2,
      pricePerNight: 240,
      photos: [
        { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", isCover: true,  order: 0 },
        { url: "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80", isCover: false, order: 1 },
      ],
    },
  ];

  for (const { photos, ...propertyData } of propertiesData) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        photos: { create: photos },
      },
    });
    console.log(`✅ ${property.title}`);
  }

  console.log("\n✨ Seed complete!");
  console.log("\nTest credentials:");
  console.log("  Host 1: phone +21698000001, OTP prints to terminal");
  console.log("  Host 2: phone +21698000002, OTP prints to terminal");
  console.log("  Guest:  phone +21698000003, OTP prints to terminal");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());