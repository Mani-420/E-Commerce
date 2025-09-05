/**
 * Main Application Entry Point
 * E-commerce Backend API Server
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import configurations and utilities
const { globalErrorHandler, notFoundHandler } = require('./src/middleware/globalErrorHandler');
const { startDB } = require('./src/utils/dbUtils');

// Import compositions and routes
const { initializeAuthComposition } = require('./src/app/compositions/authComposition');
const { initializeCategoryComposition } = require('./src/app/compositions/categoryComposition');
const { initializeProductComposition } = require('./src/app/compositions/productComposition');
const setupRoutes = require('./src/routes');

// Import constants
const { API_MESSAGES } = require('./src/constants/apiMessages');

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.dependencies = null;
  }

  /**
   * Initialize application dependencies
   */
  async initializeDependencies() {
    try {
      console.log('🔧 Initializing dependencies...');
      
      // Initialize all compositions
      const authDependencies = initializeAuthComposition();
      const categoryDependencies = initializeCategoryComposition();
      const productDependencies = initializeProductComposition();
      
      // Merge all dependencies
      this.dependencies = {
        ...authDependencies,
        ...categoryDependencies,
        ...productDependencies
      };
      
      console.log('✅ Dependencies initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize dependencies:', error.message);
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    console.log('🔧 Setting up middleware...');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });

    console.log('✅ Middleware setup completed');
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    console.log('🔧 Setting up routes...');

    // Setup all routes with dependencies
    this.app.use('/api', setupRoutes(this.dependencies));

    // 404 handler for undefined routes
    this.app.use('*', notFoundHandler);

    console.log('✅ Routes setup completed');
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    console.log('🔧 Setting up error handling...');

    // Global error handler
    this.app.use(globalErrorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      this.shutdown();
    });

    console.log('✅ Error handling setup completed');
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    try {
      await startDB();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      console.log('🚀 Starting E-commerce Backend API...');
      console.log(`📅 Started at: ${new Date().toISOString()}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

      // Test database connection
      await this.testDatabaseConnection();

      // Initialize dependencies
      await this.initializeDependencies();

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`🎉 Server is running on port ${this.port}`);
        console.log(`📡 API Base URL: http://localhost:${this.port}/api`);
        console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
        console.log(`📋 API Version: http://localhost:${this.port}/api/version`);
        console.log(`🔐 Auth Endpoints: http://localhost:${this.port}/api/v1/auth`);
        console.log(`👑 Admin Endpoints: http://localhost:${this.port}/api/v1/admin`);
        console.log('✨ E-commerce Backend API is ready!');
      });

      // Handle server errors
      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${this.port} is already in use`);
        } else {
          console.error('❌ Server error:', error);
        }
        process.exit(1);
      });

    } catch (error) {
      console.error('💥 Failed to start server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('🛑 Shutting down server...');

      if (this.server) {
        this.server.close(() => {
          console.log('✅ HTTP server closed');
        });
      }

      // Close database connections
      if (this.dependencies && this.dependencies.emailTransporter) {
        this.dependencies.emailTransporter.close();
        console.log('✅ Email transporter closed');
      }

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new Application();

// Start the server
app.start().catch((error) => {
  console.error('💥 Application startup failed:', error);
  process.exit(1);
});

module.exports = app;
