# E-commerce Backend API

A robust, scalable e-commerce backend API built with Node.js, Express, and MySQL following clean architecture principles.

## 🚀 Features

### Phase 1 - Core Foundation ✅
- **User Authentication & Authorization**
  - User registration with email verification
  - JWT-based authentication
  - Role-based access control (Admin, Seller, Customer)
  - Password reset functionality
  - OTP-based email verification

- **Security Features**
  - Password hashing with bcrypt
  - JWT token management
  - Rate limiting
  - Input validation with Zod
  - CORS protection
  - Helmet security headers

- **Notification System**
  - Welcome emails
  - OTP verification emails
  - Password reset emails
  - Login notifications

- **Database Management**
  - MySQL database with connection pooling
  - Migration system with db-migrate
  - Proper database schema design

## 🏗️ Architecture

The project follows clean architecture principles with proper separation of concerns:

```
src/
├── controllers/          # API orchestration only
├── routes/              # Route definitions
├── middleware/          # Custom middleware
├── validators/          # Zod validation schemas
├── constants/           # Enums, statuses, allowed values
├── utils/               # Cross-cutting utilities
├── config/              # Configuration files
├── db/                  # Database connection
└── app/                 # Application layer
    ├── repositories/    # Data access layer
    ├── services/        # Business logic
    ├── compositions/    # Dependency injection wiring
    └── factories/       # Factory pattern implementations
```

## 🛠️ Technology Stack

- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Email**: Nodemailer
- **Migrations**: db-migrate
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- Node.js (>=16.0.0)
- MySQL (>=8.0)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd back_end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ecommerce_db
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@yourecommerce.com
   ```

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE ecommerce_db;
   
   # Run migrations
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

**Base URL**: `http://localhost:3000/api`  
**Current Version**: `v1`  
**Versioned Endpoints**: All endpoints are versioned (e.g., `/api/v1/auth/register`)

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/logout` | User logout | Yes |
| POST | `/api/v1/auth/verify-otp` | Verify email with OTP | No |
| POST | `/api/v1/auth/resend-otp` | Resend OTP | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| PUT | `/api/v1/auth/me` | Update user profile | Yes |
| PUT | `/api/v1/auth/change-password` | Change password | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/users` | Get all users | Admin |
| GET | `/api/v1/admin/users/:userId` | Get user by ID | Admin |
| PUT | `/api/v1/admin/users/:userId/status` | Update user status | Admin |
| DELETE | `/api/v1/admin/users/:userId` | Delete user | Admin |
| GET | `/api/v1/admin/stats` | Get system statistics | Admin |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/version` | API version info with versioning details |

## 🔧 Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start           # Start production server

# Database
npm run migrate     # Run migrations
npm run migrate:down # Rollback migrations
npm run migrate:create # Create new migration

# Testing
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `first_name` - User's first name
- `last_name` - User's last name
- `phone` - Phone number (optional)
- `role` - User role (ADMIN, SELLER, CUSTOMER)
- `status` - Account status (PENDING_VERIFICATION, ACTIVE, SUSPENDED, DELETED)
- `email_verified_at` - Email verification timestamp
- `last_login_at` - Last login timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### OTP Verifications Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `otp_code` - 6-digit OTP code
- `type` - OTP type (EMAIL_VERIFICATION, PASSWORD_RESET)
- `expires_at` - Expiration timestamp
- `used` - Boolean flag for usage
- `created_at` - Creation timestamp

### Password Resets Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - Reset token
- `expires_at` - Expiration timestamp
- `used` - Boolean flag for usage
- `created_at` - Creation timestamp

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet middleware
- **SQL Injection Protection**: Parameterized queries

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | ecommerce_db |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASSWORD` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Phase 1 Complete!** ✅

The foundation is now ready for Phase 2 implementation. The API provides a solid base for user authentication, authorization, and basic user management with proper security measures and clean architecture.
