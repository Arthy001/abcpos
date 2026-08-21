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
