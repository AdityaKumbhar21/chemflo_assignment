const inventoryService = require('../services/inventory.service');
const ApiResponse = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { categoryId, lowStockOnly, page, limit } = req.query;
    const result = await inventoryService.getAll({
      categoryId,
      lowStockOnly: lowStockOnly === 'true',
      page,
      limit,
    });
    return ApiResponse.success(res, result, 'Inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const inventory = await inventoryService.getByProductId(productId);

    if (!inventory) {
      return ApiResponse.notFound(res, 'Inventory not found for this product');
    }

    return ApiResponse.success(res, inventory, 'Inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { type, quantity, notes } = req.body;

    const result = await inventoryService.updateStock(productId, type, quantity, notes);

    const message =
      type === 'IN'
        ? `Stock increased by ${quantity}`
        : `Stock decreased by ${quantity}`;

    return ApiResponse.success(res, result, message);
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      return ApiResponse.badRequest(res, error.message);
    }
    if (error.message.includes('Inventory not found')) {
      return ApiResponse.notFound(res, error.message);
    }
    next(error);
  }
};

const getMovements = async (req, res, next) => {
  try {
    const { productId, type, startDate, endDate, page, limit } = req.query;
    const result = await inventoryService.getStockMovements({
      productId,
      type,
      startDate,
      endDate,
      page,
      limit,
    });
    return ApiResponse.success(res, result, 'Stock movements retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await inventoryService.getStats();
    return ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getByProductId,
  updateStock,
  getMovements,
  getStats,
};
