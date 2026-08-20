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
  await prisma.customer.deleteMany();

  // Create Categories matching screenshots
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

  // Create Sub Categories matching Screenshot 2
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

  // Create Customers
  const customerWalkin = await prisma.customer.create({
    data: { name: "Walk-in Customer", phone: "080-000-0000", email: "walkin@example.com" },
  });

  const customerSomchai = await prisma.customer.create({
    data: { name: "Somchai Prasert", phone: "089-123-4567", email: "somchai@gmail.com", points: 120 },
  });

  // Create Sample Products
  const sampleProducts = [
    {
      name: "Apple MacBook Pro 14 M3",
      sku: "PROD-001",
      barcode: "885123450001",
      price: 59900,
      costPrice: 52000,
      stock: 12,
      minStockAlert: 3,
      categoryId: catComputers.id,
      image: "/assets/products/product-01.jpg",
      status: "ACTIVE",
    },
    {
      name: "Logitech MX Master 3S Wireless Mouse",
      sku: "PROD-002",
      barcode: "885123450002",
      price: 3590,
      costPrice: 2800,
      stock: 45,
      minStockAlert: 5,
      categoryId: catComputers.id,
      image: "/assets/products/product-02.jpg",
      status: "ACTIVE",
    },
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      sku: "PROD-003",
      barcode: "885123450004",
      price: 13990,
      costPrice: 11000,
      stock: 8,
      minStockAlert: 2,
      categoryId: catElectronics.id,
      image: "/assets/products/product-04.jpg",
      status: "ACTIVE",
    },
  ];

  for (const item of sampleProducts) {
    await prisma.product.create({ data: item });
  }

  console.log("Seeding finished successfully with Categories and SubCategories!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
