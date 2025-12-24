const prisma = require('../config/database');

const getAll = async (options = {}) => {
  const {
    search,
    categoryId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  const where = {};

  // Search by name or CAS number
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { casNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by category
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit),
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      inventory: true,
    },
  });
};

const create = async (data) => {
  const { initialStock, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    // Create product
    const product = await tx.product.create({
      data: {
        name: productData.name,
        casNumber: productData.casNumber,
        unit: productData.unit,
        description: productData.description,
        categoryId: productData.categoryId,
        lowStockThreshold: productData.lowStockThreshold || 10,
      },
      include: {
        category: true,
      },
    });

    // Create inventory record
    const inventory = await tx.inventory.create({
      data: {
        productId: product.id,
        currentStock: initialStock || 0,
      },
    });

    // If initial stock provided, create a stock movement record
    if (initialStock && initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: initialStock,
          notes: 'Initial stock',
        },
      });
    }

    return { ...product, inventory };
  });
};

const update = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      casNumber: data.casNumber,
      unit: data.unit,
      description: data.description,
      categoryId: data.categoryId,
      lowStockThreshold: data.lowStockThreshold,
    },
    include: {
      category: true,
      inventory: true,
    },
  });
};

const remove = async (id) => {
  return prisma.product.delete({
    where: { id },
  });
};

const checkCasNumberExists = async (casNumber, excludeId = null) => {
  const where = { casNumber };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  const product = await prisma.product.findFirst({ where });
  return !!product;
};

// Get products with low stock
const getLowStock = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      inventory: true,
    },
  });

  return products.filter(
    (product) =>
      product.inventory && product.inventory.currentStock <= product.lowStockThreshold
  );
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  checkCasNumberExists,
  getLowStock,
};
