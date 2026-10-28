import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting fresh database seed for Plastic Bag Manufacturing Business (with 7-Month Historical Analytics)...");

  // 1. Company Settings
  console.log("Setting up Company Settings...");
  await prisma.companySettings.deleteMany();
  await prisma.companySettings.create({
    data: {
      companyName: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด (Siam Polypack Manufacturing Co., Ltd.)",
      email: "contact@siampolypack.com",
      phone: "+66 2 890 1234",
      fax: "+66 2 890 1235",
      website: "https://www.siampolypack.com",
      address: "88/18 หมู่ 4 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง",
      city: "สมุทรสาคร",
      state: "สมุทรสาคร",
      country: "Thailand",
      postalCode: "74000",
      taxId: "0105562098888",
    },
  });

  // 2. Roles & System Users
  console.log("Creating Roles & System Users...");
  await prisma.userWarehouse.deleteMany();
  await prisma.systemUser.deleteMany();
  await prisma.role.deleteMany();

  const roles = [
    { name: "Admin", description: "ผู้ดูแลระบบสูงสุด สิทธิ์การเข้าถึงทุกฟังก์ชัน" },
    { name: "Plant Manager", description: "ผู้จัดการโรงงาน ดูแลการผลิต คลังสินค้า และสูตรการผลิต" },
    { name: "Production Supervisor", description: "หัวหน้าฝ่ายผลิต คุมเครื่องเป่าฟิล์มและเครื่องตัดซีล" },
    { name: "Warehouse Supervisor", description: "ผู้ดูแลคลังสินค้า การรับเข้า-เบิกจ่าย และตรวจนับสต็อก" },
    { name: "Sales & Cashier", description: "เจ้าหน้าที่ฝ่ายขายและออกใบเสร็จรับเงิน/POS" },
  ];

  for (const r of roles) {
    await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
        status: "ACTIVE",
        createdDate: "01 Jan 2026",
      },
    });
  }

  // 3. Warehouses & Stores
  console.log("Creating Warehouses & Stores...");
  await prisma.warehouse.deleteMany();
  await prisma.store.deleteMany();

  const warehousesData = [
    {
      name: "คลังวัตถุดิบเม็ดพลาสติก A (RM-01)",
      code: "RM-01",
      phone: "+66 2 890 1240",
      contactPerson: "สมคิด คุมเม็ด",
      address: "อาคาร 1 โรงงานสมุทรสาคร เก็บเม็ดพลาสติก HDPE, LDPE, PP, สารเติมแต่ง",
      status: "ACTIVE",
    },
    {
      name: "คลังสินค้าสำเร็จรูป 1 (FG-01)",
      code: "FG-01",
      phone: "+66 2 890 1241",
      contactPerson: "สมเกียรติ สต็อกแมน",
      address: "อาคาร 2 โรงงานสมุทรสาคร เก็บถุงหูหิ้ว, ถุงร้อน, ถุงเย็น รอส่งมอบ",
      status: "ACTIVE",
    },
    {
      name: "คลังสินค้าสำเร็จรูป 2 (FG-02)",
      code: "FG-02",
      phone: "+66 2 890 1242",
      contactPerson: "วิเชียร โลจิสติกส์",
      address: "อาคาร 3 โรงงานสมุทรสาคร เก็บถุงขยะ, ฟิล์มยืด, สินค้าสั่งผลิต",
      status: "ACTIVE",
    },
    {
      name: "คลังเศษพลาสติกรีไซเคิล (RC-01)",
      code: "RC-01",
      phone: "+66 2 890 1243",
      contactPerson: "บุญส่ง บดพลาสติก",
      address: "ลานบดรีไซเคิล อาคาร 4 เก็บเศษฟิล์มจากการตัดซีลเพื่อนำกลับมาหลอมใหม่",
      status: "ACTIVE",
    },
  ];

  const whMap: Record<string, string> = {};
  for (const w of warehousesData) {
    const created = await prisma.warehouse.create({ data: w });
    whMap[w.name] = created.id;
  }

  const storesData = [
    {
      name: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
      code: "STO-RAMA2",
      userName: "สมเกียรติ สโตร์แมน",
      phone: "+66 2 890 1250",
      email: "store-rama2@siampolypack.com",
      address: "88/18 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง จ.สมุทรสาคร",
      status: "ACTIVE",
    },
    {
      name: "สาขา ตลาดไท ศูนย์รวมบรรจุภัณฑ์",
      code: "STO-TALAADTHAI",
      userName: "วิชัย ตลาดไท",
      phone: "+66 2 529 8890",
      email: "store-talaadthai@siampolypack.com",
      address: "โซนพลาซ่าตลาดไท ต.คลองสอง อ.คลองหลวง จ.ปทุมธานี",
      status: "ACTIVE",
    },
    {
      name: "สาขา ตลาดสี่มุมเมือง",
      code: "STO-SIMUMMUANG",
      userName: "กานดา สี่มุมเมือง",
      phone: "+66 2 995 7766",
      email: "store-simummuang@siampolypack.com",
      address: "ตลาดสี่มุมเมือง อาคารบรรจุภัณฑ์ ต.คูคต อ.ลำลูกกา จ.ปทุมธานี",
      status: "ACTIVE",
    },
  ];

  const storeMap: Record<string, string> = {};
  for (const s of storesData) {
    const created = await prisma.store.create({ data: s });
    storeMap[s.name] = created.id;
  }

  // System Users
  const usersData = [
    {
      name: "สมชาย ชัยชนะ (Plant Director)",
      phone: "+66 81 234 5678",
      email: "admin@siampolypack.com",
      role: "Admin",
      warehouseName: "All Warehouses",
      storeName: "All Stores",
      avatar: "/assets/images/avatar-01.jpg",
      status: "ACTIVE",
    },
    {
      name: "วิชัย เป่าฟิล์ม (Lead Extruder)",
      phone: "+66 89 876 5432",
      email: "wichai@siampolypack.com",
      role: "Production Supervisor",
      warehouseName: "คลังวัตถุดิบเม็ดพลาสติก A (RM-01)",
      storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
      avatar: "/assets/images/customer12.jpg",
      status: "ACTIVE",
    },
    {
      name: "กานดา การค้า (Sales Manager)",
      phone: "+66 86 555 1234",
      email: "kanda@siampolypack.com",
      role: "Sales & Cashier",
      warehouseName: "คลังสินค้าสำเร็จรูป 1 (FG-01)",
      storeName: "สาขา ตลาดไท ศูนย์รวมบรรจุภัณฑ์",
      avatar: "/assets/images/customer14.jpg",
      status: "ACTIVE",
    },
    {
      name: "สมเกียรติ สต็อกแมน (Store Keeper)",
      phone: "+66 84 333 9988",
      email: "somkiat@siampolypack.com",
      role: "Warehouse Supervisor",
      warehouseName: "คลังสินค้าสำเร็จรูป 1 (FG-01)",
      storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
      avatar: "/assets/images/customer15.jpg",
      status: "ACTIVE",
    },
  ];

  for (const u of usersData) {
    const user = await prisma.systemUser.create({ data: u });
    const firstWhId = Object.values(whMap)[0];
    if (firstWhId) {
      await prisma.userWarehouse.create({
        data: { userId: user.id, warehouseId: firstWhId },
      });
    }
  }

  // 4. Units
  console.log("Creating Units...");
  await prisma.unit.deleteMany();
  const unitsData = [
    { name: "Kilograms (กิโลกรัม)", shortName: "kg", status: "ACTIVE" },
    { name: "Metric Tons (เมตริกตัน)", shortName: "t", status: "ACTIVE" },
    { name: "Sacks 25kg (กระสอบ 25 กก.)", shortName: "sack", status: "ACTIVE" },
    { name: "Packs (แพ็ค / ห่อ)", shortName: "pk", status: "ACTIVE" },
    { name: "Bundles (มัด / แหนบ)", shortName: "bdl", status: "ACTIVE" },
    { name: "Rolls (ม้วนฟิล์ม)", shortName: "rl", status: "ACTIVE" },
    { name: "Cartons (กล่อง / ลัง)", shortName: "ctn", status: "ACTIVE" },
    { name: "Pieces (ใบ / ชิ้น)", shortName: "pcs", status: "ACTIVE" },
  ];

  const unitMap: Record<string, string> = {};
  for (const u of unitsData) {
    const created = await prisma.unit.create({ data: u });
    unitMap[u.shortName] = created.id;
  }

  // 5. Brands
  console.log("Creating Brands...");
  await prisma.brand.deleteMany();
  const brandsData = [
    { name: "SCGC (เอสซีจี เคมิคอลส์)", slug: "scgc", status: "ACTIVE" },
    { name: "PTT GC (พีทีที โกลบอล เคมิคอล)", slug: "ptt-gc", status: "ACTIVE" },
    { name: "IRPC (ไออาร์พีซี)", slug: "irpc", status: "ACTIVE" },
    { name: "TPI Polene (ทีพีไอ โพลีน)", slug: "tpi-polene", status: "ACTIVE" },
    { name: "BASF (บีเอเอสเอฟ)", slug: "basf", status: "ACTIVE" },
    { name: "KingBag (ตรา ราชาถุง)", slug: "kingbag", status: "ACTIVE" },
    { name: "EcoPoly (ตรา อีโค่โพลี)", slug: "ecopoly", status: "ACTIVE" },
    { name: "SiamStretch (สยามสเตรทช์)", slug: "siamstretch", status: "ACTIVE" },
    { name: "PolyTech (โพลีเทค)", slug: "polytech", status: "ACTIVE" },
    { name: "Thai Color Masterbatch", slug: "thai-color", status: "ACTIVE" },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    brandMap[b.name] = created.id;
  }

  // 6. Warranties
  console.log("Creating Warranties...");
  await prisma.warranty.deleteMany();
  const warrantiesData = [
    { name: "รับประกันคุณภาพมาตรฐาน มอก.", description: "รับรองเม็ดพลาสติกบริสุทธิ์และเนื้อฟิล์มเหนียวตาม มอก.", duration: "1 Year", status: "ACTIVE" },
    { name: "รับประกันรอยซีลไม่รั่วซึม", description: "รับประกันก้นถุงซีลแน่น ไม่แตกฉีกขาดเมื่อบรรจุตามน้ำหนักที่กำหนด", duration: "6 Months", status: "ACTIVE" },
    { name: "Food Grade Safety Guarantee", description: "รับรองความปลอดภัยสัมผัสอาหารโดยตรง ปลอดสารก่อมะเร็ง BPA Free", duration: "1 Year", status: "ACTIVE" },
    { name: "เปลี่ยนคืนกรณีซีลแตกชำรุด", description: "เคลมเปลี่ยนแพ็คใหม่ทันทีหากพบตำหนิจากกระบวนการผลิตภายใน 30 วัน", duration: "30 Days", status: "ACTIVE" },
  ];
  for (const w of warrantiesData) {
    await prisma.warranty.create({ data: w });
  }

  // 7. Variant Attributes
  console.log("Creating Variant Attributes...");
  await prisma.variantAttribute.deleteMany();
  const attributesData = [
    { name: "Size (ขนาดถุงหูหิ้ว)", values: "6x14 นิ้ว, 8x16 นิ้ว, 9x18 นิ้ว, 12x20 นิ้ว", status: "ACTIVE" },
    { name: "Size (ขนาดถุงร้อนใส PP)", values: "4.5x7 นิ้ว, 5x8 นิ้ว, 6x9 นิ้ว, 7x11 นิ้ว, 8x12 นิ้ว", status: "ACTIVE" },
    { name: "Size (ขนาดถุงขยะดำ)", values: "18x20 นิ้ว, 24x28 นิ้ว, 28x36 นิ้ว, 30x40 นิ้ว, 36x45 นิ้ว", status: "ACTIVE" },
    { name: "Size (ขนาดถุงซิปล็อค)", values: "6x8 ซม., 10x15 ซม., 15x23 ซม., 20x30 ซม.", status: "ACTIVE" },
    { name: "Thickness (ความหนาฟิล์มยืด)", values: "15 ไมครอน, 17 ไมครอน, 20 ไมครอน", status: "ACTIVE" },
    { name: "Color (สีถุงและเม็ด)", values: "ขาวขุ่น (Natural), ใส (Clear), ดำ (Black), แดง (Red), เขียว (Green), เหลือง (Yellow), น้ำเงิน (Blue)", status: "ACTIVE" },
  ];
  for (const a of attributesData) {
    await prisma.variantAttribute.create({ data: a });
  }

  // 8. Categories & SubCategories
  console.log("Creating Categories & SubCategories...");
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();

  const categories = [
    {
      name: "วัตถุดิบเม็ดพลาสติก (Plastic Resins)",
      slug: "plastic-resins",
      description: "เม็ดพลาสติกบริสุทธิ์และรีไซเคิล สำหรับงานเป่าฟิล์มและหล่อขึ้นรูป",
      subCategories: [
        { name: "เม็ดพลาสติก HDPE (ฟิล์มเหนียวกรอบ)", slug: "sub-hdpe", code: "SUB-HDPE" },
        { name: "เม็ดพลาสติก LDPE (ฟิล์มนิ่มยืดหยุ่น)", slug: "sub-ldpe", code: "SUB-LDPE" },
        { name: "เม็ดพลาสติก PP (ฟิล์มใสทนความร้อน)", slug: "sub-pp", code: "SUB-PP" },
        { name: "เม็ดพลาสติกรีไซเคิล PCR/PIR", slug: "sub-pcr", code: "SUB-PCR" },
        { name: "เม็ดพลาสติกชีวภาพย่อยสลายได้ (Bio Resin)", slug: "sub-bio-resin", code: "SUB-BIO-RESIN" },
      ],
    },
    {
      name: "เม็ดสีและสารเติมแต่ง (Masterbatch & Additives)",
      slug: "masterbatch-additives",
      description: "เม็ดแม่สีผสมพลาสติก สารกันลื่น และสารย่อยสลายทางชีวภาพ",
      subCategories: [
        { name: "เม็ดแม่สีขาว / ดำ / สีต่างๆ (Color Masterbatch)", slug: "sub-color-mb", code: "SUB-COLOR-MB" },
        { name: "สารกันลื่นและกันฟิล์มติด (Slip Agent)", slug: "sub-slip", code: "SUB-SLIP" },
        { name: "สารกันรังสี UV (UV Stabilizer)", slug: "sub-uv", code: "SUB-UV" },
        { name: "สารช่วยย่อยสลายชีวภาพ (Bio Additives)", slug: "sub-bio", code: "SUB-BIO" },
      ],
    },
    {
      name: "ถุงหูหิ้วและถุงช้อปปิ้ง (T-Shirt & Shopping Bags)",
      slug: "t-shirt-shopping-bags",
      description: "ถุงหูหิ้ว HDPE คุณภาพสูง สำหรับร้านค้า ซูเปอร์มาร์เก็ต และห้างสรรพสินค้า",
      subCategories: [
        { name: "ถุงหูหิ้วขาวขุ่น HDPE เกรด A", slug: "sub-tshirt-white", code: "SUB-TSHIRT-WHITE" },
        { name: "ถุงหูหิ้วสีและพิมพ์ลาย", slug: "sub-tshirt-print", code: "SUB-TSHIRT-PRINT" },
        { name: "ถุงหูเจาะแฟชั่น PE", slug: "sub-die-cut", code: "SUB-DIE-CUT" },
        { name: "ถุงช้อปปิ้งย่อยสลายได้ 100% (Compostable)", slug: "sub-compostable-bag", code: "SUB-COMPOST" },
      ],
    },
    {
      name: "ถุงบรรจุภัณฑ์อาหาร (Food Packaging Bags)",
      slug: "food-packaging-bags",
      description: "ถุงร้อนใส ถุงเย็นแช่แข็ง และถุงซิปล็อค เกรดปลอดภัยสัมผัสอาหาร",
      subCategories: [
        { name: "ถุงร้อนใส PP (ถุงแกง)", slug: "sub-hotbag-pp", code: "SUB-HOTBAG-PP" },
        { name: "ถุงเย็นใส LDPE (ถุงแช่แข็ง)", slug: "sub-coldbag-ld", code: "SUB-COLDBAG-LD" },
        { name: "ถุงซิปล็อคใส LDPE Food Grade", slug: "sub-zipper", code: "SUB-ZIPPER" },
        { name: "ซองซีลสูญญากาศ Nylon/PE", slug: "sub-vacuum", code: "SUB-VACUUM" },
      ],
    },
    {
      name: "ถุงขยะและถุงอุตสาหกรรม (Trash & Heavy Bags)",
      slug: "trash-heavy-bags",
      description: "ถุงขยะดำมาตรฐาน ถุงขยะติดเชื้อโรงพยาบาล และถุงบรรจุสินค้าหนัก",
      subCategories: [
        { name: "ถุงขยะดำรีไซเคิลมาตรฐาน", slug: "sub-trash-black", code: "SUB-TRASH-BLACK" },
        { name: "ถุงขยะติดเชื้อสีแดง (Hospital)", slug: "sub-trash-red", code: "SUB-TRASH-RED" },
        { name: "ถุงขยะแยกประเภทสี (เขียว/เหลือง/น้ำเงิน)", slug: "sub-trash-color", code: "SUB-TRASH-COLOR" },
        { name: "ถุงเพาะชำการเกษตรและงานหนัก", slug: "sub-nursery-heavy", code: "SUB-NURSERY" },
      ],
    },
    {
      name: "ม้วนฟิล์มและฟิล์มยืด (Stretch & Roll Films)",
      slug: "stretch-roll-films",
      description: "ฟิล์มยืดพันพาเลทอุตสาหกรรม และฟิล์มหดหุ้มสินค้า",
      subCategories: [
        { name: "ฟิล์มยืดพันพาเลท (Pallet Stretch Film)", slug: "sub-stretch-pallet", code: "SUB-STRETCH-PALLET" },
        { name: "ฟิล์มหดหุ้มสินค้า (POF Shrink Film)", slug: "sub-shrink-film", code: "SUB-SHRINK" },
      ],
    },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const createdCat = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        status: "ACTIVE",
      },
    });
    catMap[c.slug] = createdCat.id;

    for (const sub of c.subCategories) {
      await prisma.subCategory.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          code: sub.code,
          categoryId: createdCat.id,
          description: `${sub.name} ในหมวด ${c.name}`,
          status: "ACTIVE",
        },
      });
    }
  }

  // 9. Suppliers
  console.log("Creating Suppliers...");
  await prisma.supplier.deleteMany();
  const suppliersData = [
    {
      name: "บริษัท เอสซีจี เคมิคอลส์ จำกัด (มหาชน)",
      code: "SUP-SCGC",
      email: "order@scgchemicals.com",
      phone: "+66 2 586 1111",
      address: "1 ถ.ปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท พีทีที โกลบอล เคมิคอล จำกัด (มหาชน)",
      code: "SUP-PTTGC",
      email: "polymersales@pttgcgroup.com",
      phone: "+66 2 265 8400",
      address: "555/1 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ อาคาร A ถ.วิภาวดีรังสิต จตุจักร กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท ไออาร์พีซี จำกัด (มหาชน)",
      code: "SUP-IRPC",
      email: "contact@irpc.co.th",
      phone: "+66 2 765 7000",
      address: "555/2 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ อาคาร B ชั้น 6 จตุจักร กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท ไทยคัลเลอร์มาสเตอร์แบทช์ จำกัด",
      code: "SUP-THAICOLOR",
      email: "sales@thaicolormb.com",
      phone: "+66 2 709 3322",
      address: "นิคมอุตสาหกรรมบางปู ซอย 11 ต.บางปูใหม่ อ.เมือง จ.สมุทรปราการ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท บีเอเอสเอฟ (ไทย) จำกัด",
      code: "SUP-BASF",
      email: "info-thailand@basf.com",
      phone: "+66 2 624 1999",
      address: "อาคารเอ็มโพเรี่ยม ทาวเวอร์ ชั้น 23 ถ.สุขุมวิท คลองเตย กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
  ];

  const suppMap: Record<string, string> = {};
  for (const sup of suppliersData) {
    const created = await prisma.supplier.create({ data: sup });
    suppMap[sup.code] = created.id;
  }

  // 10. Customers
  console.log("Creating Customers...");
  await prisma.customer.deleteMany();
  const customersData = [
    {
      name: "บริษัท สยามแม็คโคร จำกัด (มหาชน)",
      code: "CUST-MAKRO",
      email: "procurement@siammakro.co.th",
      phone: "+66 2 067 8999",
      address: "1468 ถ.พัฒนาการ แขวงพัฒนาการ เขตสวนหลวง กรุงเทพฯ 10250",
      city: "กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)",
      code: "CUST-BIGC",
      email: "packaging@bigc.co.th",
      phone: "+66 2 655 0666",
      address: "88/9 ซอยสมานฉันท์-บาร์โบส แขวงพระโขนง เขตคลองเตย กรุงเทพฯ",
      city: "กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "ห้างหุ้นส่วนจำกัด เอกชัยบรรจุภัณฑ์ (ตลาดไท)",
      code: "CUST-EKACHAI",
      email: "ekachai.pkg@gmail.com",
      phone: "+66 81 888 7766",
      address: "ตลาดไท โซนพลาซ่า 2 ต.คลองสอง อ.คลองหลวง จ.ปทุมธานี",
      city: "ปทุมธานี",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท เจริญโภคภัณฑ์อาหาร จำกัด (มหาชน)",
      code: "CUST-CPF",
      email: "purchase-pkg@cpf.co.th",
      phone: "+66 2 766 8000",
      address: "313 อาคารซี.พี.ทาวเวอร์ ถ.สีลม บางรัก กรุงเทพฯ",
      city: "กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "โรงพยาบาลศิริราช (Siriraj Hospital)",
      code: "CUST-SIRIRAJ",
      email: "supply@sirirajhospital.org",
      phone: "+66 2 419 7000",
      address: "2 ถ.วังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700",
      city: "กรุงเทพฯ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "บริษัท ไทยซัมมิท อินดัสทรี จำกัด",
      code: "CUST-THAISUMMIT",
      email: "purchasing@thaisummit.co.th",
      phone: "+66 2 325 8000",
      address: "นิคมอุตสาหกรรมบางพลี จ.สมุทรปราการ",
      city: "สมุทรปราการ",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "Walk-in Customer (ลูกค้ารายย่อยหน้าร้าน)",
      code: "CUST-WALKIN",
      email: "walkin@siampolypack.com",
      phone: "+66 80 000 0000",
      address: "หน้าร้านศูนย์กระจายสินค้า พระราม 2",
      city: "สมุทรสาคร",
      country: "Thailand",
      status: "ACTIVE",
    },
  ];

  const custMap: Record<string, string> = {};
  for (const c of customersData) {
    const created = await prisma.customer.create({ data: c });
    custMap[c.code] = created.id;
  }

  // 11. Billers
  console.log("Creating Billers...");
  await prisma.biller.deleteMany();
  const billersData = [
    {
      name: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด (สำนักงานใหญ่)",
      code: "BIL-HQ",
      email: "billing@siampolypack.com",
      phone: "+66 2 890 1234",
      address: "88/18 หมู่ 4 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง จ.สมุทรสาคร 74000",
      country: "Thailand",
      status: "ACTIVE",
    },
    {
      name: "สาขา ตลาดไท ศูนย์บรรจุภัณฑ์",
      code: "BIL-TALAADTHAI",
      email: "billing-tt@siampolypack.com",
      phone: "+66 2 529 8890",
      address: "ตลาดไท โซนพลาซ่า อ.คลองหลวง จ.ปทุมธานี",
      country: "Thailand",
      status: "ACTIVE",
    },
  ];
  for (const b of billersData) {
    await prisma.biller.create({ data: b });
  }

  // Expense Categories
  console.log("Creating Expense Categories...");
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  const expCats = [
    { name: "ค่าสาธารณูปโภคโรงงาน (Electricity & Water)", code: "EXP-UTIL" },
    { name: "ค่าซ่อมบำรุงเครื่องจักร (Machine Maintenance)", code: "EXP-MAINT" },
    { name: "ค่าขนส่งและโลจิสติกส์ (Freight & Logistics)", code: "EXP-LOGIS" },
    { name: "ค่าวัสดุสิ้นเปลืองและบรรจุภัณฑ์ (Supplies & Packaging)", code: "EXP-SUPPLY" },
    { name: "ค่าตรวจรับรองมาตรฐาน (Lab & Certification)", code: "EXP-CERT" },
  ];
  const expCatMap: Record<string, string> = {};
  for (const ec of expCats) {
    const created = await prisma.expenseCategory.create({ data: ec });
    expCatMap[ec.code] = created.id;
  }

  console.log("Cleaning old transactions and products...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.workOrderMaterial.deleteMany();
  await prisma.productionScrap.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.bomItem.deleteMany();
  await prisma.billOfMaterial.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.billingNoteItem.deleteMany();
  await prisma.billingNote.deleteMany();
  await prisma.taxInvoice.deleteMany();
  await prisma.withholdingTax.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.productExpiryBatch.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  const rmWhId = whMap["คลังวัตถุดิบเม็ดพลาสติก A (RM-01)"];
  const fg1WhId = whMap["คลังสินค้าสำเร็จรูป 1 (FG-01)"];
  const fg2WhId = whMap["คลังสินค้าสำเร็จรูป 2 (FG-02)"];
  const rcWhId = whMap["คลังเศษพลาสติกรีไซเคิล (RC-01)"];
  const mainStoreId = storeMap["ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2"];

  // 12. Create Comprehensive Products (~28 Products)
  console.log("Seeding Comprehensive Products (~28 Products across all statuses)...");

  const allProductsData: any[] = [
    // ----------------------------------------------------
    // Group 1: Raw Materials & Polymers
    // ----------------------------------------------------
    {
      name: "เม็ดพลาสติก HDPE เป่าฟิล์ม SCG H6140B",
      sku: "RM-HDPE-6140",
      barcode: "8859011000101",
      productType: "SINGLE",
      price: 48.0,
      costPrice: 42.0,
      stock: 25000,
      minStockAlert: 5000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["SCGC (เอสซีจี เคมิคอลส์)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-01.jpg",
      description: "เม็ดพลาสติก HDPE เกรดเป่าฟิล์ม ความหนาแน่นสูง ทนแรงดึงดีเยี่ยม สำหรับผลิตถุงหูหิ้วและถุงช้อปปิ้ง",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-10-10"),
      expiredDate: new Date("2027-10-10"),
      batches: [
        { batchNo: "LOT-SCG-2510", manufacturedDate: new Date("2025-10-10"), expiredDate: new Date("2027-10-10"), quantity: 15000, costPrice: 41.5, notes: "ล็อตนำเข้าปลายปี 2025" },
        { batchNo: "LOT-SCG-2601", manufacturedDate: new Date("2026-01-15"), expiredDate: new Date("2028-01-15"), quantity: 10000, costPrice: 42.5, notes: "ล็อตเสริมต้นปี 2026" },
      ],
    },
    {
      name: "เม็ดพลาสติก LDPE ฟิล์มใสเหนียว PTT LD2420D",
      sku: "RM-LDPE-2420",
      barcode: "8859011000200",
      productType: "SINGLE",
      price: 52.0,
      costPrice: 45.0,
      stock: 18000,
      minStockAlert: 3000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["PTT GC (พีทีที โกลบอล เคมิคอล)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-02.jpg",
      description: "เม็ดพลาสติก LDPE เกรดพรีเมียม ให้ฟิล์มใส ผิวนิ่ม เหนียว ยืดหยุ่นดี สำหรับถุงเย็นและถุงซิป",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-11-15"),
      expiredDate: new Date("2027-11-15"),
      batches: [
        { batchNo: "LOT-PTT-2511", manufacturedDate: new Date("2025-11-15"), expiredDate: new Date("2027-11-15"), quantity: 18000, costPrice: 45.0, notes: "เกรดส่งออกฟิล์มใส" },
      ],
    },
    {
      name: "เม็ดพลาสติก PP ถุงร้อนใส IRPC 1100NK",
      sku: "RM-PP-1100",
      barcode: "8859011000309",
      productType: "SINGLE",
      price: 50.0,
      costPrice: 43.5,
      stock: 20000,
      minStockAlert: 4000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["IRPC (ไออาร์พีซี)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-03.jpg",
      description: "เม็ดโพลีโพรพีลีน PP ใสพิเศษ ทนความร้อนได้สูงถึง 100°C สำหรับผลิตถุงแกงและถุงใส่อาหารร้อน",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-12-01"),
      expiredDate: new Date("2027-12-01"),
      batches: [
        { batchNo: "LOT-IRPC-2512", manufacturedDate: new Date("2025-12-01"), expiredDate: new Date("2027-12-01"), quantity: 20000, costPrice: 43.5, notes: "เกรดฟู้ดเกรดใสเงา" },
      ],
    },
    {
      name: "เม็ดพลาสติกรีไซเคิล PCR สีดำ (Post-Consumer Resin)",
      sku: "RM-PCR-BLACK",
      barcode: "8859011000408",
      productType: "SINGLE",
      price: 28.0,
      costPrice: 22.0,
      stock: 15000,
      minStockAlert: 2000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["kg"],
      warehouseId: rcWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-04.jpg",
      description: "เม็ดพลาสติกรีไซเคิล 100% ผ่านการคัดแยก ล้างสะอาด และหลอมเม็ด สำหรับผลิตถุงขยะดำ",
      status: "ACTIVE",
    },
    {
      name: "เม็ดพลาสติก LLDPE PTT 0209AA สำหรับฟิล์มยืด",
      sku: "RM-LLDPE-0209",
      barcode: "8859011000552",
      productType: "SINGLE",
      price: 49.0,
      costPrice: 43.0,
      stock: 22000,
      minStockAlert: 4000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["PTT GC (พีทีที โกลบอล เคมิคอล)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-05.jpg",
      description: "เม็ดโพลีเอทิลีนความหนาแน่นต่ำเชิงเส้น ทนต่อแรงทิ่มทะลุสูงมาก เหมาะสำหรับผลิตฟิล์มยืดพันพาเลท",
      status: "ACTIVE",
    },
    // Expiring Soon Raw Material
    {
      name: "เม็ดพลาสติกชีวภาพ PBAT/PLA (Bio-Resin ย่อยสลายได้)",
      sku: "RM-BIO-RESIN",
      barcode: "8859011000651",
      productType: "SINGLE",
      price: 135.0,
      costPrice: 115.0,
      stock: 4000,
      minStockAlert: 1000,
      categoryId: catMap["plastic-resins"],
      brandId: brandMap["BASF (บีเอเอสเอฟ)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-06.jpg",
      description: "เม็ดพลาสติกชีวภาพ ย่อยสลายเป็นปุ๋ยอินทรีย์ได้ 100% ภายใน 180 วันตามมาตรฐานสากล (มีอายุ Shelf Life สั้น)",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-03-15"),
      expiredDate: new Date("2026-03-20"), // Expiring Soon (< 45 days)
      batches: [
        { batchNo: "LOT-BIO-2503", manufacturedDate: new Date("2025-03-15"), expiredDate: new Date("2026-03-20"), quantity: 4000, costPrice: 115.0, notes: "ใกล้หมดอายุ ต้องเร่งจัดคิวผลิตถุงรักษ์โลก" },
      ],
    },

    // ----------------------------------------------------
    // Group 2: Masterbatch & Chemical Additives
    // ----------------------------------------------------
    {
      name: "เม็ดแม่สีขาว White Masterbatch (TiO2 70%)",
      sku: "MB-WHITE-01",
      barcode: "8859011000705",
      productType: "SINGLE",
      price: 95.0,
      costPrice: 80.0,
      stock: 3500,
      minStockAlert: 500,
      categoryId: catMap["masterbatch-additives"],
      brandId: brandMap["Thai Color Masterbatch"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-07.jpg",
      description: "เม็ดแม่สีขาวเข้มข้น ความทึบแสงสูง กระจายตัวในเนื้อฟิล์มได้ดี ไม่เป็นจุดด่าง",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-06-20"),
      expiredDate: new Date("2027-06-20"),
    },
    // Expired Masterbatch (สำหรับทดสอบรายงานหมดอายุ)
    {
      name: "เม็ดแม่สีแดง Red Masterbatch (เกรดถุงขยะติดเชื้อ)",
      sku: "MB-RED-01",
      barcode: "8859011000750",
      productType: "SINGLE",
      price: 115.0,
      costPrice: 95.0,
      stock: 500,
      minStockAlert: 200,
      categoryId: catMap["masterbatch-additives"],
      brandId: brandMap["Thai Color Masterbatch"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-08.jpg",
      description: "เม็ดแม่สีแดงสด สำหรับผสมเป่าถุงขยะติดเชื้อโรงพยาบาล (ล็อตนี้ค้างสต็อก หมดอายุแล้ว)",
      status: "ACTIVE",
      manufacturedDate: new Date("2024-01-10"),
      expiredDate: new Date("2026-01-10"), // Expired!
      batches: [
        { batchNo: "LOT-RED-2401", manufacturedDate: new Date("2024-01-10"), expiredDate: new Date("2026-01-10"), quantity: 500, costPrice: 95.0, notes: "หมดอายุแล้ว ต้องตั้งพักรอกรรมวิธีทำลาย/เคลม" },
      ],
    },
    {
      name: "เม็ดแม่สีน้ำเงิน Blue Masterbatch",
      sku: "MB-BLUE-01",
      barcode: "8859011000804",
      productType: "SINGLE",
      price: 110.0,
      costPrice: 90.0,
      stock: 1500,
      minStockAlert: 300,
      categoryId: catMap["masterbatch-additives"],
      brandId: brandMap["Thai Color Masterbatch"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-09.jpg",
      description: "เม็ดแม่สีน้ำเงินเข้มข้น สำหรับถุงช้อปปิ้งและถุงขยะทั่วไป",
      status: "ACTIVE",
    },
    {
      name: "สารกันลื่น Slip Agent (Erucamide เปิดปากถุงง่าย)",
      sku: "ADD-SLIP-01",
      barcode: "8859011000859",
      productType: "SINGLE",
      price: 180.0,
      costPrice: 150.0,
      stock: 800,
      minStockAlert: 100,
      categoryId: catMap["masterbatch-additives"],
      brandId: brandMap["BASF (บีเอเอสเอฟ)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-10.jpg",
      description: "สารเติมแต่งช่วยลดแรงเสียดทาน ทำให้ปากถุงเปิดง่าย ซ้อนทับกันไม่เหนียวติด",
      status: "ACTIVE",
    },
    // Low Stock Additive (สำหรับทดสอบแจ้งเตือนสต็อกต่ำ)
    {
      name: "สารกันรังสี UV Stabilizer ฟิล์มการเกษตร",
      sku: "ADD-UV-01",
      barcode: "8859011000903",
      productType: "SINGLE",
      price: 320.0,
      costPrice: 270.0,
      stock: 2, // Low stock! (Threshold is 20)
      minStockAlert: 20,
      categoryId: catMap["masterbatch-additives"],
      brandId: brandMap["BASF (บีเอเอสเอฟ)"],
      unitId: unitMap["kg"],
      warehouseId: rmWhId,
      storeId: mainStoreId,
      image: "/assets/images/product-11.jpg",
      description: "สารป้องกันรังสีอัลตราไวโอเลต ช่วยยืดอายุฟิล์มโรงเรือนและถุงเพาะชำกลางแจ้ง (สต็อกเหลือน้อยมาก)",
      status: "ACTIVE",
    },

    // ----------------------------------------------------
    // Group 3: Industrial Films & Single Finished Goods
    // ----------------------------------------------------
    {
      name: "ฟิล์มยืดพันพาเลท 17 ไมครอน กว้าง 50 ซม. ตรา SiamStretch",
      sku: "FG-STR-17UM",
      barcode: "8859022000100",
      productType: "SINGLE",
      price: 240.0,
      costPrice: 175.0,
      stock: 1200,
      minStockAlert: 200,
      categoryId: catMap["stretch-roll-films"],
      brandId: brandMap["SiamStretch (สยามสเตรทช์)"],
      unitId: unitMap["rl"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-12.jpg",
      description: "ฟิล์มยืด LLDPE เกรดพันพาเลท ยืดตัวได้ถึง 300% เหนียว ไม่ฉีกขาดง่าย เกาะติดแน่น",
      status: "ACTIVE",
    },
    {
      name: "ฟิล์มหดหุ้มสินค้า POF Shrink Film 19 ไมครอน",
      sku: "FG-SHRINK-19UM",
      barcode: "8859022000155",
      productType: "SINGLE",
      price: 850.0,
      costPrice: 620.0,
      stock: 450,
      minStockAlert: 80,
      categoryId: catMap["stretch-roll-films"],
      brandId: brandMap["SiamStretch (สยามสเตรทช์)"],
      unitId: unitMap["rl"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-01.jpg",
      description: "ฟิล์มหดความร้อน POF ใสเงาเป็นพิเศษ ปลอดสารพิษ สัมผัสอาหารได้ สำหรับแพ็คโหลขวดน้ำและกล่องสินค้า",
      status: "ACTIVE",
    },
    {
      name: "ถุงขยะติดเชื้อสีแดง 24x28 นิ้ว หนาพิเศษ (รพ.ศิริราช)",
      sku: "FG-MED-TRASH-RED",
      barcode: "8859022000209",
      productType: "SINGLE",
      price: 65.0,
      costPrice: 42.0,
      stock: 850,
      minStockAlert: 150,
      categoryId: catMap["trash-heavy-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pk"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-02.jpg",
      description: "ถุงขยะมูลฝอยติดเชื้อ สีแดงสว่าง พิมพ์สัญลักษณ์ Biohazard สากล ก้นซีล Star Seal ป้องกันการรั่วซึม 100%",
      status: "ACTIVE",
      manufacturedDate: new Date("2026-01-20"),
      expiredDate: new Date("2029-01-20"),
      batches: [
        { batchNo: "LOT-MED-2601", manufacturedDate: new Date("2026-01-20"), expiredDate: new Date("2029-01-20"), quantity: 500, costPrice: 42.0, notes: "ผลิตตามสเปก รพ.ศิริราช" },
        { batchNo: "LOT-MED-2602", manufacturedDate: new Date("2026-02-10"), expiredDate: new Date("2029-02-10"), quantity: 350, costPrice: 42.0, notes: "รอบส่งมอบเดือนกุมภาพันธ์" },
      ],
    },
    // Low Stock Alert Item
    {
      name: "ถุงขยะสีเขียวสำหรับขยะเปียกอินทรีย์ 24x28 นิ้ว",
      sku: "FG-TRASH-GREEN",
      barcode: "8859022000308",
      productType: "SINGLE",
      price: 45.0,
      costPrice: 30.0,
      stock: 4, // Low stock! (Threshold is 50)
      minStockAlert: 50,
      categoryId: catMap["trash-heavy-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pk"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-03.jpg",
      description: "ถุงขยะคัดแยกประเภท สีเขียวสดใส สำหรับขยะเปียกและเศษอาหาร ย่อยสลายตามธรรมชาติได้",
      status: "ACTIVE",
    },
    // Out of Stock Item (เพื่อทดสอบสถานะ Out of Stock)
    {
      name: "ถุงขยะสีเหลืองสำหรับขยะรีไซเคิล 30x40 นิ้ว",
      sku: "FG-TRASH-YELLOW",
      barcode: "8859022000353",
      productType: "SINGLE",
      price: 82.0,
      costPrice: 55.0,
      stock: 0, // Out of Stock!
      minStockAlert: 40,
      categoryId: catMap["trash-heavy-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pk"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-04.jpg",
      description: "ถุงขยะคัดแยกสีเหลือง ความจุ 90 ลิตร สำหรับคัดแยกขยะรีไซเคิล (สินค้าหมดชั่วคราว อยู่ระหว่างคิวผลิต)",
      status: "OUT_OF_STOCK",
    },
    {
      name: "ถุงเพาะชำต้นไม้ สีดำเจาะรูระบายน้ำ 4x8 นิ้ว",
      sku: "FG-NURSERY-48",
      barcode: "8859022000407",
      productType: "SINGLE",
      price: 0.85,
      costPrice: 0.45,
      stock: 12000,
      minStockAlert: 2000,
      categoryId: catMap["trash-heavy-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pcs"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-05.jpg",
      description: "ถุงเพาะกล้าไม้ PE สีดำผสมสารกันแดด ไม่กรอบแตกง่ายเมื่อตากแดด เจาะรูระบายน้ำรอบตัว",
      status: "ACTIVE",
    },
    {
      name: "ถุงช้อปปิ้งย่อยสลายได้ 100% Compostable 8x16 นิ้ว",
      sku: "FG-BIO-BAG-01",
      barcode: "8859022000506",
      productType: "SINGLE",
      price: 75.0,
      costPrice: 52.0,
      stock: 600,
      minStockAlert: 100,
      categoryId: catMap["t-shirt-shopping-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-06.jpg",
      description: "ถุงช้อปปิ้งรักษ์โลก ผลิตจากแป้งข้าวโพดและ PBAT ย่อยสลายตามธรรมชาติได้ 100% เป็นมิตรต่อสิ่งแวดล้อม",
      status: "ACTIVE",
      manufacturedDate: new Date("2025-09-01"),
      expiredDate: new Date("2026-03-01"), // Expiring soon
      batches: [
        { batchNo: "LOT-BIOBAG-2509", manufacturedDate: new Date("2025-09-01"), expiredDate: new Date("2026-03-01"), quantity: 600, costPrice: 52.0, notes: "รอบผลิตส่งห้างสรรพสินค้า" },
      ],
    },
    {
      name: "ซองซีลสูญญากาศ Nylon/PE ถนอมอาหาร 7x10 นิ้ว",
      sku: "FG-VACUUM-710",
      barcode: "8859022000605",
      productType: "SINGLE",
      price: 120.0,
      costPrice: 85.0,
      stock: 2200,
      minStockAlert: 300,
      categoryId: catMap["food-packaging-bags"],
      brandId: brandMap["PolyTech (โพลีเทค)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-07.jpg",
      description: "ซองสูญญากาศลามิเนต 2 ชั้น ทนความเย็นเยือกแข็ง -40°C และต้มในน้ำร้อนได้ ซีลปิดแน่นสนิท อากาศไม่ซึมผ่าน",
      status: "ACTIVE",
    },
    {
      name: "ถุงเย็นใส LDPE เกรดแช่แข็ง 8x12 นิ้ว ตรา KingBag",
      sku: "FG-COLD-LD-812",
      barcode: "8859022000704",
      productType: "SINGLE",
      price: 52.0,
      costPrice: 36.0,
      stock: 3800,
      minStockAlert: 500,
      categoryId: catMap["food-packaging-bags"],
      brandId: brandMap["KingBag (ตรา ราชาถุง)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-08.jpg",
      description: "ถุงใส่น้ำแข็งและอาหารแช่แข็ง เนื้อเหนียวนิ่ม ไม่แตกเปราะเมื่ออยู่ในช่องฟรีซ บรรจุแพ็ค 500 กรัม",
      status: "ACTIVE",
    },
    {
      name: "ถุงหูเจาะแฟชั่น PE ลายกราฟิก 10x14 นิ้ว",
      sku: "FG-DIECUT-1014",
      barcode: "8859022000803",
      productType: "SINGLE",
      price: 48.0,
      costPrice: 32.0,
      stock: 5000,
      minStockAlert: 600,
      categoryId: catMap["t-shirt-shopping-bags"],
      brandId: brandMap["KingBag (ตรา ราชาถุง)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-09.jpg",
      description: "ถุงหูเจาะรูปไข่ ผิวเนียนนุ่ม พิมพ์ลายกราฟิกสวยงาม เหมาะสำหรับร้านเสื้อผ้าและกิฟต์ช็อป",
      status: "ACTIVE",
    },

    // ----------------------------------------------------
    // Group 4: Variable Products (Matrix Combinations)
    // ----------------------------------------------------
    {
      name: "ถุงหูหิ้วขาวขุ่น HDPE เกรด A ตรา KingBag (แพ็ค 500g)",
      sku: "VAR-KB-TSHIRT",
      barcode: "8859033000100",
      productType: "VARIABLE",
      price: 45.0,
      costPrice: 32.0,
      stock: 9400,
      minStockAlert: 1000,
      categoryId: catMap["t-shirt-shopping-bags"],
      brandId: brandMap["KingBag (ตรา ราชาถุง)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-10.jpg",
      description: "ถุงหูหิ้วพลาสติก HDPE สีขาวขุ่น เหนียว ทนทาน ไม่ขาดง่าย หูหิ้วรับน้ำหนักได้มาก บรรจุแพ็คละ 500 กรัม",
      status: "ACTIVE",
      variants: [
        { name: "ถุงหูหิ้วขาวขุ่น ตรา KingBag 6x14 นิ้ว", sku: "VAR-KB-TS-0614", barcode: "8859033000117", attributes: JSON.stringify({ Size: "6x14 นิ้ว" }), price: 38.0, costPrice: 28.0, stock: 1500, minStockAlert: 200 },
        { name: "ถุงหูหิ้วขาวขุ่น ตรา KingBag 8x16 นิ้ว", sku: "VAR-KB-TS-0816", barcode: "8859033000124", attributes: JSON.stringify({ Size: "8x16 นิ้ว" }), price: 45.0, costPrice: 32.0, stock: 2800, minStockAlert: 400 },
        { name: "ถุงหูหิ้วขาวขุ่น ตรา KingBag 9x18 นิ้ว", sku: "VAR-KB-TS-0918", barcode: "8859033000131", attributes: JSON.stringify({ Size: "9x18 นิ้ว" }), price: 55.0, costPrice: 38.0, stock: 3200, minStockAlert: 500 },
        { name: "ถุงหูหิ้วขาวขุ่น ตรา KingBag 12x20 นิ้ว", sku: "VAR-KB-TS-1220", barcode: "8859033000148", attributes: JSON.stringify({ Size: "12x20 นิ้ว" }), price: 72.0, costPrice: 50.0, stock: 1900, minStockAlert: 300 },
      ],
    },
    {
      name: "ถุงร้อนใส PP เกรดบรรจุอาหาร ตรา KingBag (แพ็ค 500g)",
      sku: "VAR-KB-HOTBAG",
      barcode: "8859033000209",
      productType: "VARIABLE",
      price: 36.0,
      costPrice: 25.0,
      stock: 13600,
      minStockAlert: 1500,
      categoryId: catMap["food-packaging-bags"],
      brandId: brandMap["KingBag (ตรา ราชาถุง)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-11.jpg",
      description: "ถุงแกงใส PP ฟู้ดเกรด ทนความร้อนสูง น้ำแกงเดือดไม่หดตัว ใสเงาเห็นอาหารชัดเจน ปลอดสารก่อมะเร็ง",
      status: "ACTIVE",
      variants: [
        { name: "ถุงร้อนใส PP ตรา KingBag 4.5x7 นิ้ว", sku: "VAR-KB-HOT-457", barcode: "8859033000216", attributes: JSON.stringify({ Size: "4.5x7 นิ้ว" }), price: 26.0, costPrice: 18.0, stock: 2000, minStockAlert: 200 },
        { name: "ถุงร้อนใส PP ตรา KingBag 5x8 นิ้ว", sku: "VAR-KB-HOT-58", barcode: "8859033000223", attributes: JSON.stringify({ Size: "5x8 นิ้ว" }), price: 30.0, costPrice: 21.0, stock: 3500, minStockAlert: 400 },
        { name: "ถุงร้อนใส PP ตรา KingBag 6x9 นิ้ว", sku: "VAR-KB-HOT-69", barcode: "8859033000230", attributes: JSON.stringify({ Size: "6x9 นิ้ว" }), price: 36.0, costPrice: 25.0, stock: 4200, minStockAlert: 500 },
        { name: "ถุงร้อนใส PP ตรา KingBag 7x11 นิ้ว", sku: "VAR-KB-HOT-711", barcode: "8859033000247", attributes: JSON.stringify({ Size: "7x11 นิ้ว" }), price: 45.0, costPrice: 32.0, stock: 2100, minStockAlert: 300 },
        { name: "ถุงร้อนใส PP ตรา KingBag 8x12 นิ้ว", sku: "VAR-KB-HOT-812", barcode: "8859033000254", attributes: JSON.stringify({ Size: "8x12 นิ้ว" }), price: 54.0, costPrice: 38.0, stock: 1800, minStockAlert: 250 },
      ],
    },
    {
      name: "ถุงขยะดำรีไซเคิลมาตรฐาน ตรา EcoPoly (แพ็ค 1 kg)",
      sku: "VAR-ECO-TRASH",
      barcode: "8859033000308",
      productType: "VARIABLE",
      price: 55.0,
      costPrice: 36.0,
      stock: 8350,
      minStockAlert: 1000,
      categoryId: catMap["trash-heavy-bags"],
      brandId: brandMap["EcoPoly (ตรา อีโค่โพลี)"],
      unitId: unitMap["pk"],
      warehouseId: fg2WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-12.jpg",
      description: "ถุงขยะดำรักษ์โลก ผลิตจากเม็ดรีไซเคิล PCR เหนียวพิเศษ กลิ่นไม่ฉุน มีเชือกรัดปากถุงในตัว",
      status: "ACTIVE",
      variants: [
        { name: "ถุงขยะดำ EcoPoly 18x20 นิ้ว (ถุงเล็ก 11 ลิตร)", sku: "VAR-ECO-TR-1820", barcode: "8859033000315", attributes: JSON.stringify({ Size: "18x20 นิ้ว" }), price: 28.0, costPrice: 18.0, stock: 1200, minStockAlert: 200 },
        { name: "ถุงขยะดำ EcoPoly 24x28 นิ้ว (ถุงกลาง 36 ลิตร)", sku: "VAR-ECO-TR-2428", barcode: "8859033000322", attributes: JSON.stringify({ Size: "24x28 นิ้ว" }), price: 42.0, costPrice: 28.0, stock: 2500, minStockAlert: 300 },
        { name: "ถุงขยะดำ EcoPoly 28x36 นิ้ว (ถุงใหญ่ 54 ลิตร)", sku: "VAR-ECO-TR-2836", barcode: "8859033000339", attributes: JSON.stringify({ Size: "28x36 นิ้ว" }), price: 62.0, costPrice: 40.0, stock: 2100, minStockAlert: 300 },
        { name: "ถุงขยะดำ EcoPoly 30x40 นิ้ว (ถุงจัมโบ้ 90 ลิตร)", sku: "VAR-ECO-TR-3040", barcode: "8859033000346", attributes: JSON.stringify({ Size: "30x40 นิ้ว" }), price: 78.0, costPrice: 50.0, stock: 1600, minStockAlert: 250 },
        { name: "ถุงขยะดำ EcoPoly 36x45 นิ้ว (ถุงยักษ์ 120 ลิตร)", sku: "VAR-ECO-TR-3645", barcode: "8859033000353", attributes: JSON.stringify({ Size: "36x45 นิ้ว" }), price: 98.0, costPrice: 65.0, stock: 950, minStockAlert: 150 },
      ],
    },
    {
      name: "ถุงซิปล็อคใส LDPE Food Grade ตรา PolyTech",
      sku: "VAR-POLY-ZIP",
      barcode: "8859033000407",
      productType: "VARIABLE",
      price: 45.0,
      costPrice: 28.0,
      stock: 4600,
      minStockAlert: 600,
      categoryId: catMap["food-packaging-bags"],
      brandId: brandMap["PolyTech (โพลีเทค)"],
      unitId: unitMap["pk"],
      warehouseId: fg1WhId,
      storeId: mainStoreId,
      image: "/assets/images/product-01.jpg",
      description: "ถุงซิปใสเหนียวรางเดี่ยว รูดเปิด-ปิดสะดวก ป้องกันฝุ่นและความชื้น 100% สัมผัสอาหารได้ปลอดภัย",
      status: "ACTIVE",
      variants: [
        { name: "ถุงซิปล็อค PolyTech 6x8 ซม. (แพ็ค 100 ใบ)", sku: "VAR-ZIP-0608", barcode: "8859033000414", attributes: JSON.stringify({ Size: "6x8 ซม." }), price: 22.0, costPrice: 14.0, stock: 1200, minStockAlert: 150 },
        { name: "ถุงซิปล็อค PolyTech 10x15 ซม. (แพ็ค 100 ใบ)", sku: "VAR-ZIP-1015", barcode: "8859033000421", attributes: JSON.stringify({ Size: "10x15 ซม." }), price: 35.0, costPrice: 22.0, stock: 1600, minStockAlert: 200 },
        { name: "ถุงซิปล็อค PolyTech 15x23 ซม. (แพ็ค 100 ใบ)", sku: "VAR-ZIP-1523", barcode: "8859033000438", attributes: JSON.stringify({ Size: "15x23 ซม." }), price: 55.0, costPrice: 35.0, stock: 1100, minStockAlert: 150 },
        { name: "ถุงซิปล็อค PolyTech 20x30 ซม. (แพ็ค 100 ใบ)", sku: "VAR-ZIP-2030", barcode: "8859033000445", attributes: JSON.stringify({ Size: "20x30 ซม." }), price: 80.0, costPrice: 52.0, stock: 700, minStockAlert: 100 },
      ],
    },
  ];

  const productMap: Record<string, string> = {};

  for (const p of allProductsData) {
    const { batches, variants, ...prodData } = p;
    const created = await prisma.product.create({ data: prodData });
    productMap[p.sku] = created.id;

    // Handle variants if variable
    if (variants && variants.length > 0) {
      for (const v of variants) {
        const createdVariant = await prisma.productVariant.create({
          data: {
            productId: created.id,
            sku: v.sku,
            barcode: v.barcode,
            name: v.name,
            attributes: v.attributes,
            price: v.price,
            costPrice: v.costPrice,
            stock: v.stock,
            minStockAlert: v.minStockAlert,
            status: "ACTIVE",
          },
        });
        productMap[v.sku] = createdVariant.id;
      }
    }

    // Warehouse Stock
    await prisma.productStock.create({
      data: {
        productId: created.id,
        warehouseId: p.warehouseId,
        quantity: p.stock,
      },
    });

    // Stock Movement ledger
    await prisma.stockMovement.create({
      data: {
        productId: created.id,
        warehouseId: p.warehouseId,
        type: "INITIAL_STOCK",
        quantity: p.stock,
        balanceAfter: p.stock,
        unitCost: p.costPrice,
        referenceNo: `INIT-${p.sku}`,
        notes: `ยอดยกมาเริ่มต้นสินค้า ${p.name}`,
        createdBy: "Admin",
      },
    });

    // Batches
    if (batches && batches.length > 0) {
      for (const b of batches) {
        await prisma.productExpiryBatch.create({
          data: {
            productId: created.id,
            batchNo: b.batchNo,
            manufacturedDate: b.manufacturedDate,
            expiredDate: b.expiredDate,
            quantity: b.quantity,
            initialQuantity: b.quantity,
            costPrice: b.costPrice,
            notes: b.notes,
            status: new Date(b.expiredDate) < new Date() ? "EXPIRED" : "ACTIVE",
          },
        });
      }
    }
  }

  // 13. Manufacturing BOM & Work Orders
  console.log("Creating Bill of Materials (BOM) & Work Orders for Plastic Production...");
  const tShirtProdId = productMap["VAR-KB-TSHIRT"];
  const hotBagProdId = productMap["VAR-KB-HOTBAG"];
  const rmHdpeId = productMap["RM-HDPE-6140"];
  const rmPpId = productMap["RM-PP-1100"];
  const mbWhiteId = productMap["MB-WHITE-01"];
  const addSlipId = productMap["ADD-SLIP-01"];

  const bom1 = await prisma.billOfMaterial.create({
    data: {
      bomCode: "BOM-HDPE-TSHIRT-100KG",
      name: "สูตรผลิตถุงหูหิ้ว HDPE ขาวขุ่น (100 kg)",
      finishedProductId: tShirtProdId,
      outputQty: 100.0,
      unit: "kg",
      totalCost: 4200.0,
      laborCost: 350.0,
      overheadCost: 250.0,
      status: "ACTIVE",
      notes: "สัดส่วน: เม็ด HDPE 92% + สีขาว 5% + สารกันลื่น 3%",
      items: {
        create: [
          { rawMaterialId: rmHdpeId, quantity: 92.0 },
          { rawMaterialId: mbWhiteId, quantity: 5.0 },
          { rawMaterialId: addSlipId, quantity: 3.0 },
        ],
      },
    },
  });

  const bom2 = await prisma.billOfMaterial.create({
    data: {
      bomCode: "BOM-PP-HOTBAG-100KG",
      name: "สูตรผลิตถุงร้อนใส PP เกรดอาหาร (100 kg)",
      finishedProductId: hotBagProdId,
      outputQty: 100.0,
      unit: "kg",
      totalCost: 4500.0,
      laborCost: 400.0,
      overheadCost: 300.0,
      status: "ACTIVE",
      notes: "สัดส่วน: เม็ด PP ใส 98% + สารกันลื่น 2%",
      items: {
        create: [
          { rawMaterialId: rmPpId, quantity: 98.0 },
          { rawMaterialId: addSlipId, quantity: 2.0 },
        ],
      },
    },
  });

  await prisma.workOrder.create({
    data: {
      orderNo: "WO-2026-001",
      bomId: bom1.id,
      finishedProductId: tShirtProdId,
      targetQty: 1000.0,
      producedQty: 1000.0,
      scrapQty: 25.0,
      unit: "kg",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-03"),
      status: "COMPLETED",
      operator: "วิชัย เป่าฟิล์ม",
      machineNo: "Extruder Line #1 (เครื่องเป่าฟิล์ม HDPE)",
      warehouseId: fg1WhId,
      totalCost: 42000.0,
      notes: "ผลิตถุงหูหิ้วขาวขุ่นล็อตส่งแม็คโคร ส่งมอบเข้าคลังเรียบร้อย",
      materials: {
        create: [
          { rawMaterialId: rmHdpeId, plannedQty: 920.0, actualQty: 935.0, unitCost: 42.0 },
          { rawMaterialId: mbWhiteId, plannedQty: 50.0, actualQty: 50.0, unitCost: 80.0 },
          { rawMaterialId: addSlipId, plannedQty: 30.0, actualQty: 30.0, unitCost: 150.0 },
        ],
      },
      scraps: {
        create: [
          {
            scrapNo: "SCR-2026-001",
            scrapType: "EDGE_TRIM",
            materialName: "เศษฟิล์มริมม้วน HDPE (Edge Trim Scrap)",
            weightKg: 25.0,
            notes: "ตัดริมม้วนฟิล์ม ส่งลานบดรีไซเคิล RC-01 เพื่อหลอมเป็นเม็ด PCR",
            isRecycled: false,
          },
        ],
      },
    },
  });

  await prisma.workOrder.create({
    data: {
      orderNo: "WO-2026-002",
      bomId: bom2.id,
      finishedProductId: hotBagProdId,
      targetQty: 800.0,
      producedQty: 450.0,
      scrapQty: 12.0,
      unit: "kg",
      startDate: new Date("2026-02-20"),
      endDate: new Date("2026-02-22"),
      status: "IN_PROGRESS",
      operator: "สมคิด คุมเครื่อง",
      machineNo: "Extruder Line #3 (เครื่องเป่าถุงร้อน PP)",
      warehouseId: fg1WhId,
      totalCost: 36000.0,
      notes: "กำลังเดินเครื่องเป่าฟิล์มกะกลางวัน",
      materials: {
        create: [
          { rawMaterialId: rmPpId, plannedQty: 784.0, actualQty: 441.0, unitCost: 43.5 },
          { rawMaterialId: addSlipId, plannedQty: 16.0, actualQty: 9.0, unitCost: 150.0 },
        ],
      },
    },
  });

  // 14. 7-Month Realistic Historical Analytics & Transactions
  console.log("Generating 7-Month Historical Purchases, Sales, POS Orders, and Expenses for Charts & Reports...");

  const now = new Date();
  const monthOffsets = [6, 5, 4, 3, 2, 1, 0]; // 6 months ago up to current month (e.g. Aug 2025 to Feb 2026)

  const monthlyProfiles = [
    { offset: 6, b2bSales: 220000, posSales: 35000, purchases: 260000, elecCost: 42000, maintCost: 12000 },
    { offset: 5, b2bSales: 245000, posSales: 42000, purchases: 280000, elecCost: 44000, maintCost: 15000 },
    { offset: 4, b2bSales: 290000, posSales: 48000, purchases: 320000, elecCost: 48000, maintCost: 18000 },
    { offset: 3, b2bSales: 310000, posSales: 55000, purchases: 340000, elecCost: 51000, maintCost: 14000 },
    { offset: 2, b2bSales: 360000, posSales: 68000, purchases: 390000, elecCost: 56000, maintCost: 22000 },
    { offset: 1, b2bSales: 280000, posSales: 52000, purchases: 310000, elecCost: 46000, maintCost: 16000 },
    { offset: 0, b2bSales: 320000, posSales: 58000, purchases: 350000, elecCost: 49000, maintCost: 15000 },
  ];

  let orderCounter = 100;
  let saleCounter = 100;
  let poCounter = 100;

  for (const prof of monthlyProfiles) {
    const txDate = new Date(now.getFullYear(), now.getMonth() - prof.offset, 15, 11, 30);
    const dateStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}-15`;

    // A. B2B Sales (Sale & Invoice)
    saleCounter++;
    const saleRef = `SL-202${saleCounter}`;
    const invNo = `INV-202${saleCounter}`;
    const b2bTax = Math.round(prof.b2bSales * 0.07);
    const b2bGrandTotal = prof.b2bSales + b2bTax;

    await prisma.sale.create({
      data: {
        reference: saleRef,
        customerId: custMap["CUST-MAKRO"],
        customerName: "บริษัท สยามแม็คโคร จำกัด (มหาชน)",
        billerName: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด (สำนักงานใหญ่)",
        warehouseName: "คลังสินค้าสำเร็จรูป 1 (FG-01)",
        storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
        date: txDate,
        createdAt: txDate,
        status: "COMPLETED",
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
        subtotal: prof.b2bSales,
        tax: b2bTax,
        grandTotal: b2bGrandTotal,
        paid: b2bGrandTotal,
        due: 0.0,
        notes: `ยอดส่งมอบสินค้า B2B ประจำเดือน ${txDate.toLocaleString("en-US", { month: "short" })}`,
        items: {
          create: [
            {
              productId: tShirtProdId,
              productName: "ถุงหูหิ้วขาวขุ่น ตรา KingBag (ขนาด 8x16 นิ้ว)",
              sku: "VAR-KB-TS-0816",
              quantity: Math.round(prof.b2bSales * 0.55 / 45),
              unitPrice: 45.0,
              subtotal: Math.round(prof.b2bSales * 0.55),
              total: Math.round(prof.b2bSales * 0.55 * 1.07),
              createdAt: txDate,
            },
            {
              productId: hotBagProdId,
              productName: "ถุงร้อนใส PP ตรา KingBag (ขนาด 6x9 นิ้ว)",
              sku: "VAR-KB-HOT-69",
              quantity: Math.round(prof.b2bSales * 0.45 / 36),
              unitPrice: 36.0,
              subtotal: Math.round(prof.b2bSales * 0.45),
              total: Math.round(prof.b2bSales * 0.45 * 1.07),
              createdAt: txDate,
            },
          ],
        },
        invoices: {
          create: [
            {
              invoiceNo: invNo,
              customerName: "บริษัท สยามแม็คโคร จำกัด (มหาชน)",
              amount: b2bGrandTotal,
              paid: b2bGrandTotal,
              amountDue: 0.0,
              status: "PAID",
              createdAt: txDate,
            },
          ],
        },
      },
    });

    // B. POS Orders (for Top Selling Products & Dashboard Recent Transactions)
    orderCounter++;
    const posOrderNo = `ORD-${txDate.getFullYear()}-${String(orderCounter).padStart(4, "0")}`;
    const posTax = Math.round(prof.posSales * 0.07);
    const posTotal = prof.posSales + posTax;

    await prisma.order.create({
      data: {
        orderNumber: posOrderNo,
        customerId: custMap["CUST-WALKIN"],
        subtotal: prof.posSales,
        tax: posTax,
        total: posTotal,
        discount: 0.0,
        paymentMethod: prof.offset % 2 === 0 ? "PROMPTPAY" : "CASH",
        paymentStatus: "PAID",
        cashierName: "กานดา การค้า",
        notes: "ยอดขายหน้าร้าน POS",
        createdAt: txDate,
        items: {
          create: [
            {
              productId: tShirtProdId,
              productName: "ถุงหูหิ้วขาวขุ่น ตรา KingBag (แพ็ค 500g)",
              quantity: Math.round(prof.posSales * 0.4 / 45),
              unitPrice: 45.0,
              subtotal: Math.round(prof.posSales * 0.4),
              createdAt: txDate,
            },
            {
              productId: hotBagProdId,
              productName: "ถุงร้อนใส PP เกรดบรรจุอาหาร ตรา KingBag",
              quantity: Math.round(prof.posSales * 0.35 / 36),
              unitPrice: 36.0,
              subtotal: Math.round(prof.posSales * 0.35),
              createdAt: txDate,
            },
            {
              productId: productMap["VAR-ECO-TRASH"],
              productName: "ถุงขยะดำรีไซเคิลมาตรฐาน ตรา EcoPoly",
              quantity: Math.round(prof.posSales * 0.25 / 55),
              unitPrice: 55.0,
              subtotal: Math.round(prof.posSales * 0.25),
              createdAt: txDate,
            },
          ],
        },
      },
    });

    // C. Purchases (PO) from SCGC & PTTGC
    poCounter++;
    const poRef = `PO-202${poCounter}`;
    const poTax = Math.round(prof.purchases * 0.07);
    const poTotal = prof.purchases + poTax;

    await prisma.purchase.create({
      data: {
        reference: poRef,
        supplierId: suppMap["SUP-SCGC"],
        supplierName: "บริษัท เอสซีจี เคมิคอลส์ จำกัด (มหาชน)",
        warehouseName: "คลังวัตถุดิบเม็ดพลาสติก A (RM-01)",
        storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
        date: txDate,
        createdAt: txDate,
        status: "RECEIVED",
        paymentStatus: "PAID",
        subtotal: prof.purchases,
        tax: poTax,
        total: poTotal,
        paid: poTotal,
        due: 0.0,
        notes: `รอบสั่งซื้อเม็ดพลาสติกเข้าคลังประจำเดือน ${txDate.toLocaleString("en-US", { month: "short" })}`,
        items: {
          create: [
            {
              productId: rmHdpeId,
              productName: "เม็ดพลาสติก HDPE เป่าฟิล์ม SCG H6140B",
              sku: "RM-HDPE-6140",
              quantity: Math.round(prof.purchases / 42),
              receivedQty: Math.round(prof.purchases / 42),
              unitCost: 42.0,
              subtotal: prof.purchases,
              total: poTotal,
              createdAt: txDate,
            },
          ],
        },
      },
    });

    // D. Factory Expenses (for Profit & Loss Reports)
    await prisma.expense.create({
      data: {
        reference: `EXP-EL-${prof.offset}`,
        expenseName: "ค่าไฟฟ้าแรงสูงเครื่องเป่าฟิล์ม (MEA)",
        categoryId: expCatMap["EXP-UTIL"],
        categoryName: "ค่าสาธารณูปโภคโรงงาน (Electricity & Water)",
        description: `ค่าไฟโรงงานประจำเดือน ${txDate.toLocaleString("en-US", { month: "short" })}`,
        date: dateStr,
        amount: prof.elecCost,
        status: "Approved",
        storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
        createdAt: txDate,
      },
    });

    await prisma.expense.create({
      data: {
        reference: `EXP-MT-${prof.offset}`,
        expenseName: "ค่าบำรุงรักษาหัวดายและเครื่องเป่าฟิล์ม",
        categoryId: expCatMap["EXP-MAINT"],
        categoryName: "ค่าซ่อมบำรุงเครื่องจักร (Machine Maintenance)",
        description: `Preventive Maintenance ประจำเดือน ${txDate.toLocaleString("en-US", { month: "short" })}`,
        date: dateStr,
        amount: prof.maintCost,
        status: "Approved",
        storeName: "ศูนย์กระจายสินค้า สำนักงานใหญ่ พระราม 2",
        createdAt: txDate,
      },
    });
  }

  // 15. HR / Department / Employees
  console.log("Creating HR Departments & Staff for Plastic Manufacturing Plant...");
  await prisma.attendance.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.shift.deleteMany();

  const shiftsData = [
    { name: "กะเช้า (Morning Shift)", timing: "08:00 AM - 05:00 PM", weekOff: "Sunday", status: "ACTIVE" },
    { name: "กะบ่าย (Afternoon Shift)", timing: "04:00 PM - 12:00 AM", weekOff: "Sunday", status: "ACTIVE" },
    { name: "กะดึก (Night Shift)", timing: "12:00 AM - 08:00 AM", weekOff: "Sunday", status: "ACTIVE" },
  ];
  for (const s of shiftsData) {
    await prisma.shift.create({ data: s });
  }

  const departmentsData = [
    { name: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)", headName: "วิชัย เป่าฟิล์ม", totalMembers: 12, status: "ACTIVE" },
    { name: "ฝ่ายคลังสินค้าและจัดส่ง (Warehouse & Logistics)", headName: "สมเกียรติ สต็อกแมน", totalMembers: 8, status: "ACTIVE" },
    { name: "ฝ่ายขายและการตลาด (Sales & Marketing)", headName: "กานดา การค้า", totalMembers: 6, status: "ACTIVE" },
    { name: "ฝ่ายควบคุมคุณภาพและแล็บ (QA/QC)", headName: "ธนากร ตรวจสอบ", totalMembers: 4, status: "ACTIVE" },
    { name: "ฝ่ายบัญชีและการเงิน (Accounting & Finance)", headName: "นภาพร บัญชี", totalMembers: 5, status: "ACTIVE" },
  ];
  for (const d of departmentsData) {
    await prisma.department.create({ data: d });
  }

  const designationsData = [
    { name: "ผู้จัดการโรงงาน (Plant Manager)", department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)", totalMembers: 1, status: "ACTIVE" },
    { name: "หัวหน้าช่างเป่าฟิล์ม (Lead Extruder)", department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)", totalMembers: 3, status: "ACTIVE" },
    { name: "ช่างคุมเครื่องตัดซีล (Sealing Operator)", department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)", totalMembers: 8, status: "ACTIVE" },
    { name: "หัวหน้าคลังสินค้า (Warehouse Supervisor)", department: "ฝ่ายคลังสินค้าและจัดส่ง (Warehouse & Logistics)", totalMembers: 2, status: "ACTIVE" },
    { name: "เจ้าหน้าที่ตรวจแล็บ (QC Inspector)", department: "ฝ่ายควบคุมคุณภาพและแล็บ (QA/QC)", totalMembers: 4, status: "ACTIVE" },
    { name: "เจ้าหน้าที่ขายโครงการ B2B (Key Account Sales)", department: "ฝ่ายขายและการตลาด (Sales & Marketing)", totalMembers: 4, status: "ACTIVE" },
  ];
  for (const des of designationsData) {
    await prisma.designation.create({ data: des });
  }

  const employeesData = [
    {
      empId: "EMP-001",
      name: "สมชาย ชัยชนะ",
      email: "somchai.c@siampolypack.com",
      phone: "+66 81 234 5678",
      department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)",
      role: "ผู้จัดการโรงงาน (Plant Manager)",
      joinedDate: "15 Jan 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-002",
      name: "วิชัย เป่าฟิล์ม",
      email: "wichai.p@siampolypack.com",
      phone: "+66 89 876 5432",
      department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)",
      role: "หัวหน้าช่างเป่าฟิล์ม (Lead Extruder)",
      joinedDate: "01 Mar 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-003",
      name: "กานดา การค้า",
      email: "kanda.k@siampolypack.com",
      phone: "+66 86 555 1234",
      department: "ฝ่ายขายและการตลาด (Sales & Marketing)",
      role: "เจ้าหน้าที่ขายโครงการ B2B (Key Account Sales)",
      joinedDate: "10 May 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-004",
      name: "สมเกียรติ สต็อกแมน",
      email: "somkiat.s@siampolypack.com",
      phone: "+66 84 333 9988",
      department: "ฝ่ายคลังสินค้าและจัดส่ง (Warehouse & Logistics)",
      role: "หัวหน้าคลังสินค้า (Warehouse Supervisor)",
      joinedDate: "01 Jun 2024",
      status: "ACTIVE",
    },
  ];
  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  // 16. Bank Accounts
  console.log("Creating Bank Accounts...");
  await prisma.bankAccount.deleteMany();
  const bankAccounts = [
    {
      bankName: "ธนาคารกสิกรไทย (KBANK)",
      accountName: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด",
      accountNumber: "045-1-89234-1",
      branch: "สาขาถนนพระราม 2",
      balance: 2450000.0,
      status: "ACTIVE",
    },
    {
      bankName: "ธนาคารไทยพาณิชย์ (SCB)",
      accountName: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด",
      accountNumber: "112-2-76543-8",
      branch: "สาขาสมุทรสาคร",
      balance: 1890000.0,
      status: "ACTIVE",
    },
    {
      bankName: "ธนาคารกรุงเทพ (BBL)",
      accountName: "บริษัท สยามโพลีแพ็ค แมนูแฟคเจอริ่ง จำกัด",
      accountNumber: "208-3-54321-0",
      branch: "สาขามหาชัย",
      balance: 920000.0,
      status: "ACTIVE",
    },
  ];
  for (const b of bankAccounts) {
    await prisma.bankAccount.create({ data: b });
  }

  console.log("✅ Successfully seeded 28 plastic products & 7-Month historical transactions!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
