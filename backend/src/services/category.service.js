const prisma = require('../config/database');

const getAll = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};

const getById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

const create = async (data) => {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
    },
  });
};

const update = async (id, data) => {
  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
    },
  });
};

const remove = async (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

const checkNameExists = async (name, excludeId = null) => {
  const where = { name };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  const category = await prisma.category.findFirst({ where });
  return !!category;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  checkNameExists,
};
