/**
 * Authentication Controller
 * Handles authentication-related API endpoints
 */

const asyncHandler = require('../utils/asyncHandler');
const ResponseFactory = require('../app/factories/responseFactory');
const { API_MESSAGES } = require('../constants/apiMessages');

class AuthController {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ userService, authService, otpService, notificationService }) {
    this.userService = userService;
    this.authService = authService;
    this.otpService = otpService;
    this.notificationService = notificationService;

    // Bind methods with asyncHandler
    this.register = asyncHandler(this.register.bind(this));
    this.login = asyncHandler(this.login.bind(this));
    this.logout = asyncHandler(this.logout.bind(this));
    this.verifyEmail = asyncHandler(this.verifyEmail.bind(this));
    this.resendOtp = asyncHandler(this.resendOtp.bind(this));
    this.forgotPassword = asyncHandler(this.forgotPassword.bind(this));
    this.resetPassword = asyncHandler(this.resetPassword.bind(this));
    this.refreshToken = asyncHandler(this.refreshToken.bind(this));
    this.changePassword = asyncHandler(this.changePassword.bind(this));
    this.getProfile = asyncHandler(this.getProfile.bind(this));
    this.updateProfile = asyncHandler(this.updateProfile.bind(this));
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const result = await this.userService.registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      role
    });

    res.status(201).json(ResponseFactory.success(
      result,
      result.message,
      201
    ));
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    const { email, password } = req.body;

    const result = await this.authService.authenticateUser(email, password);

    // Send login notification
    const loginInfo = {
      loginTime: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    try {
      await this.notificationService.sendLoginNotification(result.user, loginInfo);
    } catch (error) {
      // Log error but don't fail the login
      console.error('Failed to send login notification:', error.message);
    }

    res.status(200).json(ResponseFactory.success(
      result,
      API_MESSAGES.LOGIN_SUCCESS
    ));
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    // The client should remove the token from storage

    res.status(200).json(ResponseFactory.success(
      null,
      API_MESSAGES.LOGOUT_SUCCESS
    ));
  }

  /**
   * Verify email with OTP
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyEmail(req, res) {
    const { email, otpCode } = req.body;

    const result = await this.userService.verifyEmail(email, otpCode);

    res.status(200).json(ResponseFactory.success(
      result,
      result.message
    ));
  }

  /**
   * Resend OTP for email verification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resendOtp(req, res) {
    const { email } = req.body;

    const result = await this.userService.resendOtp(email);

    res.status(200).json(ResponseFactory.success(
      result,
      result.message
    ));
  }

  /**
   * Forgot password - send reset email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async forgotPassword(req, res) {
    const { email } = req.body;

    const result = await this.authService.createPasswordResetToken(email);

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${result.resetToken}`;
    
    await this.notificationService.sendPasswordResetNotification(
      result.user,
      result.resetToken,
      resetUrl
    );

    res.status(200).json(ResponseFactory.success(
      { email: result.user.email },
      API_MESSAGES.PASSWORD_RESET_SENT
    ));
  }

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    const { token, password } = req.body;

    const result = await this.authService.resetPassword(token, password);

    res.status(200).json(ResponseFactory.success(
      null,
      result.message
    ));
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    const result = await this.authService.refreshAccessToken(refreshToken);

    res.status(200).json(ResponseFactory.success(
      result,
      'Token refreshed successfully'
    ));
  }

  /**
   * Change password for authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await this.authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json(ResponseFactory.success(
      null,
      result.message
    ));
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    const userId = req.user.id;

    const result = await this.userService.getUserProfile(userId);

    res.status(200).json(ResponseFactory.success(
      result,
      'Profile retrieved successfully'
    ));
  }

  /**
   * Update current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    const userId = req.user.id;
    const updateData = req.body;

    const result = await this.userService.updateUserProfile(userId, updateData);

    res.status(200).json(ResponseFactory.success(
      result,
      result.message
    ));
  }
}

module.exports = AuthController;
