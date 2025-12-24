const prisma = require('../config/database');

const getAll = async (options = {}) => {
  const { categoryId, lowStockOnly, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const where = {};

  if (categoryId) {
    where.product = { categoryId };
  }

  const [inventories, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.inventory.count({ where }),
  ]);

  // Filter for low stock if requested
  let filteredInventories = inventories;
  if (lowStockOnly) {
    filteredInventories = inventories.filter(
      (inv) => inv.currentStock <= inv.product.lowStockThreshold
    );
  }

  return {
    inventories: filteredInventories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: lowStockOnly ? filteredInventories.length : total,
      totalPages: Math.ceil((lowStockOnly ? filteredInventories.length : total) / limit),
    },
  };
};

const getByProductId = async (productId) => {
  return prisma.inventory.findUnique({
    where: { productId },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });
};

const updateStock = async (productId, type, quantity, notes) => {
  const qty = parseFloat(quantity);
  
  return prisma.$transaction(async (tx) => {
    // Get current inventory
    const inventory = await tx.inventory.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!inventory) {
      throw new Error('Inventory not found for this product');
    }

    // Calculate new stock
    let newStock;
    if (type === 'IN') {
      newStock = inventory.currentStock + qty;
    } else {
      newStock = inventory.currentStock - qty;
      // Validate stock doesn't go negative
      if (newStock < 0) {
        throw new Error(
          `Insufficient stock. Current: ${inventory.currentStock} ${inventory.product.unit}, Requested: ${qty} ${inventory.product.unit}`
        );
      }
    }

    // Update inventory
    const updatedInventory = await tx.inventory.update({
      where: { productId },
      data: { currentStock: newStock },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Create stock movement record
    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity: qty,
        notes: notes || null,
      },
    });

    return { inventory: updatedInventory, movement };
  });
};

const getStockMovements = async (options = {}) => {
  const { productId, type, startDate, endDate, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where = {};

  if (productId) {
    where.productId = productId;
  }

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Dashboard statistics
const getStats = async () => {
  const [totalProducts, totalCategories, inventories, recentMovements] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.inventory.findMany({
        include: {
          product: true,
        },
      }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      }),
    ]);

  const lowStockProducts = inventories.filter(
    (inv) => inv.currentStock <= inv.product.lowStockThreshold
  );

  const totalStockValue = inventories.reduce(
    (sum, inv) => sum + inv.currentStock,
    0
  );

  return {
    totalProducts,
    totalCategories,
    lowStockCount: lowStockProducts.length,
    totalStockValue,
    recentMovements,
  };
};

module.exports = {
  getAll,
  getByProductId,
  updateStock,
  getStockMovements,
  getStats,
};
