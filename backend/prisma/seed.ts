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
  await prisma.supplier.deleteMany();
  await prisma.biller.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.department.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.salesReportItem.deleteMany();
  await prisma.purchaseReportItem.deleteMany();
  await prisma.inventoryReportItem.deleteMany();
  await prisma.stockHistoryItem.deleteMany();
  await prisma.soldStockItem.deleteMany();
  await prisma.invoiceReportItem.deleteMany();
  await prisma.supplierReportItem.deleteMany();
  await prisma.supplierDueReportItem.deleteMany();
  await prisma.customerReportItem.deleteMany();
  await prisma.customerDueReportItem.deleteMany();
  await prisma.productReportItem.deleteMany();
  await prisma.productExpiryReportItem.deleteMany();
  await prisma.productQuantityAlertItem.deleteMany();
  await prisma.expenseReportItem.deleteMany();
  await prisma.incomeReportItem.deleteMany();
  await prisma.purchaseTaxReportItem.deleteMany();
  await prisma.salesTaxReportItem.deleteMany();
  await prisma.profitLossReportItem.deleteMany();
  await prisma.annualReportItem.deleteMany();
  await prisma.userProfileSettings.deleteMany();
  await prisma.userSecuritySettings.deleteMany();
  await prisma.userSessionLog.deleteMany();
  await prisma.userNotificationSettings.deleteMany();
  await prisma.connectedAppItem.deleteMany();

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

  // 5. Create Warehouses matching Screenshot
  const warehousesData = [
    { name: "Lavish Warehouse", contactPerson: "Chad Taylor", contactAvatar: "/assets/images/customer11.jpg", phone: "+12498345785", totalProducts: 10, stock: 600, qty: 80, createdAt: new Date("2024-12-24"), status: "ACTIVE" },
    { name: "Quaint Warehouse", contactPerson: "Jenny Ellis", contactAvatar: "/assets/images/customer12.jpg", phone: "+13178964582", totalProducts: 15, stock: 300, qty: 85, createdAt: new Date("2024-12-10"), status: "ACTIVE" },
    { name: "Traditional Warehouse", contactPerson: "Leon Baxter", contactAvatar: "/assets/images/customer13.jpg", phone: "+12796183487", totalProducts: 12, stock: 400, qty: 70, createdAt: new Date("2024-11-27"), status: "ACTIVE" },
    { name: "Cool Warehouse", contactPerson: "Karen Flores", contactAvatar: "/assets/images/customer14.jpg", phone: "+17538647943", totalProducts: 20, stock: 320, qty: 65, createdAt: new Date("2024-11-18"), status: "ACTIVE" },
    { name: "Overflow Warehouse", contactPerson: "Michael Dawson", contactAvatar: "/assets/images/customer15.jpg", phone: "+13798132475", totalProducts: 8, stock: 170, qty: 80, createdAt: new Date("2024-11-06"), status: "ACTIVE" },
    { name: "Nova Storage Hub", contactPerson: "Karen Galvan", contactAvatar: "/assets/images/customer16.jpg", phone: "+17596341894", totalProducts: 13, stock: 220, qty: 75, createdAt: new Date("2024-10-25"), status: "ACTIVE" },
    { name: "Retail Supply Hub", contactPerson: "Thomas Ward", contactAvatar: "/assets/images/customer17.jpg", phone: "+12973548678", totalProducts: 17, stock: 310, qty: 60, createdAt: new Date("2024-10-14"), status: "ACTIVE" },
    { name: "EdgeWare Solutions", contactPerson: "Aliza Duncan", contactAvatar: "/assets/images/customer18.jpg", phone: "+13147858357", totalProducts: 22, stock: 450, qty: 50, createdAt: new Date("2024-10-03"), status: "ACTIVE" },
    { name: "North Zone Warehouse", contactPerson: "James Higham", contactAvatar: "/assets/images/avatar-01.jpg", phone: "+11978348626", totalProducts: 24, stock: 270, qty: 70, createdAt: new Date("2024-09-20"), status: "ACTIVE" },
    { name: "Fulfillment Hub", contactPerson: "Jada Robinson", contactAvatar: "/assets/images/avatar-02.jpg", phone: "+12678934561", totalProducts: 14, stock: 300, qty: 45, createdAt: new Date("2024-09-10"), status: "ACTIVE" },
  ];
  for (const wh of warehousesData) {
    await prisma.warehouse.create({ data: wh });
  }

  // 5.1 Create Stores matching Screenshot
  const storesData = [
    { name: "Electro Mart", userName: "johnsmith", email: "electromart@example.com", phone: "+12498345785", status: "ACTIVE" },
    { name: "Quantum Gadgets", userName: "janedoe", email: "quantum@example.com", phone: "+13178964582", status: "ACTIVE" },
    { name: "Prime Bazaar", userName: "sarahlee", email: "primebazaar@example.com", phone: "+12796183487", status: "ACTIVE" },
    { name: "Gadget World", userName: "alexbrown", email: "gadgetworld@example.com", phone: "+17538647943", status: "ACTIVE" },
    { name: "Volt Vault", userName: "jesswhite", email: "voltvault@example.com", phone: "+13798132475", status: "ACTIVE" },
    { name: "Elite Retail", userName: "emilydavis", email: "eliteretail@example.com", phone: "+17596341894", status: "ACTIVE" },
    { name: "Prime Mart", userName: "tomharris", email: "primemart@example.com", phone: "+12973548678", status: "ACTIVE" },
    { name: "NeoTech Store", userName: "sarahjohnson", email: "neotech@example.com", phone: "+13147858357", status: "ACTIVE" },
    { name: "Urban Mart", userName: "laurawilson", email: "urbanmart@example.com", phone: "+11978348626", status: "ACTIVE" },
    { name: "Travel Mart", userName: "robertwhite", email: "travelmart@example.com", phone: "+12678934561", status: "ACTIVE" },
  ];
  for (const st of storesData) {
    await prisma.store.create({ data: st });
  }

  // 5.2 Create Suppliers matching Screenshot
  const suppliersData = [
    { code: "SU001", name: "Apex Computers", image: "/assets/images/product-01.jpg", email: "apexcomputers@example.com", phone: "+15964712634", country: "Germany", status: "ACTIVE" },
    { code: "SU002", name: "Beats Headphones", image: "/assets/images/product-03.jpg", email: "beatsheadphone@example.com", phone: "+16372895190", country: "Japan", status: "ACTIVE" },
    { code: "SU003", name: "Dazzle Shoes", image: "/assets/images/product-04.jpg", email: "dazzleshoes@example.com", phone: "+17589201739", country: "USA", status: "ACTIVE" },
    { code: "SU004", name: "Best Accessories", image: "/assets/images/product-05.jpg", email: "bestaccessories@example.com", phone: "+18934092467", country: "Austria", status: "ACTIVE" },
    { code: "SU005", name: "A-Z Store", image: "/assets/images/product-06.jpg", email: "a2zstore@example.com", phone: "+12568749035", country: "Turkey", status: "ACTIVE" },
    { code: "SU006", name: "Hatimi Hardwares", image: "/assets/images/product-07.jpg", email: "hatimihardware@example.com", phone: "+19054674627", country: "Mexico", status: "ACTIVE" },
    { code: "SU007", name: "Aesthetic Bags", image: "/assets/images/product-08.jpg", email: "aestheticbags@example.com", phone: "+18943670365", country: "France", status: "ACTIVE" },
    { code: "SU008", name: "Alpha Mobiles", image: "/assets/images/product-09.jpg", email: "alphamobiles@example.com", phone: "+16473894103", country: "Greece", status: "ACTIVE" },
    { code: "SU009", name: "Sigma Chairs", image: "/assets/images/product-10.jpg", email: "sigmachair@example.com", phone: "+17590274536", country: "Italy", status: "ACTIVE" },
    { code: "SU010", name: "Zenith Bags", image: "/assets/images/product-11.jpg", email: "zenithbags@example.com", phone: "+12564098473", country: "China", status: "ACTIVE" },
  ];
  for (const sup of suppliersData) {
    await prisma.supplier.create({ data: sup });
  }

  // 5.3 Create Billers matching Screenshot
  const billersData = [
    { code: "BI001", name: "Shaun Farley", avatar: "/assets/images/customer11.jpg", companyName: "GreenTech Industries", email: "shaun@example.com", phone: "+18647961254", country: "USA", status: "ACTIVE" },
    { code: "BI002", name: "Jenny Ellis", avatar: "/assets/images/customer12.jpg", companyName: "BlueSky Logistics", email: "jenny@example.com", phone: "+13197521863", country: "Germany", status: "ACTIVE" },
    { code: "BI003", name: "Leon Baxter", avatar: "/assets/images/customer13.jpg", companyName: "EcoFarm Organics", email: "leon@example.com", phone: "+18496275831", country: "Japan", status: "ACTIVE" },
    { code: "BI004", name: "Karen Flores", avatar: "/assets/images/customer14.jpg", companyName: "SmartTech Solutions", email: "karen@example.com", phone: "+18731498524", country: "Austria", status: "ACTIVE" },
    { code: "BI005", name: "Michael Dawson", avatar: "/assets/images/customer15.jpg", companyName: "Fresh Supplies", email: "michael@example.com", phone: "+12876928738", country: "Turkey", status: "ACTIVE" },
    { code: "BI006", name: "Karen Galvan", avatar: "/assets/images/customer16.jpg", companyName: "BrightSource Lighting", email: "karen@example.com", phone: "+17534896148", country: "Mexico", status: "ACTIVE" },
    { code: "BI007", name: "Thomas Ward", avatar: "/assets/images/customer17.jpg", companyName: "GlobalTech Industries", email: "thomas@example.com", phone: "+16482479624", country: "France", status: "ACTIVE" },
    { code: "BI008", name: "Aliza Duncan", avatar: "/assets/images/customer18.jpg", companyName: "HealthWell Pharma", email: "aliza@example.com", phone: "+13175964827", country: "Greece", status: "ACTIVE" },
    { code: "BI009", name: "James Higham", avatar: "/assets/images/avatar-01.jpg", companyName: "HomeStyle Furnishings", email: "james@example.com", phone: "+13875196482", country: "Italy", status: "ACTIVE" },
    { code: "BI010", name: "Jada Robinson", avatar: "/assets/images/avatar-02.jpg", companyName: "EcoLogistics Partners", email: "robinson@example.com", phone: "+17586143284", country: "China", status: "ACTIVE" },
  ];
  for (const bil of billersData) {
    await prisma.biller.create({ data: bil });
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

  // 8. Create Customers matching Screenshot
  const customersData = [
    { code: "CU001", name: "Carl Evans", email: "carlevans@example.com", phone: "+12163547758", country: "Germany", avatar: "/assets/images/customer11.jpg", status: "ACTIVE" },
    { code: "CU002", name: "Minerva Rameriz", email: "rameriz@example.com", phone: "+11367529510", country: "Japan", avatar: "/assets/images/customer12.jpg", status: "ACTIVE" },
    { code: "CU003", name: "Robert Lamon", email: "robert@example.com", phone: "+15362789414", country: "USA", avatar: "/assets/images/customer13.jpg", status: "ACTIVE" },
    { code: "CU004", name: "Patricia Lewis", email: "patricia@example.com", phone: "+18513094627", country: "Austria", avatar: "/assets/images/customer14.jpg", status: "ACTIVE" },
    { code: "CU005", name: "Mark Joslyn", email: "markjoslyn@example.com", phone: "+14678219025", country: "Turkey", avatar: "/assets/images/customer15.jpg", status: "ACTIVE" },
    { code: "CU006", name: "Marsha Betts", email: "marshabetts@example.com", phone: "+10913278319", country: "Mexico", avatar: "/assets/images/customer16.jpg", status: "ACTIVE" },
    { code: "CU007", name: "Daniel Jude", email: "daieljude@example.com", phone: "+19125852947", country: "France", avatar: "/assets/images/customer17.jpg", status: "ACTIVE" },
    { code: "CU008", name: "Emma Bates", email: "emmabates@example.com", phone: "+13671835209", country: "Greece", avatar: "/assets/images/customer18.jpg", status: "ACTIVE" },
    { code: "CU009", name: "Richard Fralick", email: "richard@example.com", phone: "+19756194733", country: "Italy", avatar: "/assets/images/avatar-01.jpg", status: "ACTIVE" },
    { code: "CU010", name: "Michelle Robison", email: "robinson@example.com", phone: "+19167850925", country: "China", avatar: "/assets/images/avatar-02.jpg", status: "ACTIVE" },
  ];

  for (const c of customersData) {
    await prisma.customer.create({ data: c });
  }

  // 9. Create Products (Rich Low Stock, Out of Stock, Expiry & Healthy Stock Seeds)
  const allBrands = await prisma.brand.findMany();
  const allUnits = await prisma.unit.findMany();
  const allWarehouses = await prisma.warehouse.findMany();
  const allStores = await prisma.store.findMany();

  const getBrandId = (name: string) => allBrands.find((b) => b.name.toLowerCase().includes(name.toLowerCase()))?.id;
  const getUnitId = (name: string) => allUnits.find((u) => u.name.toLowerCase().includes(name.toLowerCase()))?.id || allUnits[0]?.id;
  const getWhId = (index: number) => allWarehouses[index % allWarehouses.length]?.id;
  const getStoreId = (index: number) => allStores[index % allStores.length]?.id;

  const sampleProducts = [
    // --- LOW STOCK ITEMS (0 < Stock <= minStockAlert) ---
    {
      name: "Lenovo IdeaPad 3 Core i5",
      sku: "PT001",
      barcode: "885901234001",
      price: 600,
      costPrice: 450,
      stock: 4, // LOW STOCK
      minStockAlert: 15,
      categoryId: catComputers.id,
      brandId: getBrandId("Lenovo"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(0),
      storeId: getStoreId(0),
      image: "/assets/images/product-01.jpg",
      manufacturedDate: new Date("2025-01-10"),
      expiredDate: new Date("2027-01-10"),
      status: "ACTIVE",
    },
    {
      name: "Beats Pro Wireless Headphones",
      sku: "PT002",
      barcode: "885901234002",
      price: 160,
      costPrice: 100,
      stock: 2, // LOW STOCK
      minStockAlert: 20,
      categoryId: catElectronics.id,
      brandId: getBrandId("Beats"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(1),
      storeId: getStoreId(1),
      image: "/assets/images/product-03.jpg",
      manufacturedDate: new Date("2024-12-10"),
      expiredDate: new Date("2026-12-07"),
      status: "ACTIVE",
    },
    {
      name: "Amazon Echo Dot 5th Generation",
      sku: "PT005",
      barcode: "885901234005",
      price: 50,
      costPrice: 30,
      stock: 3, // LOW STOCK
      minStockAlert: 25,
      categoryId: catElectronics.id,
      brandId: getBrandId("Amazon"),
      unitId: getUnitId("Boxes"),
      warehouseId: getWhId(4),
      storeId: getStoreId(4),
      image: "/assets/images/product-06.jpg",
      manufacturedDate: new Date("2024-11-06"),
      expiredDate: new Date("2026-11-04"),
      status: "ACTIVE",
    },
    {
      name: "Sanford Ergonomic Chair Sofa",
      sku: "PT006",
      barcode: "885901234006",
      price: 290,
      costPrice: 180,
      stock: 1, // LOW STOCK
      minStockAlert: 8,
      categoryId: catFurniture.id,
      brandId: getBrandId("Woodmart"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(5),
      storeId: getStoreId(5),
      image: "/assets/images/product-07.jpg",
      manufacturedDate: new Date("2024-10-25"),
      expiredDate: new Date("2026-10-20"),
      status: "ACTIVE",
    },
    {
      name: "Iphone 14 Pro Max 256GB",
      sku: "PT008",
      barcode: "885901234008",
      price: 1100,
      costPrice: 850,
      stock: 2, // LOW STOCK
      minStockAlert: 10,
      categoryId: catPhone.id,
      brandId: getBrandId("Apple"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(7),
      storeId: getStoreId(7),
      image: "/assets/images/product-09.jpg",
      manufacturedDate: new Date("2024-10-03"),
      expiredDate: new Date("2026-10-01"),
      status: "ACTIVE",
    },

    // --- OUT OF STOCK ITEMS (Stock === 0) ---
    {
      name: "Nike Air Jordan 1 Retro",
      sku: "PT003",
      barcode: "885901234003",
      price: 150,
      costPrice: 90,
      stock: 0, // OUT OF STOCK
      minStockAlert: 35,
      categoryId: catShoe.id,
      brandId: getBrandId("Nike"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(2),
      storeId: getStoreId(2),
      image: "/assets/images/product-04.jpg",
      manufacturedDate: new Date("2024-11-27"),
      expiredDate: new Date("2026-11-20"),
      status: "OUT_OF_STOCK",
    },
    {
      name: "Apple Series 5 Smart Watch",
      sku: "PT004",
      barcode: "885901234004",
      price: 399,
      costPrice: 250,
      stock: 0, // OUT OF STOCK
      minStockAlert: 45,
      categoryId: catElectronics.id,
      brandId: getBrandId("Apple"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(3),
      storeId: getStoreId(3),
      image: "/assets/images/product-05.jpg",
      manufacturedDate: new Date("2024-11-18"),
      expiredDate: new Date("2026-11-15"),
      status: "OUT_OF_STOCK",
    },
    {
      name: "Nilkamal Pro Gaming Chair",
      sku: "PT009",
      barcode: "885901234009",
      price: 220,
      costPrice: 130,
      stock: 0, // OUT OF STOCK
      minStockAlert: 10,
      categoryId: catFurniture.id,
      brandId: getBrandId("Nilkamal"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(8),
      storeId: getStoreId(8),
      image: "/assets/images/product-10.jpg",
      manufacturedDate: new Date("2024-09-20"),
      expiredDate: new Date("2026-09-16"),
      status: "OUT_OF_STOCK",
    },
    {
      name: "Dior Red Premium Satchel Bag",
      sku: "PT007",
      barcode: "885901234007",
      price: 450,
      costPrice: 280,
      stock: 0, // OUT OF STOCK
      minStockAlert: 20,
      categoryId: catBags.id,
      brandId: getBrandId("Dior"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(6),
      storeId: getStoreId(6),
      image: "/assets/images/product-08.jpg",
      manufacturedDate: new Date("2024-10-14"),
      expiredDate: new Date("2026-10-10"),
      status: "OUT_OF_STOCK",
    },

    // --- EXPIRED & EXPIRING SOON PRODUCTS ---
    {
      name: "Lava Energy Booster Drink Pack",
      sku: "PT011",
      barcode: "885901234011",
      price: 25,
      costPrice: 12,
      stock: 18,
      minStockAlert: 10,
      categoryId: catElectronics.id,
      brandId: getBrandId("Lava"),
      unitId: getUnitId("Boxes"),
      warehouseId: getWhId(1),
      storeId: getStoreId(1),
      image: "/assets/images/product-01.jpg",
      manufacturedDate: new Date("2025-02-01"),
      expiredDate: new Date("2026-08-15"), // EXPIRED 15 days ago
      status: "ACTIVE",
    },
    {
      name: "Organic Coffee Roasted Beans 1kg",
      sku: "PT012",
      barcode: "885901234012",
      price: 35,
      costPrice: 18,
      stock: 12,
      minStockAlert: 8,
      categoryId: catBags.id,
      brandId: getBrandId("Amazon"),
      unitId: getUnitId("Kilograms"),
      warehouseId: getWhId(2),
      storeId: getStoreId(2),
      image: "/assets/images/product-03.jpg",
      manufacturedDate: new Date("2026-03-01"),
      expiredDate: new Date("2026-09-04"), // EXPIRES IN 5 DAYS
      status: "ACTIVE",
    },
    {
      name: "Protein Bar Crunch Dark Chocolate",
      sku: "PT013",
      barcode: "885901234013",
      price: 15,
      costPrice: 7,
      stock: 25,
      minStockAlert: 10,
      categoryId: catShoe.id,
      brandId: getBrandId("Nike"),
      unitId: getUnitId("Boxes"),
      warehouseId: getWhId(3),
      storeId: getStoreId(3),
      image: "/assets/images/product-04.jpg",
      manufacturedDate: new Date("2026-02-15"),
      expiredDate: new Date("2026-09-22"), // EXPIRES IN 23 DAYS
      status: "ACTIVE",
    },

    // --- HEALTHY STOCK ITEMS ---
    {
      name: "The North Face Borealis Backpack",
      sku: "PT010",
      barcode: "885901234010",
      price: 99,
      costPrice: 60,
      stock: 65, // HEALTHY STOCK
      minStockAlert: 15,
      categoryId: catBags.id,
      brandId: getBrandId("The North Face"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(9),
      storeId: getStoreId(9),
      image: "/assets/images/product-11.jpg",
      manufacturedDate: new Date("2024-09-10"),
      expiredDate: new Date("2027-09-06"),
      status: "ACTIVE",
    },
    {
      name: "Apple MacBook Air M2 13-inch",
      sku: "PT014",
      barcode: "885901234014",
      price: 1099,
      costPrice: 800,
      stock: 45, // HEALTHY STOCK
      minStockAlert: 10,
      categoryId: catComputers.id,
      brandId: getBrandId("Apple"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(0),
      storeId: getStoreId(0),
      image: "/assets/images/product-01.jpg",
      manufacturedDate: new Date("2025-04-01"),
      expiredDate: new Date("2028-04-01"),
      status: "ACTIVE",
    },
    {
      name: "Beats Studio Wireless Over-Ear",
      sku: "PT015",
      barcode: "885901234015",
      price: 349,
      costPrice: 220,
      stock: 80, // HEALTHY STOCK
      minStockAlert: 15,
      categoryId: catElectronics.id,
      brandId: getBrandId("Beats"),
      unitId: getUnitId("Pieces"),
      warehouseId: getWhId(1),
      storeId: getStoreId(1),
      image: "/assets/images/product-03.jpg",
      manufacturedDate: new Date("2025-05-15"),
      expiredDate: new Date("2028-05-15"),
      status: "ACTIVE",
    },
  ];

  for (const item of sampleProducts) {
    await prisma.product.create({ data: item });
  }

  // 10. Create Shifts matching Screenshot
  const shiftsData = [
    { name: "Fixed", timing: "09:00 AM - 6:00 PM", weekOff: "Sunday, Monday", createdAt: new Date("2024-08-04"), status: "ACTIVE" },
    { name: "Rotating", timing: "06:00 AM - 3:00 PM", weekOff: "Saturday, Sunday", createdAt: new Date("2024-07-21"), status: "ACTIVE" },
    { name: "Split", timing: "03:00 AM - 9:00 PM", weekOff: "Tuesday, Saturday", createdAt: new Date("2024-01-31"), status: "ACTIVE" },
    { name: "On-Call", timing: "09:00 AM - 6:00 PM", weekOff: "Monday", createdAt: new Date("2024-05-15"), status: "ACTIVE" },
    { name: "Weekend", timing: "06:00 AM - 3:00 PM", weekOff: "Friday", createdAt: new Date("2024-08-04"), status: "ACTIVE" },
  ];
  for (const s of shiftsData) {
    await prisma.shift.create({ data: s });
  }

  // 11. Create Designations matching Screenshot
  const designationsData = [
    { name: "Sales Manager", department: "Sales", totalMembers: 7, createdAt: new Date("2024-12-24"), status: "ACTIVE" },
    { name: "Inventory Manager", department: "Inventory", totalMembers: 10, createdAt: new Date("2024-12-10"), status: "ACTIVE" },
    { name: "Accountant", department: "Finance", totalMembers: 5, createdAt: new Date("2024-11-27"), status: "ACTIVE" },
    { name: "System Administrator", department: "Admin", totalMembers: 10, createdAt: new Date("2024-11-18"), status: "ACTIVE" },
    { name: "HR Manager", department: "Human Resources", totalMembers: 6, createdAt: new Date("2024-11-06"), status: "ACTIVE" },
    { name: "Marketing Manager", department: "Marketing", totalMembers: 12, createdAt: new Date("2024-10-25"), status: "ACTIVE" },
    { name: "QA Analyst", department: "Quality Assurance", totalMembers: 8, createdAt: new Date("2024-10-14"), status: "ACTIVE" },
    { name: "Research Analyst", department: "R&D", totalMembers: 7, createdAt: new Date("2024-10-03"), status: "ACTIVE" },
    { name: "Support Engineer", department: "IT Support", totalMembers: 10, createdAt: new Date("2024-09-20"), status: "ACTIVE" },
    { name: "Content Writer", department: "Content Creation", totalMembers: 8, createdAt: new Date("2024-09-10"), status: "INACTIVE" },
  ];
  for (const d of designationsData) {
    await prisma.designation.create({ data: d });
  }

  // 12. Create Departments matching Screenshot
  const departmentsData = [
    { name: "Inventory", headName: "Mitchum Daniel", headAvatar: "/assets/images/customer11.jpg", totalMembers: 8, status: "ACTIVE" },
    { name: "Human Resources", headName: "Susan Lopez", headAvatar: "/assets/images/customer12.jpg", totalMembers: 10, status: "ACTIVE" },
    { name: "Admin", headName: "Robert Grossman", headAvatar: "/assets/images/customer13.jpg", totalMembers: 5, status: "ACTIVE" },
    { name: "Sales", headName: "Janet Hembre", headAvatar: "/assets/images/customer14.jpg", totalMembers: 10, status: "ACTIVE" },
    { name: "Marketing", headName: "Russell Belle", headAvatar: "/assets/images/customer15.jpg", totalMembers: 6, status: "ACTIVE" },
    { name: "Quality Assurance", headName: "Edward Muniz", headAvatar: "/assets/images/customer16.jpg", totalMembers: 6, status: "ACTIVE" },
    { name: "Finance", headName: "Susan Moore", headAvatar: "/assets/images/customer17.jpg", totalMembers: 8, status: "ACTIVE" },
    { name: "Maintenance", headName: "Lance Jackson", headAvatar: "/assets/images/customer18.jpg", totalMembers: 7, status: "ACTIVE" },
    { name: "R&D", headName: "Travis Marcotte", headAvatar: "/assets/images/avatar-01.jpg", totalMembers: 10, status: "ACTIVE" },
    { name: "Content Creation", headName: "Malinda Ruiz", headAvatar: "/assets/images/avatar-02.jpg", totalMembers: 8, status: "ACTIVE" },
    { name: "Social Media", headName: "David Slater", headAvatar: "/assets/images/avatar-03.jpg", totalMembers: 6, status: "ACTIVE" },
    { name: "IT Support", headName: "Michele Kim", headAvatar: "/assets/images/avatar-10.jpg", totalMembers: 4, status: "ACTIVE" },
  ];
  for (const dep of departmentsData) {
    await prisma.department.create({ data: dep });
  }

  // 13. Create Employees matching Screenshot
  const employeesData = [
    { empId: "POS001", name: "Anthony Lewis", avatar: "/assets/images/customer11.jpg", role: "System Admin", department: "HR", joinedDate: "30 May 2023", email: "anthony@example.com", phone: "+12498345785", status: "ACTIVE" },
    { empId: "POS002", name: "Brian Villalobos", avatar: "/assets/images/customer12.jpg", role: "Software Developer", department: "UI/UX", joinedDate: "30 May 2023", email: "brian@example.com", phone: "+13178964582", status: "ACTIVE" },
    { empId: "POS003", name: "Harvey Smith", avatar: "/assets/images/customer13.jpg", role: "System Admin", department: "Admin", joinedDate: "30 May 2023", email: "harvey@example.com", phone: "+12796183487", status: "ACTIVE" },
    { empId: "POS004", name: "Stephan Peralt", avatar: "/assets/images/customer14.jpg", role: "System Admin", department: "Admin", joinedDate: "30 May 2023", email: "stephan@example.com", phone: "+17538647943", status: "ACTIVE" },
    { empId: "POS005", name: "Doglas Martini", avatar: "/assets/images/customer15.jpg", role: "System Admin", department: "IT", joinedDate: "30 May 2023", email: "doglas@example.com", phone: "+13798132475", status: "ACTIVE" },
    { empId: "POS006", name: "Linda Ray", avatar: "/assets/images/customer16.jpg", role: "System Admin", department: "Support", joinedDate: "30 May 2023", email: "linda@example.com", phone: "+17596341894", status: "ACTIVE" },
    { empId: "POS007", name: "Elliot Murray", avatar: "/assets/images/customer17.jpg", role: "System Admin", department: "UI/UX", joinedDate: "30 May 2023", email: "elliot@example.com", phone: "+12973548678", status: "ACTIVE" },
    { empId: "POS008", name: "Rebecca Smtih", avatar: "/assets/images/customer18.jpg", role: "System Admin", department: "HR", joinedDate: "30 May 2023", email: "rebecca@example.com", phone: "+13147858357", status: "ACTIVE" },
  ];
  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  // 14. Create Attendance matching Admin & Employee Screenshots
  const attendanceData = [
    { employeeName: "Carl Evans", employeeRole: "Designer", employeeAvatar: "/assets/images/customer11.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:00 AM", clockOut: "07:15 PM", production: "09h 00m", breakTime: "0h 45m", overtime: "0h 20m", totalHours: "09h 20m", progress: 85 },
    { employeeName: "Minerva Rameriz", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer12.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:15 AM", clockOut: "07:12 PM", production: "09h 00m", breakTime: "01h 15m", overtime: "0h 12m", totalHours: "09h 12m", progress: 90 },
    { employeeName: "Robert Lamon", employeeRole: "Developer", employeeAvatar: "/assets/images/customer13.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:40 AM", clockOut: "07:00 PM", production: "08h 45m", breakTime: "01h 00m", overtime: "00h 00m", totalHours: "08h 45m", progress: 88 },
    { employeeName: "Patricia Lewis", employeeRole: "HR Manager", employeeAvatar: "/assets/images/customer14.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:45 AM", clockOut: "08:10 PM", production: "09h 12m", breakTime: "00h 50m", overtime: "00 14m", totalHours: "09h 14m", progress: 82 },
    { employeeName: "Mark Joslyn", employeeRole: "Designer", employeeAvatar: "/assets/images/customer15.jpg", date: "01 Jan 2026", status: "ABSENT", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-", progress: 0 },
    { employeeName: "Marsha Betts", employeeRole: "Developer", employeeAvatar: "/assets/images/customer16.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:17 AM", clockOut: "07:34 PM", production: "09h 26m", breakTime: "01h 20m", overtime: "00h 26m", totalHours: "09h 26m", progress: 80 },
    { employeeName: "Daniel Jude", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer17.jpg", date: "01 Jan 2026", status: "ABSENT", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-", progress: 0 },
    { employeeName: "Emma Bates", employeeRole: "HR Assistant", employeeAvatar: "/assets/images/customer18.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:42 AM", clockOut: "07:20 PM", production: "09h 17m", breakTime: "01h 00m", overtime: "00h 17m", totalHours: "09h 17m", progress: 86 },
    { employeeName: "Richard Fralick", employeeRole: "Designer", employeeAvatar: "/assets/images/avatar-01.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:18 AM", clockOut: "07:11 PM", production: "09h 32m", breakTime: "01h 15m", overtime: "00h 32m", totalHours: "09h 32m", progress: 89 },
    { employeeName: "Michelle Robison", employeeRole: "HR Manager", employeeAvatar: "/assets/images/avatar-02.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:30 AM", clockOut: "08:10 PM", production: "09h 00m", breakTime: "00h 34m", overtime: "00h 20m", totalHours: "09h 20m", progress: 87 },
  ];
  for (const att of attendanceData) {
    await prisma.attendance.create({ data: att });
  }

  // 15. Create Leave Types matching Screenshot
  const leaveTypesData = [
    { name: "Sick Leave", quota: 5, createdAt: new Date("2023-08-02"), status: "ACTIVE" },
    { name: "Maternity", quota: 5, createdAt: new Date("2023-08-03"), status: "ACTIVE" },
    { name: "Paternity", quota: 5, createdAt: new Date("2023-08-04"), status: "ACTIVE" },
    { name: "Casual Leave", quota: 5, createdAt: new Date("2023-08-07"), status: "ACTIVE" },
    { name: "Emergency", quota: 5, createdAt: new Date("2023-08-08"), status: "ACTIVE" },
    { name: "Vacation", quota: 5, createdAt: new Date("2023-08-10"), status: "ACTIVE" },
  ];
  for (const lt of leaveTypesData) {
    await prisma.leaveType.create({ data: lt });
  }

  // 16. Create Leaves matching Screenshot
  const leavesData = [
    { empCode: "EMP001", employeeName: "Carl Evans", employeeRole: "Designer", employeeAvatar: "/assets/images/customer11.jpg", leaveType: "Sick Leave", fromDate: "24 Dec 2024", toDate: "24 Dec 2024", duration: "01 Day", appliedOn: "23 Dec 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP002", employeeName: "Minerva Rameriz", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer12.jpg", leaveType: "Casual Leave", fromDate: "10 Dec 2024", toDate: "10 Dec 2024", duration: "01 Day", appliedOn: "09 Dec 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP003", employeeName: "Robert Lamon", employeeRole: "Developer", employeeAvatar: "/assets/images/customer13.jpg", leaveType: "Casual Leave", fromDate: "27 Nov 2024", toDate: "28 Nov 2024", duration: "02 Day", appliedOn: "26 Nov 2024", shift: "Regular", status: "APPLIED" },
    { empCode: "EMP004", employeeName: "Patricia Lewis", employeeRole: "HR Manager", employeeAvatar: "/assets/images/customer14.jpg", leaveType: "Sick Leave", fromDate: "18 Nov 2024", toDate: "18 Nov 2024", duration: "02 hrs", appliedOn: "18 Nov 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP005", employeeName: "Mark Joslyn", employeeRole: "Designer", employeeAvatar: "/assets/images/customer15.jpg", leaveType: "Casual Leave", fromDate: "06 Nov 2024", toDate: "08 Nov 2024", duration: "03 Days", appliedOn: "05 Nov 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP006", employeeName: "Marsha Betts", employeeRole: "Developer", employeeAvatar: "/assets/images/customer16.jpg", leaveType: "Sick Leave", fromDate: "25 Oct 2024", toDate: "25 Oct 2024", duration: "01 Days", appliedOn: "24 Oct 2024", shift: "Regular", status: "REJECTED" },
    { empCode: "EMP007", employeeName: "Daniel Jude", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer17.jpg", leaveType: "Casual Leave", fromDate: "14 Oct 2024", toDate: "15 Oct 2024", duration: "02 Days", appliedOn: "13 Oct 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP008", employeeName: "Emma Bates", employeeRole: "HR Assistant", employeeAvatar: "/assets/images/customer18.jpg", leaveType: "Casual Leave", fromDate: "03 Oct 2024", toDate: "03 Oct 2024", duration: "01 Days", appliedOn: "02 Oct 2024", shift: "Regular", status: "APPLIED" },
    { empCode: "EMP009", employeeName: "Richard Fralick", employeeRole: "Designer", employeeAvatar: "/assets/images/avatar-01.jpg", leaveType: "Sick Leave", fromDate: "20 Sep 2024", toDate: "21 Sep 2024", duration: "02 Days", appliedOn: "19 Sep 2024", shift: "Regular", status: "APPROVED" },
    { empCode: "EMP010", employeeName: "Michelle Robison", employeeRole: "HR Manager", employeeAvatar: "/assets/images/avatar-02.jpg", leaveType: "Casual Leave", fromDate: "10 Sep 2024", toDate: "10 Sep 2024", duration: "02 hrs", appliedOn: "09 Sep 2024", shift: "Regular", status: "REJECTED" },
  ];
  for (const l of leavesData) {
    await prisma.leave.create({ data: l });
  }

  // 17. Create Holidays matching Screenshot
  const holidaysData = [
    { name: "New Year", date: "01 Jan 2026", description: "First day of the new year", status: "ACTIVE" },
    { name: "Martin Luther King Jr. Day", date: "15 Jan 2026", description: "Celebrating the civil rights leader", status: "ACTIVE" },
    { name: "Presidents' Day", date: "19 Feb 2026", description: "Honoring past US Presidents", status: "ACTIVE" },
    { name: "Good Friday", date: "29 Mar 2026", description: "Holiday before Easter", status: "ACTIVE" },
    { name: "Easter Monday", date: "01 Apr 2026", description: "Holiday after Easter", status: "ACTIVE" },
    { name: "Memorial Day", date: "27 May 2026", description: "Honors military personnel", status: "ACTIVE" },
    { name: "Independence Day", date: "04 Jul 2026", description: "Celebrates Independence", status: "ACTIVE" },
    { name: "Labour Day", date: "02 Sep 2026", description: "Honors working people", status: "ACTIVE" },
    { name: "Veterans Day", date: "11 Nov 2026", description: "Honors working people", status: "ACTIVE" },
    { name: "Christmas Day", date: "25 Dec 2026", description: "Celebration of Christmas", status: "ACTIVE" },
  ];
  for (const h of holidaysData) {
    await prisma.holiday.create({ data: h });
  }

  // 18. Create Payroll matching Screenshot
  const payrollData = [
    { empCode: "EMP001", employeeName: "Carl Evans", employeeRole: "Designer", employeeAvatar: "/assets/images/customer11.jpg", email: "carlevans@example.com", salary: 30000, basicSalary: 32000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP002", employeeName: "Minerva Rameriz", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer12.jpg", email: "rameriz@example.com", salary: 20000, basicSalary: 20000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP003", employeeName: "Robert Lamon", employeeRole: "Developer", employeeAvatar: "/assets/images/customer13.jpg", email: "robert@example.com", salary: 35000, basicSalary: 35000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP004", employeeName: "Patricia Lewis", employeeRole: "HR Manager", employeeAvatar: "/assets/images/customer14.jpg", email: "robert@example.com", salary: 35000, basicSalary: 35000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP005", employeeName: "Mark Joslyn", employeeRole: "Designer", employeeAvatar: "/assets/images/customer15.jpg", email: "markjoslyn@example.com", salary: 32000, basicSalary: 32000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP006", employeeName: "Marsha Betts", employeeRole: "Developer", employeeAvatar: "/assets/images/customer16.jpg", email: "marshabetts@example.com", salary: 28000, basicSalary: 28000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP007", employeeName: "Daniel Jude", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer17.jpg", email: "daieljude@example.com", salary: 25000, basicSalary: 25000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP008", employeeName: "Emma Bates", employeeRole: "HR Assistant", employeeAvatar: "/assets/images/customer18.jpg", email: "emmabates@example.com", salary: 21000, basicSalary: 21000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP009", employeeName: "Richard Fralick", employeeRole: "Designer", employeeAvatar: "/assets/images/avatar-01.jpg", email: "richard@example.com", salary: 34000, basicSalary: 34000, payPeriod: "Jan 2026", location: "USA", status: "PAID" },
    { empCode: "EMP010", employeeName: "Michelle Robison", employeeRole: "HR Manager", employeeAvatar: "/assets/images/avatar-02.jpg", email: "robinson@example.com", salary: 28000, basicSalary: 28000, payPeriod: "Jan 2026", location: "USA", status: "UNPAID" },
  ];
  for (const p of payrollData) {
    await prisma.payroll.create({ data: p });
  }

  // 19. Create Sales Report Items matching Screenshot
  const salesReportData = [
    { sku: "PT001", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", brand: "Lenovo", category: "Computers", soldQty: 5, soldAmount: 3000, instockQty: 100 },
    { sku: "PT002", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", brand: "Beats", category: "Electronics", soldQty: 10, soldAmount: 1600, instockQty: 140 },
    { sku: "PT003", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", brand: "Nike", category: "Shoe", soldQty: 8, soldAmount: 880, instockQty: 300 },
    { sku: "PT004", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", brand: "Apple", category: "Electronics", soldQty: 10, soldAmount: 1200, instockQty: 450 },
    { sku: "PT005", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", brand: "Amazon", category: "Electronics", soldQty: 5, soldAmount: 400, instockQty: 320 },
    { sku: "PT006", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", brand: "Modern Wave", category: "Furniture", soldQty: 7, soldAmount: 2240, instockQty: 650 },
    { sku: "PT007", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", brand: "Dior", category: "Bags", soldQty: 15, soldAmount: 900, instockQty: 700 },
    { sku: "PT008", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", brand: "Apple", category: "Phone", soldQty: 12, soldAmount: 6480, instockQty: 630 },
    { sku: "PT009", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", brand: "Arlime", category: "Furniture", soldQty: 10, soldAmount: 2000, instockQty: 410 },
    { sku: "PT010", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", brand: "The North Face", category: "Bags", soldQty: 20, soldAmount: 900, instockQty: 550 },
  ];
  for (const s of salesReportData) {
    await prisma.salesReportItem.create({ data: s });
  }

  // 20. Create Purchase Report Items matching Screenshot
  const purchaseReportData = [
    { reference: "PO2026", sku: "PT001", dueDate: "24 Dec 2024", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", category: "Computers", instockQty: 100, purchaseQty: 5, purchaseAmount: 500 },
    { reference: "PO2026", sku: "PT002", dueDate: "10 Dec 2024", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", category: "Electronics", instockQty: 140, purchaseQty: 10, purchaseAmount: 1500 },
    { reference: "PO2026", sku: "PT003", dueDate: "27 Nov 2024", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", category: "Shoe", instockQty: 300, purchaseQty: 8, purchaseAmount: 600 },
    { reference: "PO2026", sku: "PT004", dueDate: "18 Nov 2024", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", category: "Electronics", instockQty: 450, purchaseQty: 10, purchaseAmount: 1000 },
    { reference: "PO2026", sku: "PT005", dueDate: "18 Nov 2024", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", category: "Electronics", instockQty: 320, purchaseQty: 5, purchaseAmount: 1200 },
    { reference: "PO2026", sku: "PT006", dueDate: "25 Oct 2024", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", category: "Furniture", instockQty: 650, purchaseQty: 7, purchaseAmount: 800 },
    { reference: "PO2026", sku: "PT007", dueDate: "14 Oct 2024", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", category: "Bags", instockQty: 700, purchaseQty: 15, purchaseAmount: 2000 },
    { reference: "PO2026", sku: "PT008", dueDate: "03 Oct 2024", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", category: "Phone", instockQty: 630, purchaseQty: 12, purchaseAmount: 2000 },
    { reference: "PO2026", sku: "PT009", dueDate: "20 Sep 2024", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", category: "Furniture", instockQty: 410, purchaseQty: 10, purchaseAmount: 300 },
    { reference: "PO2026", sku: "PT010", dueDate: "10 Sep 2024", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", category: "Bags", instockQty: 550, purchaseQty: 20, purchaseAmount: 5000 },
  ];
  for (const pr of purchaseReportData) {
    await prisma.purchaseReportItem.create({ data: pr });
  }

  // 21. Create Inventory Report Items
  const inventoryReportData = [
    { sku: "PT001", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", category: "Computers", unit: "Pc", instockQty: 100, minStock: 10, stockValue: 3000 },
    { sku: "PT002", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", category: "Electronics", unit: "Pc", instockQty: 140, minStock: 10, stockValue: 1600 },
    { sku: "PT003", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", category: "Shoe", unit: "Pc", instockQty: 300, minStock: 15, stockValue: 880 },
    { sku: "PT004", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", category: "Electronics", unit: "Pc", instockQty: 450, minStock: 20, stockValue: 1200 },
    { sku: "PT005", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", category: "Electronics", unit: "Pc", instockQty: 320, minStock: 10, stockValue: 400 },
    { sku: "PT006", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", category: "Furniture", unit: "Pc", instockQty: 650, minStock: 5, stockValue: 2240 },
    { sku: "PT007", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", category: "Bags", unit: "Pc", instockQty: 700, minStock: 15, stockValue: 900 },
    { sku: "PT008", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", category: "Phone", unit: "Pc", instockQty: 630, minStock: 20, stockValue: 6480 },
    { sku: "PT009", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", category: "Furniture", unit: "Pc", instockQty: 410, minStock: 5, stockValue: 2000 },
    { sku: "PT010", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", category: "Bags", unit: "Pc", instockQty: 550, minStock: 15, stockValue: 900 },
  ];
  for (const ir of inventoryReportData) {
    await prisma.inventoryReportItem.create({ data: ir });
  }

  // 22. Create Stock History Items matching Screenshot
  const stockHistoryData = [
    { sku: "PT001", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", initialQuantity: 6000, addedQuantity: 100, soldQuantity: 100, defectiveQuantity: 100, finalQuantity: 100 },
    { sku: "PT002", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", initialQuantity: 10, addedQuantity: 140, soldQuantity: 140, defectiveQuantity: 140, finalQuantity: 140 },
    { sku: "PT003", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", initialQuantity: 8, addedQuantity: 300, soldQuantity: 300, defectiveQuantity: 300, finalQuantity: 300 },
    { sku: "PT004", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", initialQuantity: 10, addedQuantity: 450, soldQuantity: 450, defectiveQuantity: 450, finalQuantity: 450 },
    { sku: "PT005", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", initialQuantity: 5, addedQuantity: 320, soldQuantity: 320, defectiveQuantity: 320, finalQuantity: 320 },
    { sku: "PT006", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", initialQuantity: 7, addedQuantity: 650, soldQuantity: 650, defectiveQuantity: 650, finalQuantity: 650 },
    { sku: "PT007", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", initialQuantity: 15, addedQuantity: 700, soldQuantity: 700, defectiveQuantity: 700, finalQuantity: 700 },
    { sku: "PT008", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", initialQuantity: 12, addedQuantity: 630, soldQuantity: 630, defectiveQuantity: 630, finalQuantity: 630 },
    { sku: "PT009", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", initialQuantity: 10, addedQuantity: 410, soldQuantity: 410, defectiveQuantity: 410, finalQuantity: 410 },
    { sku: "PT010", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", initialQuantity: 20, addedQuantity: 550, soldQuantity: 550, defectiveQuantity: 550, finalQuantity: 550 },
  ];
  for (const sh of stockHistoryData) {
    await prisma.stockHistoryItem.create({ data: sh });
  }

  // 23. Create Sold Stock Items matching Screenshot
  const soldStockData = [
    { sku: "PT001", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", unit: 6000, quantity: 100, taxValue: 300, total: 300 },
    { sku: "PT002", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", unit: 10, quantity: 140, taxValue: 10, total: 1600 },
    { sku: "PT003", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", unit: 8, quantity: 300, taxValue: 80, total: 880 },
    { sku: "PT004", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", unit: 10, quantity: 450, taxValue: 100, total: 1200 },
    { sku: "PT005", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", unit: 5, quantity: 320, taxValue: 400, total: 400 },
    { sku: "PT006", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", unit: 7, quantity: 650, taxValue: 220, total: 2240 },
    { sku: "PT007", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", unit: 15, quantity: 700, taxValue: 90, total: 900 },
    { sku: "PT008", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", unit: 12, quantity: 630, taxValue: 680, total: 6480 },
    { sku: "PT009", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", unit: 10, quantity: 410, taxValue: 200, total: 2000 },
    { sku: "PT010", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", unit: 20, quantity: 550, taxValue: 400, total: 900 },
  ];
  for (const ss of soldStockData) {
    await prisma.soldStockItem.create({ data: ss });
  }

  // 24. Create Invoice Report Items matching Screenshot
  const invoiceReportData = [
    { invoiceNo: "INV001", customer: "Carl Evans", dueDate: "24 Dec 2024", amount: 500, paid: 500, amountDue: 500, status: "PAID" },
    { invoiceNo: "INV002", customer: "Minerva Rameriz", dueDate: "10 Dec 2024", amount: 1500, paid: 1500, amountDue: 1500, status: "PAID" },
    { invoiceNo: "INV003", customer: "Robert Lamon", dueDate: "27 Nov 2024", amount: 600, paid: 600, amountDue: 600, status: "PAID" },
    { invoiceNo: "INV004", customer: "Patricia Lewis", dueDate: "18 Nov 2024", amount: 1000, paid: 1000, amountDue: 1000, status: "PAID" },
    { invoiceNo: "INV005", customer: "Mark Joslyn", dueDate: "06 Nov 2024", amount: 1200, paid: 1200, amountDue: 1200, status: "PAID" },
    { invoiceNo: "INV006", customer: "Marsha Betts", dueDate: "25 Oct 2024", amount: 800, paid: 800, amountDue: 800, status: "PAID" },
    { invoiceNo: "INV007", customer: "Daniel Jude", dueDate: "14 Oct 2024", amount: 2000, paid: 2000, amountDue: 2000, status: "PAID" },
    { invoiceNo: "INV008", customer: "Emma Bates", dueDate: "03 Oct 2024", amount: 100, paid: 100, amountDue: 100, status: "PAID" },
    { invoiceNo: "INV009", customer: "Richard Fralick", dueDate: "20 Sep 2024", amount: 300, paid: 300, amountDue: 300, status: "PAID" },
    { invoiceNo: "INV010", customer: "Michelle Robison", dueDate: "10 Sep 2024", amount: 5000, paid: 5000, amountDue: 5000, status: "UNPAID" },
  ];
  for (const inv of invoiceReportData) {
    await prisma.invoiceReportItem.create({ data: inv });
  }

  // 25. Create Supplier Report Items matching Screenshot
  const supplierReportData = [
    { reference: "INV/PO2026", supplierId: "SU001", supplierName: "Apex Computers", supplierImage: "/assets/images/product-01.jpg", totalItems: 10, amount: 1000, paymentMethod: "Cash", status: "RECEIVED" },
    { reference: "INV/PO2031", supplierId: "SU002", supplierName: "Beats Headphones", supplierImage: "/assets/images/product-02.jpg", totalItems: 15, amount: 1500, paymentMethod: "Paypal", status: "PENDING" },
    { reference: "INV/PO2042", supplierId: "SU003", supplierName: "Dazzle Shoes", supplierImage: "/assets/images/product-03.jpg", totalItems: 22, amount: 1500, paymentMethod: "Paypal", status: "RECEIVED" },
    { reference: "INV/PO2033", supplierId: "SU004", supplierName: "Best Accessories", supplierImage: "/assets/images/product-04.jpg", totalItems: 14, amount: 2000, paymentMethod: "Stripe", status: "ORDERED" },
    { reference: "INV/PO2042", supplierId: "SU005", supplierName: "A-Z Store", supplierImage: "/assets/images/product-05.jpg", totalItems: 12, amount: 800, paymentMethod: "Paypal", status: "RECEIVED" },
    { reference: "INV/PO2011", supplierId: "SU006", supplierName: "Hatimi Hardwares", supplierImage: "/assets/images/product-06.jpg", totalItems: 45, amount: 750, paymentMethod: "Cash", status: "PENDING" },
    { reference: "INV/PO2014", supplierId: "SU007", supplierName: "Aesthetic Bags", supplierImage: "/assets/images/product-07.jpg", totalItems: 21, amount: 1300, paymentMethod: "Credit Card", status: "RECEIVED" },
    { reference: "INV/PO2047", supplierId: "SU009", supplierName: "Sigma Chairs", supplierImage: "/assets/images/product-08.jpg", totalItems: 25, amount: 2300, paymentMethod: "Credit Card", status: "ORDERED" },
    { reference: "INV/PO2017", supplierId: "SU010", supplierName: "Zenith Bags", supplierImage: "/assets/images/product-09.jpg", totalItems: 15, amount: 1700, paymentMethod: "Stripe", status: "PENDING" },
  ];
  for (const sup of supplierReportData) {
    await prisma.supplierReportItem.create({ data: sup });
  }

  // 26. Create Supplier Due Report Items matching Screenshot
  const supplierDueReportData = [
    { reference: "INV/PO2026", supplierId: "SU001", supplierName: "Apex Computers", supplierImage: "/assets/images/product-01.jpg", totalAmount: 1000, paid: 1000, due: 0, status: "PAID" },
    { reference: "INV/PO2042", supplierId: "SU003", supplierName: "Dazzle Shoes", supplierImage: "/assets/images/product-03.jpg", totalAmount: 1500, paid: 1500, due: 0, status: "PAID" },
    { reference: "INV/PO2033", supplierId: "SU004", supplierName: "Best Accessories", supplierImage: "/assets/images/product-04.jpg", totalAmount: 2000, paid: 2000, due: 0, status: "PAID" },
    { reference: "INV/PO2042", supplierId: "SU005", supplierName: "A-Z Store", supplierImage: "/assets/images/product-05.jpg", totalAmount: 800, paid: 800, due: 0, status: "PAID" },
    { reference: "INV/PO2011", supplierId: "SU006", supplierName: "Hatimi Hardwares", supplierImage: "/assets/images/product-06.jpg", totalAmount: 750, paid: 750, due: 0, status: "PAID" },
    { reference: "INV/PO2014", supplierId: "SU007", supplierName: "Aesthetic Bags", supplierImage: "/assets/images/product-07.jpg", totalAmount: 1300, paid: 1300, due: 0, status: "OVERDUE" },
    { reference: "INV/PO2056", supplierId: "SU008", supplierName: "Alpha Mobiles", supplierImage: "/assets/images/product-08.jpg", totalAmount: 1100, paid: 1100, due: 0, status: "PAID" },
    { reference: "INV/PO2047", supplierId: "SU009", supplierName: "Sigma Chairs", supplierImage: "/assets/images/product-09.jpg", totalAmount: 2300, paid: 2300, due: 0, status: "PAID" },
    { reference: "INV/PO2017", supplierId: "SU010", supplierName: "Zenith Bags", supplierImage: "/assets/images/product-10.jpg", totalAmount: 1700, paid: 1700, due: 0, status: "UNPAID" },
  ];
  for (const sd of supplierDueReportData) {
    await prisma.supplierDueReportItem.create({ data: sd });
  }

  // 27. Create Customer Report Items matching Screenshot
  const customerReportData = [
    { reference: "INV2026", customerCode: "CU001", customerName: "Carl Evans", customerImage: "/assets/images/customer11.jpg", totalOrders: 10, amount: 1000, paymentMethod: "Cash", status: "COMPLETED" },
    { reference: "INV2031", customerCode: "CU002", customerName: "Minerva Rameriz", customerImage: "/assets/images/customer12.jpg", totalOrders: 15, amount: 1500, paymentMethod: "Paypal", status: "COMPLETED" },
    { reference: "INV2042", customerCode: "CU003", customerName: "Robert Lamon", customerImage: "/assets/images/customer13.jpg", totalOrders: 22, amount: 1500, paymentMethod: "Paypal", status: "COMPLETED" },
    { reference: "INV2033", customerCode: "CU004", customerName: "Patricia Lewis", customerImage: "/assets/images/customer14.jpg", totalOrders: 14, amount: 2000, paymentMethod: "Stripe", status: "COMPLETED" },
    { reference: "INV2042", customerCode: "CU005", customerName: "Mark Joslyn", customerImage: "/assets/images/customer15.jpg", totalOrders: 12, amount: 800, paymentMethod: "Paypal", status: "COMPLETED" },
    { reference: "INV2011", customerCode: "CU006", customerName: "Marsha Betts", customerImage: "/assets/images/customer16.jpg", totalOrders: 45, amount: 750, paymentMethod: "Cash", status: "COMPLETED" },
    { reference: "INV2014", customerCode: "CU007", customerName: "Daniel Jude", customerImage: "/assets/images/customer17.jpg", totalOrders: 21, amount: 1300, paymentMethod: "Credit Card", status: "COMPLETED" },
    { reference: "INV2056", customerCode: "CU008", customerName: "Emma Bates", customerImage: "/assets/images/customer18.jpg", totalOrders: 78, amount: 1100, paymentMethod: "Stripe", status: "COMPLETED" },
    { reference: "INV2047", customerCode: "CU009", customerName: "Richard Fralick", customerImage: "/assets/images/avatar-01.jpg", totalOrders: 15, amount: 1700, paymentMethod: "Credit Card", status: "COMPLETED" },
  ];
  for (const cr of customerReportData) {
    await prisma.customerReportItem.create({ data: cr });
  }

  // 28. Create Customer Due Report Items matching Screenshot
  const customerDueReportData = [
    { reference: "INV2026", customerCode: "CU001", customerName: "Carl Evans", customerImage: "/assets/images/customer11.jpg", totalAmount: 1000, paid: 1000, due: 0, status: "PAID" },
    { reference: "INV2031", customerCode: "CU002", customerName: "Minerva Rameriz", customerImage: "/assets/images/customer12.jpg", totalAmount: 1500, paid: 1500, due: 0, status: "PAID" },
    { reference: "INV2042", customerCode: "CU003", customerName: "Robert Lamon", customerImage: "/assets/images/customer13.jpg", totalAmount: 1600, paid: 1600, due: 0, status: "PAID" },
    { reference: "INV2033", customerCode: "CU004", customerName: "Patricia Lewis", customerImage: "/assets/images/customer14.jpg", totalAmount: 700, paid: 700, due: 0, status: "PAID" },
    { reference: "INV2042", customerCode: "CU005", customerName: "Mark Joslyn", customerImage: "/assets/images/customer15.jpg", totalAmount: 1000, paid: 1000, due: 0, status: "PAID" },
    { reference: "INV2011", customerCode: "CU006", customerName: "Marsha Betts", customerImage: "/assets/images/customer16.jpg", totalAmount: 2000, paid: 2000, due: 0, status: "PAID" },
    { reference: "INV2014", customerCode: "CU007", customerName: "Daniel Jude", customerImage: "/assets/images/customer17.jpg", totalAmount: 600, paid: 600, due: 0, status: "OVERDUE" },
    { reference: "INV2056", customerCode: "CU008", customerName: "Emma Bates", customerImage: "/assets/images/customer18.jpg", totalAmount: 1000, paid: 1000, due: 0, status: "UNPAID" },
    { reference: "INV2047", customerCode: "CU009", customerName: "Richard Fralick", customerImage: "/assets/images/avatar-01.jpg", totalAmount: 500, paid: 500, due: 0, status: "COMPLETED" },
  ];
  for (const cd of customerDueReportData) {
    await prisma.customerDueReportItem.create({ data: cd });
  }

  // 29. Create Product Report Items matching Screenshot
  const productReportData = [
    { sku: "PT001", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", category: "Computers", brand: "Lenovo", qty: 100, price: 600, totalOrdered: 5000, revenue: 787258 },
    { sku: "PT002", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", category: "Electronics", brand: "Beats", qty: 140, price: 160, totalOrdered: 4860, revenue: 689788 },
    { sku: "PT003", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", category: "Shoe", brand: "Nike", qty: 300, price: 110, totalOrdered: 40, revenue: 7757 },
    { sku: "PT004", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", category: "Electronics", brand: "Apple", qty: 450, price: 120, totalOrdered: 9642, revenue: 7555 },
    { sku: "PT005", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", category: "Electronics", brand: "Amazon", qty: 320, price: 80, totalOrdered: 5464, revenue: 39698 },
    { sku: "PT006", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", category: "Furniture", brand: "Modern Wave", qty: 650, price: 320, totalOrdered: 158, revenue: 748 },
    { sku: "PT007", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", category: "Bags", brand: "Dior", qty: 700, price: 60, totalOrdered: 7845, revenue: 7985 },
    { sku: "PT008", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", category: "Phone", brand: "Apple", qty: 630, price: 540, totalOrdered: 540, revenue: 8769798 },
    { sku: "PT009", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", category: "Furniture", brand: "Arlime", qty: 410, price: 200, totalOrdered: 200, revenue: 788979 },
    { sku: "PT010", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", category: "Bags", brand: "The North Face", qty: 550, price: 45, totalOrdered: 45, revenue: 895 },
  ];
  for (const pr of productReportData) {
    await prisma.productReportItem.create({ data: pr });
  }

  // 30. Create Product Expiry Report Items matching Screenshot
  const productExpiryData = [
    { sku: "PT001", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", manufacturedDate: "24 Dec 2024", expiredDate: "20 Dec 2026" },
    { sku: "PT002", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", manufacturedDate: "25 Dec 2024", expiredDate: "21 Dec 2026" },
    { sku: "PT003", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", manufacturedDate: "26 Dec 2024", expiredDate: "22 Dec 2026" },
    { sku: "PT004", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", manufacturedDate: "30 Dec 2024", expiredDate: "25 Dec 2026" },
    { sku: "PT005", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", manufacturedDate: "28 Dec 2024", expiredDate: "26 Dec 2026" },
    { sku: "PT006", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", manufacturedDate: "24 Dec 2024", expiredDate: "29 Dec 2026" },
    { sku: "PT007", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", manufacturedDate: "15 Dec 2024", expiredDate: "30 Dec 2026" },
    { sku: "PT008", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", manufacturedDate: "24 Dec 2024", expiredDate: "20 Dec 2026" },
    { sku: "PT009", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", manufacturedDate: "30 Dec 2024", expiredDate: "20 Dec 2026" },
    { sku: "PT010", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", manufacturedDate: "24 Dec 2024", expiredDate: "20 Dec 2026" },
  ];
  for (const pe of productExpiryData) {
    await prisma.productExpiryReportItem.create({ data: pe });
  }

  // 31. Create Product Quantity Alert Items matching Screenshot
  const productQuantityAlertData = [
    { sku: "PT001", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Lenovo IdeaPad 3", productImage: "/assets/images/product-01.jpg", totalQuantity: 98, alertQuantity: 79 },
    { sku: "PT002", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Beats Pro", productImage: "/assets/images/product-02.jpg", totalQuantity: 156, alertQuantity: 66 },
    { sku: "PT003", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Nike Jordan", productImage: "/assets/images/product-03.jpg", totalQuantity: 89, alertQuantity: 69 },
    { sku: "PT004", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Apple Series 5 Watch", productImage: "/assets/images/product-04.jpg", totalQuantity: 569, alertQuantity: 68 },
    { sku: "PT005", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Amazon Echo Dot", productImage: "/assets/images/product-05.jpg", totalQuantity: 548, alertQuantity: 33 },
    { sku: "PT006", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Sanford Chair Sofa", productImage: "/assets/images/product-06.jpg", totalQuantity: 456, alertQuantity: 16 },
    { sku: "PT007", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Red Premium Satchel", productImage: "/assets/images/product-07.jpg", totalQuantity: 178, alertQuantity: 86 },
    { sku: "PT008", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Iphone 14 Pro", productImage: "/assets/images/product-08.jpg", totalQuantity: 1768, alertQuantity: 33 },
    { sku: "PT009", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Gaming Chair", productImage: "/assets/images/product-09.jpg", totalQuantity: 568, alertQuantity: 528 },
    { sku: "PT010", serialNo: "LNV-IP3-8GB-256SSD-BL", productName: "Borealis Backpack", productImage: "/assets/images/product-10.jpg", totalQuantity: 146, alertQuantity: 11 },
  ];
  for (const pqa of productQuantityAlertData) {
    await prisma.productQuantityAlertItem.create({ data: pqa });
  }

  // 32. Create Expense Report Items matching Screenshot
  const expenseReportData = [
    { expenseName: "Electricity Payment", category: "Utilities", description: "Electricity Bill", expenseDate: "24 Dec 2024", amount: 200, paymentMethod: "Cash", status: "APPROVED" },
    { expenseName: "Stationery Purchase", category: "Office Supplies", description: "Stationery items for office", expenseDate: "10 Dec 2024", amount: 50, paymentMethod: "Paypal", status: "PENDING" },
    { expenseName: "AC Repair Service", category: "Repairs & Maintenance", description: "AC Repair for Office", expenseDate: "27 Nov 2024", amount: 800, paymentMethod: "Cash", status: "APPROVED" },
    { expenseName: "Social Media Promotion", category: "Marketing", description: "Social Media Ads Campaign", expenseDate: "18 Nov 2024", amount: 100, paymentMethod: "Stripe", status: "APPROVED" },
    { expenseName: "Client Meeting", category: "Travel Expenses", description: "Travel fare for client meeting", expenseDate: "06 Nov 2024", amount: 700, paymentMethod: "Credit Card", status: "APPROVED" },
    { expenseName: "Team Lunch", category: "Employee Benefits", description: "Team Lunch at Restaurant", expenseDate: "25 Oct 2024", amount: 1000, paymentMethod: "Cash", status: "PENDING" },
    { expenseName: "Business Flight Ticket", category: "Travel Expenses", description: "Flight tickets for meetings", expenseDate: "14 Oct 2024", amount: 1200, paymentMethod: "Credit Card", status: "APPROVED" },
    { expenseName: "Chair Purchase", category: "Office Supplies", description: "Ergonomic chairs for staff", expenseDate: "03 Oct 2024", amount: 750, paymentMethod: "Bank Transfer", status: "APPROVED" },
    { expenseName: "Plumbing Service", category: "Repairs & Maintenance", description: "Plumbing repairs in office", expenseDate: "20 Sep 2024", amount: 450, paymentMethod: "Cash", status: "APPROVED" },
    { expenseName: "Internet Bill Payment", category: "Utilities", description: "Monthly internet subscription", expenseDate: "10 Sep 2024", amount: 300, paymentMethod: "Paypal", status: "PENDING" },
  ];
  for (const exp of expenseReportData) {
    await prisma.expenseReportItem.create({ data: exp });
  }

  // 33. Create Income Report Items
  const incomeReportData = [
    { incomeName: "Product Sales", category: "Sales", description: "Monthly store sales", incomeDate: "24 Dec 2024", amount: 4565, paymentMethod: "Cash", status: "RECEIVED" },
    { incomeName: "Consulting Fee", category: "Consulting", description: "Client strategy consulting", incomeDate: "10 Dec 2024", amount: 4494, paymentMethod: "Paypal", status: "RECEIVED" },
    { incomeName: "Store Rent", category: "Rental Income", description: "Branch office rental", incomeDate: "27 Nov 2024", amount: 65945, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { incomeName: "Investment Dividend", category: "Investments", description: "Quarterly dividend payout", incomeDate: "18 Nov 2024", amount: 1948, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { incomeName: "Web Development", category: "Services", description: "Custom web app service", incomeDate: "06 Nov 2024", amount: 1686, paymentMethod: "Stripe", status: "RECEIVED" },
    { incomeName: "Service Charge", category: "Services", description: "POS setup and training", incomeDate: "25 Oct 2024", amount: 16547, paymentMethod: "Cash", status: "PENDING" },
    { incomeName: "Affiliate Commission", category: "Marketing", description: "Referral commission", incomeDate: "14 Oct 2024", amount: 141845, paymentMethod: "Paypal", status: "RECEIVED" },
    { incomeName: "Maintenance Retainer", category: "Maintenance", description: "Annual maintenance contract", incomeDate: "03 Oct 2024", amount: 44188, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { incomeName: "Licensing Fee", category: "Royalties", description: "Brand licensing", incomeDate: "20 Sep 2024", amount: 614848, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { incomeName: "Software Subscription", category: "Software", description: "Cloud POS subscription", incomeDate: "10 Sep 2024", amount: 77818, paymentMethod: "Stripe", status: "PENDING" },
  ];
  for (const inc of incomeReportData) {
    await prisma.incomeReportItem.create({ data: inc });
  }

  // 34. Create Purchase Tax Report Items matching Screenshot
  const purchaseTaxData = [
    { reference: "#4237300", supplier: "Apex Computers", taxDate: "24 Dec 2024", store: "Electro Mart", amount: 200, paymentMethod: "Stripe", discount: 200, taxAmount: 200 },
    { reference: "#7590325", supplier: "Beats Headphones", taxDate: "10 Dec 2024", store: "Quantum Gadgets", amount: 50, paymentMethod: "Paypal", discount: 50, taxAmount: 50 },
    { reference: "#9814521", supplier: "Dazzle Shoes", taxDate: "27 Nov 2024", store: "Prime Bazaar", amount: 800, paymentMethod: "Cash", discount: 800, taxAmount: 800 },
    { reference: "#8745225", supplier: "Best Accessories", taxDate: "18 Nov 2024", store: "Gadget World", amount: 100, paymentMethod: "Paypal", discount: 100, taxAmount: 100 },
    { reference: "#4237022", supplier: "A-Z Store", taxDate: "06 Nov 2024", store: "Volt Vault", amount: 700, paymentMethod: "Cash", discount: 700, taxAmount: 700 },
    { reference: "#8744439", supplier: "Hatimi Hardwares", taxDate: "25 Oct 2024", store: "Elite Retail", amount: 1000, paymentMethod: "Cash", discount: 1000, taxAmount: 1000 },
    { reference: "#7590365", supplier: "Aesthetic Bags", taxDate: "14 Oct 2024", store: "Prime Mart", amount: 1200, paymentMethod: "Paypal", discount: 1200, taxAmount: 1200 },
    { reference: "#8745478", supplier: "Alpha Mobiles", taxDate: "03 Oct 2024", store: "NeoTech Store", amount: 750, paymentMethod: "Stripe", discount: 750, taxAmount: 750 },
    { reference: "#7590321", supplier: "Sigma Chairs", taxDate: "20 Sep 2024", store: "Urban Mart", amount: 450, paymentMethod: "Stripe", discount: 450, taxAmount: 450 },
    { reference: "#8745245", supplier: "Zenith Bags", taxDate: "10 Sep 2024", store: "Travel Mart", amount: 300, paymentMethod: "Cash", discount: 300, taxAmount: 300 },
  ];
  for (const pt of purchaseTaxData) {
    await prisma.purchaseTaxReportItem.create({ data: pt });
  }

  // 35. Create Sales Tax Report Items
  const salesTaxData = [
    { reference: "#4237300", customer: "Apex Computers", taxDate: "24 Dec 2024", store: "Electro Mart", amount: 200, paymentMethod: "Stripe", discount: 200, taxAmount: 200 },
    { reference: "#7590325", customer: "Beats Headphones", taxDate: "10 Dec 2024", store: "Quantum Gadgets", amount: 50, paymentMethod: "Paypal", discount: 50, taxAmount: 50 },
    { reference: "#9814521", customer: "Dazzle Shoes", taxDate: "27 Nov 2024", store: "Prime Bazaar", amount: 800, paymentMethod: "Cash", discount: 800, taxAmount: 800 },
    { reference: "#8745225", customer: "Best Accessories", taxDate: "18 Nov 2024", store: "Gadget World", amount: 100, paymentMethod: "Paypal", discount: 100, taxAmount: 100 },
    { reference: "#4237022", customer: "A-Z Store", taxDate: "06 Nov 2024", store: "Volt Vault", amount: 700, paymentMethod: "Cash", discount: 700, taxAmount: 700 },
    { reference: "#8744439", customer: "Hatimi Hardwares", taxDate: "25 Oct 2024", store: "Elite Retail", amount: 1000, paymentMethod: "Cash", discount: 1000, taxAmount: 1000 },
    { reference: "#7590365", customer: "Aesthetic Bags", taxDate: "14 Oct 2024", store: "Prime Mart", amount: 1200, paymentMethod: "Paypal", discount: 1200, taxAmount: 1200 },
    { reference: "#8745478", customer: "Alpha Mobiles", taxDate: "03 Oct 2024", store: "NeoTech Store", amount: 750, paymentMethod: "Stripe", discount: 750, taxAmount: 750 },
    { reference: "#7590321", customer: "Sigma Chairs", taxDate: "20 Sep 2024", store: "Urban Mart", amount: 450, paymentMethod: "Stripe", discount: 450, taxAmount: 450 },
    { reference: "#8745245", customer: "Zenith Bags", taxDate: "10 Sep 2024", store: "Travel Mart", amount: 300, paymentMethod: "Cash", discount: 300, taxAmount: 300 },
  ];
  for (const st of salesTaxData) {
    await prisma.salesTaxReportItem.create({ data: st });
  }

  // 36. Create Profit / Loss Report Items matching Screenshot
  const profitLossData = [
    { type: "INCOME", itemKey: "Sales", jan2026: 50000, feb2026: 50000, mar2026: 50000, apr2026: 50000, may2026: 50000, jun2026: 50000 },
    { type: "INCOME", itemKey: "Service", jan2026: 30000, feb2026: 30000, mar2026: 30000, apr2026: 30000, may2026: 30000, jun2026: 30000 },
    { type: "INCOME", itemKey: "Purchase Return", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000, may2026: 7000, jun2026: 7000 },
    { type: "EXPENSE", itemKey: "Sales", jan2026: 50000, feb2026: 50000, mar2026: 50000, apr2026: 50000, may2026: 50000, jun2026: 50000 },
    { type: "EXPENSE", itemKey: "Purrchase", jan2026: 30000, feb2026: 30000, mar2026: 30000, apr2026: 30000, may2026: 30000, jun2026: 30000 },
    { type: "EXPENSE", itemKey: "Sales Return", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000, may2026: 7000, jun2026: 7000 },
  ];
  for (const pl of profitLossData) {
    await prisma.profitLossReportItem.create({ data: pl });
  }

  // 37. Create Annual Report Items matching Screenshot
  const annualData = [
    { monthName: "January", jan2026: 50000, feb2026: 50000, mar2026: 50000, apr2026: 50000 },
    { monthName: "Febuary", jan2026: 30000, feb2026: 50000, mar2026: 50000, apr2026: 50000 },
    { monthName: "March", jan2026: 7000, feb2026: 50000, mar2026: 50000, apr2026: 50000 },
    { monthName: "April", jan2026: 7000, feb2026: 50000, mar2026: 50000, apr2026: 50000 },
    { monthName: "May", jan2026: 7000, feb2026: 50000, mar2026: 50000, apr2026: 50000 },
    { monthName: "June", jan2026: 7000, feb2026: 30000, mar2026: 30000, apr2026: 30000 },
    { monthName: "July", jan2026: 7000, feb2026: 30000, mar2026: 30000, apr2026: 30000 },
    { monthName: "August", jan2026: 7000, feb2026: 30000, mar2026: 30000, apr2026: 30000 },
    { monthName: "September", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000 },
    { monthName: "October", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000 },
    { monthName: "November", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000 },
    { monthName: "December", jan2026: 7000, feb2026: 7000, mar2026: 7000, apr2026: 7000 },
  ];
  for (const an of annualData) {
    await prisma.annualReportItem.create({ data: an });
  }

  // 38. Create User Profile Settings
  await prisma.userProfileSettings.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 234-5678",
      userName: "johndoe_admin",
      address: "4517 Washington Ave.",
      city: "Manchester",
      country: "United States",
      postalCode: "39401",
      bio: "Senior Store Operations Manager & Lead POS Administrator with 8+ years experience in retail logistics and multi-outlet management.",
      avatar: "/assets/images/customer11.jpg",
    },
  });

  // 39. Create User Security Settings & Session Logs
  await prisma.userSecuritySettings.create({
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: "Authenticator App (Google Authenticator)",
      passwordLastChanged: "25 days ago",
      loginAlerts: true,
    },
  });

  const sessionLogsData = [
    { device: "MacBook Pro 16\"", browser: "Chrome 122.0.6261 (macOS Sonoma)", ipAddress: "192.168.1.104", location: "Bangkok, Thailand", lastActive: "Active Now", isCurrent: true },
    { device: "iPhone 15 Pro Max", browser: "Mobile Safari 17.2 (iOS)", ipAddress: "182.232.14.88", location: "Bangkok, Thailand", lastActive: "2 hours ago", isCurrent: false },
    { device: "Windows Desktop PC", browser: "Microsoft Edge 122.0", ipAddress: "115.87.192.45", location: "Chiang Mai, Thailand", lastActive: "3 days ago", isCurrent: false },
    { device: "iPad Air (5th Gen)", browser: "Safari 17.0 (iPadOS)", ipAddress: "192.168.1.112", location: "Bangkok, Thailand", lastActive: "1 week ago", isCurrent: false },
  ];
  for (const log of sessionLogsData) {
    await prisma.userSessionLog.create({ data: log });
  }

  // 40. Create User Notification Settings
  await prisma.userNotificationSettings.create({
    data: {
      emailAlerts: true,
      pushAlerts: true,
      smsAlerts: false,
      lowStockAlerts: true,
      newOrderAlerts: true,
      invoicesAlerts: true,
      paymentAlerts: true,
      weeklyReports: true,
    },
  });

  // 41. Create Connected Apps Items
  const connectedAppsData = [
    {
      appName: "Slack",
      appCategory: "Team Communication",
      appLogo: "/assets/images/apps/slack.svg",
      description: "Receive instant notifications for online POS orders, stock quantity alerts, and daily sales summaries in dedicated channels.",
      status: "CONNECTED",
      connectedAccount: "pos-workspace@slack.com",
      connectedDate: "15 Jan 2024",
    },
    {
      appName: "Google Drive",
      appCategory: "Cloud Storage & Backup",
      appLogo: "/assets/images/apps/google-drive.svg",
      description: "Automatically back up daily database snapshots, exported PDF receipts, and inventory spreadsheets to your cloud folder.",
      status: "CONNECTED",
      connectedAccount: "admin.drive@gmail.com",
      connectedDate: "02 Feb 2024",
    },
    {
      appName: "Mailchimp",
      appCategory: "Email Marketing & CRM",
      appLogo: "/assets/images/apps/mailchimp.svg",
      description: "Sync registered POS customer contacts, purchase history, and birthday rewards directly into your marketing audience lists.",
      status: "CONNECTED",
      connectedAccount: "pos_marketing_list@mailchimp.com",
      connectedDate: "10 Mar 2024",
    },
    {
      appName: "Stripe Payments",
      appCategory: "Payment Gateway",
      appLogo: "/assets/images/apps/stripe.svg",
      description: "Accept credit cards, debit cards, and Apple Pay directly at the register with real-time settlement and automated dispute alerts.",
      status: "CONNECTED",
      connectedAccount: "acct_1NZX49POSLive",
      connectedDate: "18 Nov 2023",
    },
    {
      appName: "QuickBooks Online",
      appCategory: "Accounting & Tax",
      appLogo: "/assets/images/apps/quickbooks.svg",
      description: "Automate ledger entries, tax collection records, expense reconciliation, and balance sheet syncing with your QuickBooks account.",
      status: "DISCONNECTED",
      connectedAccount: null,
      connectedDate: null,
    },
    {
      appName: "GitHub",
      appCategory: "Developer & Webhooks",
      appLogo: "/assets/images/apps/github.svg",
      description: "Trigger automated webhooks for third-party developer integrations, API logs, and custom system extensions.",
      status: "DISCONNECTED",
      connectedAccount: null,
      connectedDate: null,
    },
  ];
  for (const app of connectedAppsData) {
    await prisma.connectedAppItem.create({ data: app });
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
