const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Default admin user
const adminUser = {
  email: 'admin@chemflo.com',
  password: 'admin123',
  name: 'Admin User',
};

const categories = [
  {
    name: 'Acids',
    description: 'Corrosive substances with pH less than 7',
    color: '#ef4444',
  },
  {
    name: 'Bases',
    description: 'Alkaline substances with pH greater than 7',
    color: '#3b82f6',
  },
  {
    name: 'Solvents',
    description: 'Liquids used to dissolve other substances',
    color: '#8b5cf6',
  },
  {
    name: 'Salts',
    description: 'Ionic compounds formed from acid-base reactions',
    color: '#22c55e',
  },
  {
    name: 'Oxidizers',
    description: 'Substances that can cause or contribute to combustion',
    color: '#f97316',
  },
  {
    name: 'Polymers',
    description: 'Large molecules composed of repeating structural units',
    color: '#ec4899',
  },
  {
    name: 'Catalysts',
    description: 'Substances that increase the rate of chemical reactions',
    color: '#14b8a6',
  },
  {
    name: 'Petrochemicals',
    description: 'Chemical products derived from petroleum',
    color: '#eab308',
  },
];

const products = [
  {
    name: 'Sulfuric Acid',
    casNumber: '7664-93-9',
    unit: 'LITRE',
    description: 'Strong mineral acid used in various industrial processes',
    categoryName: 'Acids',
    lowStockThreshold: 50,
    initialStock: 500,
  },
  {
    name: 'Hydrochloric Acid',
    casNumber: '7647-01-0',
    unit: 'LITRE',
    description: 'Strong acid used in pH control and regeneration of ion exchangers',
    categoryName: 'Acids',
    lowStockThreshold: 30,
    initialStock: 300,
  },
  {
    name: 'Sodium Hydroxide',
    casNumber: '1310-73-2',
    unit: 'KG',
    description: 'Strong base used in manufacturing of paper, textiles, and detergents',
    categoryName: 'Bases',
    lowStockThreshold: 100,
    initialStock: 1000,
  },
  {
    name: 'Potassium Hydroxide',
    casNumber: '1310-58-3',
    unit: 'KG',
    description: 'Strong base used in fertilizers and as an electrolyte',
    categoryName: 'Bases',
    lowStockThreshold: 50,
    initialStock: 200,
  },
  {
    name: 'Acetone',
    casNumber: '67-64-1',
    unit: 'LITRE',
    description: 'Common solvent used in cleaning and as a chemical intermediate',
    categoryName: 'Solvents',
    lowStockThreshold: 100,
    initialStock: 800,
  },
  {
    name: 'Ethanol',
    casNumber: '64-17-5',
    unit: 'LITRE',
    description: 'Versatile solvent and fuel additive',
    categoryName: 'Solvents',
    lowStockThreshold: 200,
    initialStock: 1500,
  },
  {
    name: 'Methanol',
    casNumber: '67-56-1',
    unit: 'LITRE',
    description: 'Industrial solvent and antifreeze component',
    categoryName: 'Solvents',
    lowStockThreshold: 100,
    initialStock: 600,
  },
  {
    name: 'Sodium Chloride',
    casNumber: '7647-14-5',
    unit: 'KG',
    description: 'Common salt used in food processing and chemical manufacturing',
    categoryName: 'Salts',
    lowStockThreshold: 500,
    initialStock: 5000,
  },
  {
    name: 'Hydrogen Peroxide',
    casNumber: '7722-84-1',
    unit: 'LITRE',
    description: 'Oxidizer used in bleaching and disinfection',
    categoryName: 'Oxidizers',
    lowStockThreshold: 50,
    initialStock: 25,
  },
  {
    name: 'Polyethylene',
    casNumber: '9002-88-4',
    unit: 'KG',
    description: 'Most common plastic polymer',
    categoryName: 'Polymers',
    lowStockThreshold: 200,
    initialStock: 2000,
  },
  {
    name: 'Toluene',
    casNumber: '108-88-3',
    unit: 'LITRE',
    description: 'Aromatic hydrocarbon used as industrial solvent',
    categoryName: 'Petrochemicals',
    lowStockThreshold: 100,
    initialStock: 400,
  },
  {
    name: 'Benzene',
    casNumber: '71-43-2',
    unit: 'LITRE',
    description: 'Basic petrochemical used in manufacturing plastics and resins',
    categoryName: 'Petrochemicals',
    lowStockThreshold: 50,
    initialStock: 150,
  },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  console.log('Creating admin user...');
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminUser.email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    await prisma.user.create({
      data: {
        ...adminUser,
        password: hashedPassword,
      },
    });
    console.log(`  ✓ Admin user created (${adminUser.email})`);
  } else {
    console.log(`  - Admin user already exists (${adminUser.email})`);
  }

  // Create categories
  console.log('\nCreating categories...');
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`  ✓ ${created.name}`);
  }

  // Get all categories for reference
  const categoryMap = {};
  const allCategories = await prisma.category.findMany();
  allCategories.forEach((cat) => {
    categoryMap[cat.name] = cat.id;
  });

  // Create products with inventory
  console.log('\nCreating products with inventory...');
  for (const product of products) {
    const { categoryName, initialStock, ...productData } = product;
    
    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { casNumber: productData.casNumber },
    });

    if (existing) {
      console.log(`  - ${productData.name} (already exists)`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        ...productData,
        categoryId: categoryMap[categoryName],
      },
    });

    // Create inventory
    await prisma.inventory.create({
      data: {
        productId: created.id,
        currentStock: initialStock,
      },
    });

    // Create initial stock movement
    await prisma.stockMovement.create({
      data: {
        productId: created.id,
        type: 'IN',
        quantity: initialStock,
        notes: 'Initial stock from seed data',
      },
    });

    console.log(`  ✓ ${created.name} (Stock: ${initialStock} ${created.unit})`);
  }

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
