/**
 * Admin Controller
 * Handles admin-only API endpoints
 */

const asyncHandler = require('../utils/asyncHandler');
const ResponseFactory = require('../app/factories/responseFactory');

class AdminController {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ userService }) {
    this.userService = userService;

    // Bind methods with asyncHandler
    this.getUsers = asyncHandler(this.getUsers.bind(this));
    this.getUserById = asyncHandler(this.getUserById.bind(this));
    this.updateUserStatus = asyncHandler(this.updateUserStatus.bind(this));
    this.deleteUser = asyncHandler(this.deleteUser.bind(this));
    this.getSystemStats = asyncHandler(this.getSystemStats.bind(this));
  }

  /**
   * Get all users with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsers(req, res) {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      role,
      status
    };

    const result = await this.userService.getUsers(options);

    res.status(200).json(ResponseFactory.paginated(
      result.users,
      result.pagination,
      'Users retrieved successfully'
    ));
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    const { userId } = req.params;

    const result = await this.userService.getUserProfile(parseInt(userId));

    res.status(200).json(ResponseFactory.success(
      result,
      'User retrieved successfully'
    ));
  }

  /**
   * Update user status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserStatus(req, res) {
    const { userId } = req.params;
    const { status } = req.body;

    const result = await this.userService.updateUserStatus(parseInt(userId), status);

    res.status(200).json(ResponseFactory.success(
      result,
      result.message
    ));
  }

  /**
   * Delete user (soft delete)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    const { userId } = req.params;

    const result = await this.userService.deleteUser(parseInt(userId));

    res.status(200).json(ResponseFactory.success(
      null,
      result.message
    ));
  }

  /**
   * Get system statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSystemStats(req, res) {
    try {
      // Get user statistics from user service
      const userStats = await this.userService.getUserStats();

      const stats = {
        ...userStats,
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      res.status(200).json(ResponseFactory.success(
        stats,
        'System statistics retrieved successfully'
      ));
    } catch (error) {
      // If user stats fail, return basic system stats
      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        pendingVerifications: 0,
        suspendedUsers: 0,
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch user statistics'
      };

      res.status(200).json(ResponseFactory.success(
        stats,
        'System statistics retrieved successfully (user stats unavailable)'
      ));
    }
  }
}

module.exports = AdminController;
