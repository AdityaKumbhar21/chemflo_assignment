const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

const login = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user);

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Create admin user if it doesn't exist (for seeding)
const createAdminIfNotExists = async () => {
  const adminEmail = 'admin@chemflo.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
      },
    });
    console.log('Admin user created: admin@chemflo.com / admin123');
  }
};

module.exports = {
  login,
  verifyToken,
  getUserById,
  generateToken,
  createAdminIfNotExists,
};
