const productService = require('../services/product.service');
const ApiResponse = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { search, categoryId, page, limit, sortBy, sortOrder } = req.query;
    const result = await productService.getAll({
      search,
      categoryId,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    return ApiResponse.success(res, result, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getById(id);

    if (!product) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    return ApiResponse.success(res, product, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      name,
      casNumber,
      unit,
      description,
      categoryId,
      lowStockThreshold,
      initialStock,
    } = req.body;

    // Check if CAS number already exists
    const exists = await productService.checkCasNumberExists(casNumber);
    if (exists) {
      return ApiResponse.conflict(res, 'Product with this CAS Number already exists');
    }

    const product = await productService.create({
      name,
      casNumber,
      unit,
      description,
      categoryId,
      lowStockThreshold,
      initialStock,
    });

    return ApiResponse.created(res, product, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      casNumber,
      unit,
      description,
      categoryId,
      lowStockThreshold,
    } = req.body;

    // Check if product exists
    const existing = await productService.getById(id);
    if (!existing) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    // Check if new CAS number conflicts with another product
    if (casNumber) {
      const casExists = await productService.checkCasNumberExists(casNumber, id);
      if (casExists) {
        return ApiResponse.conflict(res, 'Product with this CAS Number already exists');
      }
    }

    const product = await productService.update(id, {
      name,
      casNumber,
      unit,
      description,
      categoryId,
      lowStockThreshold,
    });

    return ApiResponse.success(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = await productService.getById(id);
    if (!existing) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    await productService.delete(id);
    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await productService.getLowStock();
    return ApiResponse.success(res, products, 'Low stock products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getLowStock,
};
