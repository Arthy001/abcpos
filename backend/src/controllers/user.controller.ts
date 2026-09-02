import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Comprehensive Realistic Seed data for System Users with Warehouse & Store associations
const INITIAL_USERS = [
  {
    name: "Henry Bryant",
    phone: "+12498345785",
    email: "henry@example.com",
    role: "Admin",
    warehouseName: "All Warehouses",
    storeName: "All Stores",
    avatar: "/assets/images/avatar-01.jpg",
    status: "ACTIVE",
  },
  {
    name: "Jenny Ellis",
    phone: "+13178964582",
    email: "jenny@example.com",
    role: "Manager",
    warehouseName: "Traditional Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/customer12.jpg",
    status: "ACTIVE",
  },
  {
    name: "Michael Dawson",
    phone: "+13798132475",
    email: "michael@example.com",
    role: "Store Keeper",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer15.jpg",
    status: "ACTIVE",
  },
  {
    name: "Karen Flores",
    phone: "+17538647943",
    email: "karen@example.com",
    role: "Warehouse Supervisor",
    warehouseName: "Traditional Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/customer14.jpg",
    status: "ACTIVE",
  },
  {
    name: "Leon Baxter",
    phone: "+12796183487",
    email: "leon@example.com",
    role: "Cashier",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer13.jpg",
    status: "ACTIVE",
  },
  {
    name: "Karen Galvan",
    phone: "+17596341894",
    email: "galvan@example.com",
    role: "Purchase Officer",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer16.jpg",
    status: "ACTIVE",
  },
  {
    name: "Thomas Ward",
    phone: "+12973548678",
    email: "thomas@example.com",
    role: "Delivery Biker",
    warehouseName: "Traditional Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/avatar-02.jpg",
    status: "ACTIVE",
  },
  {
    name: "James Higham",
    phone: "+11978348626",
    email: "james@example.com",
    role: "Inventory Auditor",
    warehouseName: "Lavish Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/avatar-03.jpg",
    status: "ACTIVE",
  },
  {
    name: "Jada Robinson",
    phone: "+12678934561",
    email: "robinson@example.com",
    role: "Accountant",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer18.jpg",
    status: "ACTIVE",
  },
  {
    name: "Aliza Duncan",
    phone: "+13147858357",
    email: "aliza@example.com",
    role: "Maintenance",
    warehouseName: "Traditional Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer17.jpg",
    status: "ACTIVE",
  },
];

// Seed data for Roles
const INITIAL_ROLES = [
  { name: "Admin", createdDate: "12 Sep 2024", status: "ACTIVE", description: "Full system administrative access" },
  { name: "Manager", createdDate: "24 Oct 2024", status: "ACTIVE", description: "Branch and operational management" },
  { name: "Store Keeper", createdDate: "20 Jul 2024", status: "ACTIVE", description: "Warehouse stock receiving and dispatch" },
  { name: "Warehouse Supervisor", createdDate: "17 Oct 2024", status: "ACTIVE", description: "Multi-warehouse inventory supervisor" },
  { name: "Purchase Officer", createdDate: "15 Jan 2024", status: "ACTIVE", description: "Procurement, purchase orders and goods receipt" },
  { name: "Cashier", createdDate: "03 Nov 2024", status: "ACTIVE", description: "POS sales, cashier desk and billing" },
  { name: "Salesman", createdDate: "18 Feb 2024", status: "ACTIVE", description: "Counter and showroom sales" },
  { name: "Inventory Auditor", createdDate: "10 Apr 2024", status: "ACTIVE", description: "Stock control, adjustment and physical audits" },
  { name: "Delivery Biker", createdDate: "29 Aug 2024", status: "ACTIVE", description: "Order dispatch and delivery logistics" },
  { name: "Accountant", createdDate: "17 Dec 2024", status: "ACTIVE", description: "Invoices, tax, financial statements" },
  { name: "Maintenance", createdDate: "22 Feb 2024", status: "ACTIVE", description: "Store & warehouse facilities maintenance" },
];

// Seed data for Delete Account Requests
const INITIAL_DELETE_REQUESTS = [
  { userName: "Steven", requisitionDate: "25 Sep 2023", deleteRequestDate: "01 Oct 2023", userAvatar: "/assets/images/avatar-01.jpg" },
  { userName: "Susan Lopez", requisitionDate: "30 Sep 2023", deleteRequestDate: "05 Oct 2023", userAvatar: "/assets/images/customer12.jpg" },
  { userName: "Robert Grossman", requisitionDate: "10 Sep 2023", deleteRequestDate: "25 Sep 2023", userAvatar: "/assets/images/customer13.jpg" },
  { userName: "Janet Hembre", requisitionDate: "15 Sep 2023", deleteRequestDate: "20 Sep 2023", userAvatar: "/assets/images/customer14.jpg" },
  { userName: "Russell Belle", requisitionDate: "15 Aug 2023", deleteRequestDate: "01 Sep 2023", userAvatar: "/assets/images/customer15.jpg" },
];

