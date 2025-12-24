# ChemFlo - Chemical Inventory Management System

A full-stack inventory management system for chemical products built with Express.js, React (Vite), PostgreSQL, and Prisma ORM.

## Features

### Core Features
- ✅ **Chemical Products CRUD** - Create, Read, Update, Delete products
- ✅ **Unique CAS Numbers** - Enforce unique Chemical Abstracts Service numbers
- ✅ **Units of Measurement** - Support for KG, MT (Metric Ton), and Litre
- ✅ **Category Management** - Organize products by categories with color coding
- ✅ **Inventory Tracking** - Real-time stock level monitoring
- ✅ **Stock Updates** - Increase (IN) and Decrease (OUT) stock operations
- ✅ **Negative Stock Prevention** - Validation to prevent negative inventory

### Optional Features (Implemented)
- ✅ **Low Stock Indicator** - Visual alerts for products below threshold
- ✅ **Stock Movement History** - Complete audit trail of all IN/OUT operations
- ✅ **Search & Filter** - Search products by name or CAS number, filter by category
- ✅ **Dashboard Statistics** - Overview of inventory status
- ✅ **Modern UI** - Professional interface with Tailwind CSS

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon DB compatible)
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Components**: Headless UI, Heroicons
- **Notifications**: React Hot Toast

## Project Structure

```
chemflo_assignment/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Request validation
│   │   └── server.js          # Application entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/        # Reusable UI components
    │   │   └── layout/        # Layout components
    │   ├── pages/             # Page components
    │   ├── services/          # API service functions
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Neon DB account)

### 1. Clone the Repository
```bash
cd chemflo_assignment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your Neon DB credentials:
# DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with search/filter) |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/low-stock` | Get low stock products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all inventory |
| GET | `/api/inventory/stats` | Get dashboard statistics |
| GET | `/api/inventory/movements` | Get stock movement history |
| GET | `/api/inventory/:productId` | Get inventory by product |
| POST | `/api/inventory/:productId/stock` | Update stock (IN/OUT) |

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

### Models
- **Category** - Product categories with color coding
- **Product** - Chemical products with CAS numbers
- **Inventory** - Stock levels for each product
- **StockMovement** - History of stock changes (IN/OUT)

## Validation Rules

- **Product Name**: Required, 2-200 characters
- **CAS Number**: Required, unique, format: `XXXXXXX-XX-X`
- **Unit**: Required, one of: KG, MT, LITRE
- **Quantity**: Must be positive number
- **Stock**: Cannot go below zero


# chemflo_assignment
