"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding database...");
    // Clean old records
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.customer.deleteMany();
    // Create Categories
    const catComputers = await prisma.category.create({
        data: { name: "Computers & Laptops", slug: "computers-laptops", description: "Laptops, Desktops and Peripherals" },
    });
    const catAccessories = await prisma.category.create({
        data: { name: "Accessories", slug: "accessories", description: "Keyboards, Mice, Cables and Chargers" },
    });
    const catPhones = await prisma.category.create({
        data: { name: "Phones & Tablets", slug: "phones-tablets", description: "Smartphones, Tablets and Smartwatches" },
    });
    const catAudio = await prisma.category.create({
        data: { name: "Audio & Sound", slug: "audio-sound", description: "Headphones, Speakers and Microphones" },
    });
    // Create Customers
    const customerWalkin = await prisma.customer.create({
        data: { name: "Walk-in Customer", phone: "080-000-0000", email: "walkin@example.com" },
    });
    const customerSomchai = await prisma.customer.create({
        data: { name: "Somchai Prasert", phone: "089-123-4567", email: "somchai@gmail.com", points: 120 },
    });
    // Create Products
    const products = [
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
            categoryId: catAccessories.id,
            image: "/assets/products/product-02.jpg",
            status: "ACTIVE",
        },
        {
            name: "Keychron K2 Pro Mechanical Keyboard",
            sku: "PROD-003",
            barcode: "885123450003",
            price: 4190,
            costPrice: 3200,
            stock: 18,
            minStockAlert: 4,
            categoryId: catAccessories.id,
            image: "/assets/products/product-03.jpg",
            status: "ACTIVE",
        },
        {
            name: "Sony WH-1000XM5 Wireless Headphones",
            sku: "PROD-004",
            barcode: "885123450004",
            price: 13990,
            costPrice: 11000,
            stock: 8,
            minStockAlert: 2,
            categoryId: catAudio.id,
            image: "/assets/products/product-04.jpg",
            status: "ACTIVE",
        },
        {
            name: "iPad Air 11-inch M2 (128GB)",
            sku: "PROD-005",
            barcode: "885123450005",
            price: 21900,
            costPrice: 18500,
            stock: 15,
            minStockAlert: 3,
            categoryId: catPhones.id,
            image: "/assets/products/product-05.jpg",
            status: "ACTIVE",
        },
        {
            name: "Anker 65W GaN Fast Charger USB-C",
            sku: "PROD-006",
            barcode: "885123450006",
            price: 1290,
            costPrice: 850,
            stock: 3, // Low stock alert demo
            minStockAlert: 5,
            categoryId: catAccessories.id,
            image: "/assets/products/product-06.jpg",
            status: "ACTIVE",
        },
        {
            name: "Dell UltraSharp 27 4K USB-C Hub Monitor",
            sku: "PROD-007",
            barcode: "885123450007",
            price: 19500,
            costPrice: 16000,
            stock: 6,
            minStockAlert: 2,
            categoryId: catComputers.id,
            image: "/assets/products/product-07.jpg",
            status: "ACTIVE",
        },
        {
            name: "JBL Flip 6 Portable Bluetooth Speaker",
            sku: "PROD-008",
            barcode: "885123450008",
            price: 4990,
            costPrice: 3800,
            stock: 20,
            minStockAlert: 5,
            categoryId: catAudio.id,
            image: "/assets/products/product-08.jpg",
            status: "ACTIVE",
        },
    ];
    for (const item of products) {
        await prisma.product.create({ data: item });
    }
    // Create sample initial orders
    const sampleProduct1 = await prisma.product.findFirst({ where: { sku: "PROD-002" } });
    const sampleProduct2 = await prisma.product.findFirst({ where: { sku: "PROD-003" } });
    if (sampleProduct1 && sampleProduct2) {
        await prisma.order.create({
            data: {
                orderNumber: "ORD-20260820-001",
                customerId: customerSomchai.id,
                subtotal: sampleProduct1.price + sampleProduct2.price,
                discount: 200,
                tax: 529.9,
                total: sampleProduct1.price + sampleProduct2.price - 200 + 529.9,
                paymentMethod: "PROMPTPAY",
                paymentStatus: "PAID",
                cashierName: "Admin",
                items: {
                    create: [
                        {
                            productId: sampleProduct1.id,
                            productName: sampleProduct1.name,
                            quantity: 1,
                            unitPrice: sampleProduct1.price,
                            subtotal: sampleProduct1.price,
                        },
                        {
                            productId: sampleProduct2.id,
                            productName: sampleProduct2.name,
                            quantity: 1,
                            unitPrice: sampleProduct2.price,
                            subtotal: sampleProduct2.price,
                        },
                    ],
                },
            },
        });
    }
    console.log("Seeding finished successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