// ==================== SYSTEM USERS ====================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { status, search, role, warehouse, store } = req.query;

    const count = await prisma.systemUser.count();
    if (count === 0) {
      for (const u of INITIAL_USERS) {
        await prisma.systemUser.create({ data: u });
      }
    }

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (role && role !== "all") {
      where.role = String(role);
    }
    if (warehouse && warehouse !== "all") {
      where.warehouseName = String(warehouse);
    }
    if (store && store !== "all") {
      where.storeName = String(store);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { role: { contains: String(search) } },
        { warehouseName: { contains: String(search) } },
        { storeName: { contains: String(search) } },
      ];
    }

    const users = await prisma.systemUser.findMany({
      where,
      include: {
        assignedWarehouses: {
          include: { warehouse: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.systemUser.findUnique({
      where: { id },
      include: {
        assignedWarehouses: {
          include: { warehouse: true },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, warehouseName, storeName, avatar, status, password, warehouseIds } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and Email are required" });
    }

    const existing = await prisma.systemUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const user = await prisma.systemUser.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || "Admin",
        warehouseName: warehouseName || null,
        storeName: storeName || null,
        avatar: avatar || "/assets/images/avatar-01.jpg",
        status: status ? String(status).toUpperCase() : "ACTIVE",
        password: password || null,
      },
    });

    // Create user warehouse assignments if provided
    if (Array.isArray(warehouseIds) && warehouseIds.length > 0) {
      for (const whId of warehouseIds) {
        if (whId) {
          try {
            await prisma.userWarehouse.create({
              data: {
                userId: user.id,
                warehouseId: String(whId),
              },
            });
          } catch (e) {
            console.error("Failed to link warehouse:", whId, e);
          }
        }
      }
    }

    const createdUser = await prisma.systemUser.findUnique({
      where: { id: user.id },
      include: {
        assignedWarehouses: {
          include: { warehouse: true },
        },
      },
    });

    res.status(201).json({ success: true, data: createdUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, email, phone, role, warehouseName, storeName, avatar, status, password, warehouseIds } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (warehouseName !== undefined) updateData.warehouseName = warehouseName;
    if (storeName !== undefined) updateData.storeName = storeName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (status !== undefined) updateData.status = String(status).toUpperCase();
    if (password) updateData.password = password;

    await prisma.systemUser.update({
      where: { id },
      data: updateData,
    });

    // Sync user warehouse assignments if warehouseIds is explicitly passed
    if (warehouseIds !== undefined) {
      await prisma.userWarehouse.deleteMany({ where: { userId: id } });
      if (Array.isArray(warehouseIds) && warehouseIds.length > 0) {
        for (const whId of warehouseIds) {
          if (whId) {
            try {
              await prisma.userWarehouse.create({
                data: {
                  userId: id,
                  warehouseId: String(whId),
                },
              });
            } catch (e) {
              console.error("Failed to link warehouse:", whId, e);
            }
          }
        }
      }
    }

    const updatedUser = await prisma.systemUser.findUnique({
      where: { id },
      include: {
        assignedWarehouses: {
          include: { warehouse: true },
        },
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.systemUser.delete({ where: { id } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete user" });
  }
};

// ==================== ROLES & PERMISSIONS ====================
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const count = await prisma.role.count();
    if (count === 0) {
      for (const r of INITIAL_ROLES) {
        await prisma.role.create({ data: r });
      }
    }

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const roles = await prisma.role.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch roles" });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, status, permissions, createdDate } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Role Name is required" });
    }

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role name already exists" });
    }

    const formattedDate = createdDate || new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
        permissions: permissions ? JSON.stringify(permissions) : null,
        createdDate: formattedDate,
      },
    });

    res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create role" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, description, status, permissions } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = String(status).toUpperCase();
    if (permissions !== undefined) {
      updateData.permissions = typeof permissions === "string" ? permissions : JSON.stringify(permissions);
    }

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: role });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update role" });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.role.delete({ where: { id } });
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete role" });
  }
};

// ==================== DELETE ACCOUNT REQUESTS ====================
export const getDeleteAccountRequests = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const count = await prisma.deleteAccountRequest.count();
    if (count === 0) {
      for (const d of INITIAL_DELETE_REQUESTS) {
        await prisma.deleteAccountRequest.create({ data: d });
      }
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { userName: { contains: String(search) } },
        { requisitionDate: { contains: String(search) } },
        { deleteRequestDate: { contains: String(search) } },
      ];
    }

    const requests = await prisma.deleteAccountRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch delete account requests" });
  }
};

export const createDeleteAccountRequest = async (req: Request, res: Response) => {
  try {
    const { userName, userAvatar, requisitionDate, deleteRequestDate } = req.body;
    if (!userName) {
      return res.status(400).json({ success: false, message: "User name is required" });
    }

    const formattedReqDate = requisitionDate || new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const formattedDelDate = deleteRequestDate || new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const request = await prisma.deleteAccountRequest.create({
      data: {
        userName,
        userAvatar: userAvatar || "/assets/images/customer11.jpg",
        requisitionDate: formattedReqDate,
        deleteRequestDate: formattedDelDate,
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create request" });
  }
};

export const deleteAccountRequestAction = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.deleteAccountRequest.delete({ where: { id } });
    res.json({ success: true, message: "Delete account request removed / executed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to remove request" });
  }
};
