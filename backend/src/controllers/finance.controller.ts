import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 💸 EXPENSES & EXPENSE CATEGORIES
// ==========================================

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch expenses" });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { reference, expenseName, categoryName, description, date, amount, status, storeName, notes } = req.body;
    const ref = reference || `EXP-${Date.now().toString().slice(-6)}`;

    const expense = await prisma.expense.create({
      data: {
        reference: ref,
        expenseName: expenseName || "General Expense",
        categoryName: categoryName || "General",
        description,
        date: date || new Date().toISOString().split("T")[0],
        amount: Number(amount) || 0,
        status: status || "Approved",
        storeName,
        notes,
      },
    });
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create expense" });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reference, expenseName, categoryName, description, date, amount, status, storeName, notes } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id as string },
      data: {
        reference,
        expenseName,
        categoryName,
        description,
        date,
        amount: amount !== undefined ? Number(amount) : undefined,
        status,
        storeName,
        notes,
      },
    });
    res.json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update expense" });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete expense" });
  }
};

export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch expense categories" });
  }
};

export const createExpenseCategory = async (req: Request, res: Response) => {
  try {
    const { name, code, description, status } = req.body;
    const category = await prisma.expenseCategory.create({
      data: {
        name,
        code: code || `EXPCAT-${Date.now().toString().slice(-4)}`,
        description,
        status: status || "ACTIVE",
      },
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create expense category" });
  }
};

// ==========================================
// 💵 INCOME & INCOME CATEGORIES
// ==========================================

export const getIncomes = async (req: Request, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(incomes);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch income" });
  }
};

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { reference, incomeName, storeName, categoryName, description, date, amount, status, notes } = req.body;
    const ref = reference || `INC-${Date.now().toString().slice(-6)}`;

    const income = await prisma.income.create({
      data: {
        reference: ref,
        incomeName,
        storeName: storeName || "Main Store",
        categoryName: categoryName || "General Sales",
        description,
        date: date || new Date().toISOString().split("T")[0],
        amount: Number(amount) || 0,
        status: status || "Received",
        notes,
      },
    });
    res.status(201).json(income);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create income" });
  }
};

export const updateIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reference, incomeName, storeName, categoryName, description, date, amount, status, notes } = req.body;

    const income = await prisma.income.update({
      where: { id: req.params.id as string },
      data: {
        reference,
        incomeName,
        storeName,
        categoryName,
        description,
        date,
        amount: amount !== undefined ? Number(amount) : undefined,
        status,
        notes,
      },
    });
    res.json(income);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update income" });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.income.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Income deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete income" });
  }
};

export const getIncomeCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.incomeCategory.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch income categories" });
  }
};

export const createIncomeCategory = async (req: Request, res: Response) => {
  try {
    const { name, code, description, status } = req.body;
    const category = await prisma.incomeCategory.create({
      data: {
        name,
        code: code || `INCCAT-${Date.now().toString().slice(-4)}`,
        description,
        status: status || "ACTIVE",
      },
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create income category" });
  }
};

// ==========================================
// 🏦 BANK ACCOUNTS & MONEY TRANSFERS
// ==========================================

export const getBankAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bank accounts" });
  }
};

export const createBankAccount = async (req: Request, res: Response) => {
  try {
    const { accountName, accountNumber, bankName, branch, balance, status } = req.body;
    const account = await prisma.bankAccount.create({
      data: {
        accountName,
        accountNumber,
        bankName,
        branch,
        balance: Number(balance) || 0,
        status: status || "ACTIVE",
      },
    });
    res.status(201).json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create bank account" });
  }
};

export const updateBankAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accountName, accountNumber, bankName, branch, balance, status } = req.body;
    const account = await prisma.bankAccount.update({
      where: { id: req.params.id as string },
      data: {
        accountName,
        accountNumber,
        bankName,
        branch,
        balance: balance !== undefined ? Number(balance) : undefined,
        status,
      },
    });
    res.json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update bank account" });
  }
};

export const deleteBankAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.bankAccount.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Bank account deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete bank account" });
  }
};

export const getMoneyTransfers = async (req: Request, res: Response) => {
  try {
    const transfers = await prisma.moneyTransfer.findMany({
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(transfers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch money transfers" });
  }
};

export const createMoneyTransfer = async (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, amount, date, notes } = req.body;
    const transferAmount = Number(amount);

    if (transferAmount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const [transfer] = await prisma.$transaction([
      prisma.moneyTransfer.create({
        data: {
          reference: `TRF-${Date.now().toString().slice(-6)}`,
          fromAccountId,
          toAccountId,
          amount: transferAmount,
          date: date || new Date().toISOString().split("T")[0],
          notes,
        },
      }),
      prisma.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: transferAmount } },
      }),
      prisma.bankAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: transferAmount } },
      }),
    ]);

    res.status(201).json(transfer);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to execute money transfer" });
  }
};

