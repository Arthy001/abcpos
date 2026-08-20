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
  await prisma.warranty.deleteMany();
  await prisma.variantAttribute.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.store.deleteMany();
  await prisma.customer.deleteMany();

  // 1. Create Brands
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

  // 2. Create Units
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

  // 3. Create Warranties matching Screenshot
  const warrantiesData = [
    { name: "Replacement Warranty", description: "Covers replacement of faulty items", duration: "2 Year", status: "ACTIVE" },
    { name: "On-Site Warranty", description: "Product repairs done at the customer's location", duration: "1 Year", status: "ACTIVE" },
    { name: "Accidental Protection Plan", description: "Coverage for accidental damage", duration: "6 Months", status: "ACTIVE" },
    { name: "Labor-Only Warranty", description: "Covers only labor costs, not parts", duration: "6 Months", status: "ACTIVE" },
    { name: "No-Cost Repairs", description: "No charge for repairs during warranty period", duration: "3 Months", status: "ACTIVE" },
    { name: "Accidental Damage", description: "Coverage for unexpected damage", duration: "6 Months", status: "ACTIVE" },
    { name: "Wear & Tear Warranty", description: "Covers specific product aging issues", duration: "1 Year", status: "ACTIVE" },
    { name: "Money-Back Guarantee", description: "Refund within a specified period", duration: "3 Months", status: "ACTIVE" },
    { name: "Water Damage Warranty", description: "Coverage for water-related issues", duration: "6 Months", status: "ACTIVE" },
    { name: "Power Surge Protection", description: "Covers damage from power surges", duration: "6 Months", status: "ACTIVE" },
  ];

  for (const w of warrantiesData) {
    await prisma.warranty.create({ data: w });
  }

  // 4. Create Variant Attributes matching Screenshot
  const variantsData = [
    { name: "Size", values: "XS, S, M, L, XL", status: "ACTIVE" },
    { name: "Color", values: "Red, Blue, Green", status: "ACTIVE" },
    { name: "Capacity", values: "Small, Medium, Large", status: "ACTIVE" },
    { name: "Material", values: "Cotton, Leather, Synthetic", status: "ACTIVE" },
    { name: "Weight", values: "Light, Heavy", status: "ACTIVE" },
    { name: "Style", values: "Casual, Formal, Sporty", status: "ACTIVE" },
    { name: "Pattern", values: "Solid, Striped, Printed", status: "ACTIVE" },
    { name: "Memory", values: "8 GB, 16 GB, 32 GB", status: "ACTIVE" },
    { name: "Storage", values: "128 GB, 256 GB, 512 GB, 1 TB", status: "ACTIVE" },
    { name: "Length", values: "Short, Regular, Long", status: "ACTIVE" },
  ];

  for (const v of variantsData) {
    await prisma.variantAttribute.create({ data: v });
  }

  // 5. Create Warehouses & Stores matching Low Stock Screenshot
  const warehousesData = [
    "Lavish Warehouse", "Quaint Warehouse", "Traditional Warehouse", "Cool Warehouse",
    "Overflow Warehouse", "Nova Storage Hub", "Retail Supply Hub", "EdgeWare Solutions",
    "North Zone Warehouse", "Fulfillment Hub"
  ];
  for (const wh of warehousesData) {
    await prisma.warehouse.create({ data: { name: wh, status: "ACTIVE" } });
  }

  const storesData = [
    "Electro Mart", "Quantum Gadgets", "Prime Bazaar", "Gadget World",
    "Volt Vault", "Elite Retail", "Prime Mart", "NeoTech Store",
    "Urban Mart", "Travel Mart"
  ];
  for (const st of storesData) {
    await prisma.store.create({ data: { name: st, status: "ACTIVE" } });
  }

  // 6. Create Categories
  const catComputers = await prisma.category.create({
    data: { name: "Computers", slug: "computers", description: "Laptops, Desktops and Accessories", status: "ACTIVE" },
  });

  const catElectronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", description: "Electronic devices and audio", status: "ACTIVE" },
  });

  const catShoe = await prisma.category.create({
    data: { name: "Shoe", slug: "shoe", description: "Sneakers and Formal shoes", status: "ACTIVE" },
  });

  const catBags = await prisma.category.create({
    data: { name: "Bags", slug: "bags", description: "Handbags, Travel backpacks", status: "ACTIVE" },
  });

  const catPhone = await prisma.category.create({
    data: { name: "Phone", slug: "phone", description: "Smartphones and tablets", status: "ACTIVE" },
  });

  const catFurniture = await prisma.category.create({
    data: { name: "Furniture", slug: "furniture", description: "Home and office furniture", status: "ACTIVE" },
  });

  // 7. Create Sub Categories
  const subCategories = [
    { name: "Laptop", slug: "laptop", categoryId: catComputers.id, code: "CT001", description: "Efficient Productivity", status: "ACTIVE" },
    { name: "Desktop", slug: "desktop", categoryId: catComputers.id, code: "CT002", description: "Compact Design", status: "ACTIVE" },
    { name: "Sneakers", slug: "sneakers", categoryId: catShoe.id, code: "CT003", description: "Dynamic Grip", status: "ACTIVE" },
  ];

  for (const sub of subCategories) {
    await prisma.subCategory.create({ data: sub });
  }

  // 8. Create Customers
  await prisma.customer.create({
    data: { name: "Walk-in Customer", phone: "080-000-0000", email: "walkin@example.com" },
  });

  // 9. Create Products
  const sampleProducts = [
    {
      name: "Lenovo IdeaPad 3",
      sku: "PT001",
      barcode: "HG3FK",
      price: 600,
      costPrice: 450,
      stock: 20,
      minStockAlert: 15,
      categoryId: catComputers.id,
      image: "/assets/images/product-01.jpg",
      manufacturedDate: new Date("2024-12-24"),
      expiredDate: new Date("2026-12-20"),
      status: "ACTIVE",
    },
    {
      name: "Beats Pro",
      sku: "PT002",
      barcode: "TEJIU7",
      price: 160,
      costPrice: 100,
      stock: 25,
      minStockAlert: 20,
      categoryId: catElectronics.id,
      image: "/assets/images/product-03.jpg",
      manufacturedDate: new Date("2024-12-10"),
      expiredDate: new Date("2026-12-07"),
      status: "ACTIVE",
    },
    {
      name: "Nike Jordan",
      sku: "PT003",
      barcode: "32RRR554",
      price: 110,
      costPrice: 70,
      stock: 40,
      minStockAlert: 35,
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

  console.log("Seeding finished successfully with all modules!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
