const categoryService = require('../services/category.service');
const ApiResponse = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    return ApiResponse.success(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getById(id);

    if (!category) {
      return ApiResponse.notFound(res, 'Category not found');
    }

    return ApiResponse.success(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    // Check if name already exists
    const exists = await categoryService.checkNameExists(name);
    if (exists) {
      return ApiResponse.conflict(res, 'Category with this name already exists');
    }

    const category = await categoryService.create({ name, description, color });
    return ApiResponse.created(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if category exists
    const existing = await categoryService.getById(id);
    if (!existing) {
      return ApiResponse.notFound(res, 'Category not found');
    }

    // Check if new name conflicts with another category
    if (name) {
      const nameExists = await categoryService.checkNameExists(name, id);
      if (nameExists) {
        return ApiResponse.conflict(res, 'Category with this name already exists');
      }
    }

    const category = await categoryService.update(id, { name, description, color });
    return ApiResponse.success(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existing = await categoryService.getById(id);
    if (!existing) {
      return ApiResponse.notFound(res, 'Category not found');
    }

    await categoryService.delete(id);
    return ApiResponse.success(res, null, 'Category deleted successfully');
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
};
