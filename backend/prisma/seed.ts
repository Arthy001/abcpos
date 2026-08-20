import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean old records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.customer.deleteMany();

  // 1. Create Brands matching screenshot
  const brandsData = [
    { name: "Lenovo", slug: "lenovo", status: "ACTIVE" },
    { name: "Beats", slug: "beats", status: "ACTIVE" },
    { name: "Nike", slug: "nike", status: "ACTIVE" },
    { name: "Apple", slug: "apple", status: "ACTIVE" },
    { name: "Amazon", slug: "amazon", status: "ACTIVE" },
    { name: "Woodmart", slug: "woodmart", status: "ACTIVE" },
    { name: "Dior", slug: "dior", status: "ACTIVE" },
    { name: "Lava", slug: "lava", status: "ACTIVE" },
    { name: "Nilkamal", slug: "nilkamal", status: "ACTIVE" },
    { name: "The North Face", slug: "the-north-face", status: "ACTIVE" },
  ];

  for (const b of brandsData) {
    await prisma.brand.create({ data: b });
  }

  // 2. Create Units matching screenshot
  const unitsData = [
    { name: "Kilograms", shortName: "kg", status: "ACTIVE" },
    { name: "Liters", shortName: "L", status: "ACTIVE" },
    { name: "Dozen", shortName: "dz", status: "ACTIVE" },
    { name: "Pieces", shortName: "pcs", status: "ACTIVE" },
    { name: "Boxes", shortName: "bx", status: "ACTIVE" },
    { name: "Tons", shortName: "t", status: "ACTIVE" },
    { name: "Grams", shortName: "g", status: "ACTIVE" },
    { name: "Meters", shortName: "m", status: "ACTIVE" },
    { name: "Centimeters", shortName: "cm", status: "ACTIVE" },
  ];

  for (const u of unitsData) {
    await prisma.unit.create({ data: u });
  }

  // 3. Create Categories matching screenshots
  const catComputers = await prisma.category.create({
    data: { name: "Computers", slug: "computers", description: "Laptops, Desktops and Accessories", status: "ACTIVE" },
  });

  const catElectronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", description: "Electronic devices and audio", status: "ACTIVE" },
  });

  const catShoe = await prisma.category.create({
    data: { name: "Shoe", slug: "shoe", description: "Sneakers and Formal shoes", status: "ACTIVE" },
  });

  const catCosmetics = await prisma.category.create({
    data: { name: "Cosmetics", slug: "cosmetics", description: "Beauty and cosmetics", status: "ACTIVE" },
  });

  const catGroceries = await prisma.category.create({
    data: { name: "Groceries", slug: "groceries", description: "Fresh food and daily essentials", status: "ACTIVE" },
  });

  const catFurniture = await prisma.category.create({
    data: { name: "Furniture", slug: "furniture", description: "Home and office furniture", status: "ACTIVE" },
  });

  const catBags = await prisma.category.create({
    data: { name: "Bags", slug: "bags", description: "Handbags, Travel backpacks", status: "ACTIVE" },
  });

  const catPhone = await prisma.category.create({
    data: { name: "Phone", slug: "phone", description: "Smartphones and tablets", status: "ACTIVE" },
  });

  const catAppliances = await prisma.category.create({
    data: { name: "Appliances", slug: "appliances", description: "Home appliances", status: "ACTIVE" },
  });

  const catClothing = await prisma.category.create({
    data: { name: "Clothing", slug: "clothing", description: "Apparel and garments", status: "ACTIVE" },
  });

  // 4. Create Sub Categories matching Screenshot 2
  const subCategories = [
    { name: "Laptop", slug: "laptop", categoryId: catComputers.id, code: "CT001", description: "Efficient Productivity", status: "ACTIVE" },
    { name: "Desktop", slug: "desktop", categoryId: catComputers.id, code: "CT002", description: "Compact Design", status: "ACTIVE" },
    { name: "Sneakers", slug: "sneakers", categoryId: catShoe.id, code: "CT003", description: "Dynamic Grip", status: "ACTIVE" },
    { name: "Formals", slug: "formals", categoryId: catShoe.id, code: "CT004", description: "Stylish Comfort", status: "ACTIVE" },
    { name: "Wearables", slug: "wearables", categoryId: catElectronics.id, code: "CT005", description: "Seamless Connectivity", status: "ACTIVE" },
    { name: "Speakers", slug: "speakers", categoryId: catElectronics.id, code: "CT006", description: "Reliable Sound", status: "ACTIVE" },
    { name: "Handbags", slug: "handbags", categoryId: catBags.id, code: "CT007", description: "Compact Carry", status: "ACTIVE" },
    { name: "Travel", slug: "travel", categoryId: catBags.id, code: "CT008", description: "Travel Ready", status: "ACTIVE" },
    { name: "Sofa", slug: "sofa", categoryId: catFurniture.id, code: "CT009", description: "Cozy Comfort", status: "ACTIVE" },
    { name: "Chair", slug: "chair", categoryId: catFurniture.id, code: "CT0010", description: "Stylish Comfort", status: "ACTIVE" },
  ];

  for (const sub of subCategories) {
    await prisma.subCategory.create({ data: sub });
  }

  // 5. Create Customers
  await prisma.customer.create({
    data: { name: "Walk-in Customer", phone: "080-000-0000", email: "walkin@example.com" },
  });

  await prisma.customer.create({
    data: { name: "Somchai Prasert", phone: "089-123-4567", email: "somchai@gmail.com", points: 120 },
  });

  // 6. Create Sample Products with Manufacturing and Expiry dates
  const sampleProducts = [
    {
      name: "Lenovo 3rd Generation",
      sku: "PT001",
      barcode: "885123450001",
      price: 600,
      costPrice: 450,
      stock: 100,
      minStockAlert: 10,
      categoryId: catComputers.id,
      image: "/assets/images/product-01.jpg",
      manufacturedDate: new Date("2024-12-24"),
      expiredDate: new Date("2026-12-20"),
      status: "ACTIVE",
    },
    {
      name: "Beats Pro",
      sku: "PT002",
      barcode: "885123450002",
      price: 160,
      costPrice: 100,
      stock: 140,
      minStockAlert: 15,
      categoryId: catElectronics.id,
      image: "/assets/images/product-03.jpg",
      manufacturedDate: new Date("2024-12-10"),
      expiredDate: new Date("2026-12-07"),
      status: "ACTIVE",
    },
    {
      name: "Nike Jordan",
      sku: "PT003",
      barcode: "885123450003",
      price: 110,
      costPrice: 70,
      stock: 300,
      minStockAlert: 20,
      categoryId: catShoe.id,
      image: "/assets/images/product-04.jpg",
      manufacturedDate: new Date("2024-11-27"),
      expiredDate: new Date("2026-11-20"),
      status: "ACTIVE",
    },
  ];

  for (const item of sampleProducts) {
    await prisma.product.create({ data: item });
  }

  console.log("Seeding finished successfully with Brands, Units, Categories, SubCategories, and Products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