// ==========================================
// 📊 BALANCE SHEET & TRIAL BALANCE (REAL DB)
// ==========================================

export const getBalanceSheetData = async (req: Request, res: Response) => {
  try {
    // 1. Liquid Bank Accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { accountName: "asc" },
    });
    const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    // 2. Real Inventory Valuation from Products
    const products = await prisma.product.findMany();
    const inventoryValue = products.reduce((sum, p) => {
      const cost = p.costPrice > 0 ? p.costPrice : p.price * 0.7;
      return sum + (p.stock > 0 ? p.stock * cost : 0);
    }, 0);
    const totalProductsCount = products.length;
    const totalStockQty = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // 3. Accounts Receivable (Customer Unpaid Sales)
    const sales = await prisma.sale.findMany();
    const accountsReceivable = sales.reduce((sum, s) => {
      const due = s.due ?? (s.grandTotal - (s.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);

    // Total Current Assets
    const totalAssets = totalBankBalance + inventoryValue + accountsReceivable;

    // 4. Accounts Payable (Supplier Unpaid Purchases)
    const purchases = await prisma.purchase.findMany();
    const accountsPayable = purchases.reduce((sum, p) => {
      const due = p.due ?? (p.total - (p.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);
    const totalLiabilities = accountsPayable;

    // 5. Incomes & Expenses (Retained Earnings)
    const incomes = await prisma.income.findMany();
    const expenses = await prisma.expense.findMany();
    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netIncome = totalIncome - totalExpense;

    // Total Equity = Total Assets - Total Liabilities
    const totalEquity = totalAssets - totalLiabilities;
    const retainedEarnings = netIncome;
    const ownerCapital = totalEquity - retainedEarnings;

    res.json({
      success: true,
      data: {
        assets: {
          totalAssets,
          bankAccounts,
          totalBankBalance,
          inventoryValue,
          totalProductsCount,
          totalStockQty,
          accountsReceivable,
        },
        liabilities: {
          totalLiabilities,
          accountsPayable,
        },
        equity: {
          totalEquity,
          retainedEarnings,
          ownerCapital,
          totalIncome,
          totalExpense,
          netIncome,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to calculate balance sheet" });
  }
};

export const getTrialBalanceData = async (req: Request, res: Response) => {
  try {
    // 1. Bank Accounts
    const bankAccounts = await prisma.bankAccount.findMany();
    const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    // 2. Real Inventory Valuation
    const products = await prisma.product.findMany();
    const inventoryValue = products.reduce((sum, p) => {
      const cost = p.costPrice > 0 ? p.costPrice : p.price * 0.7;
      return sum + (p.stock > 0 ? p.stock * cost : 0);
    }, 0);

    // 3. Accounts Receivable
    const sales = await prisma.sale.findMany();
    const accountsReceivable = sales.reduce((sum, s) => {
      const due = s.due ?? (s.grandTotal - (s.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);

    // 4. Operating Expenses
    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // 5. Operating Incomes
    const incomes = await prisma.income.findMany();
    const totalIncomes = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

    // 6. Accounts Payable
    const purchases = await prisma.purchase.findMany();
    const accountsPayable = purchases.reduce((sum, p) => {
      const due = p.due ?? (p.total - (p.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);

    // Debits
    const debitEntries = [
      { code: "1010", accountName: "Cash in Banks & Registers", category: "Current Assets", debit: totalBankBalance, credit: 0 },
      { code: "1020", accountName: "Current Inventory Asset (Stock Valuation)", category: "Current Assets", debit: inventoryValue, credit: 0 },
      { code: "1030", accountName: "Accounts Receivable (Customer Dues)", category: "Current Assets", debit: accountsReceivable, credit: 0 },
      { code: "5010", accountName: "Operating Expenses (YTD)", category: "Expenses", debit: totalExpenses, credit: 0 },
    ];

    const totalDebit = debitEntries.reduce((s, e) => s + e.debit, 0);

    // Credits
    const balancingEquity = totalDebit - (totalIncomes + accountsPayable);

    const creditEntries = [
      { code: "2010", accountName: "Accounts Payable (Supplier Dues)", category: "Current Liabilities", debit: 0, credit: accountsPayable },
      { code: "4010", accountName: "Sales & Revenue Income (YTD)", category: "Revenue", debit: 0, credit: totalIncomes },
      { code: "3010", accountName: "Capital & Retained Earnings", category: "Equity", debit: 0, credit: balancingEquity },
    ];

    const totalCredit = creditEntries.reduce((s, e) => s + e.credit, 0);

    res.json({
      success: true,
      data: {
        debitEntries,
        creditEntries,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to calculate trial balance" });
  }
};
