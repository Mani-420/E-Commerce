/**
 * Email Factory
 * Centralized email template generation and formatting
 */

const { EMAIL_TEMPLATES } = require('../../constants/emailTemplates');

class EmailFactory {
  /**
   * Create welcome email data
   * @param {Object} user - User object
   * @returns {Object} Email data object
   */
  static welcomeEmail(user) {
    return {
      to: user.email,
      subject: 'Welcome to Our E-commerce Platform!',
      template: EMAIL_TEMPLATES.WELCOME,
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email
      },
      html: this.generateWelcomeHtml(user),
      text: this.generateWelcomeText(user)
    };
  }

  /**
   * Create OTP verification email data
   * @param {Object} user - User object
   * @param {string} otpCode - OTP code
   * @returns {Object} Email data object
   */
  static otpVerificationEmail(user, otpCode) {
    return {
      to: user.email,
      subject: 'Verify Your Email - OTP Code',
      template: EMAIL_TEMPLATES.OTP_VERIFICATION,
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        otpCode,
        expiryMinutes: 10
      },
      html: this.generateOtpHtml(user, otpCode),
      text: this.generateOtpText(user, otpCode)
    };
  }

  /**
   * Create password reset email data
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @param {string} resetUrl - Password reset URL
   * @returns {Object} Email data object
   */
  static passwordResetEmail(user, resetToken, resetUrl) {
    return {
      to: user.email,
      subject: 'Reset Your Password',
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        resetToken,
        resetUrl,
        expiryHours: 1
      },
      html: this.generatePasswordResetHtml(user, resetToken, resetUrl),
      text: this.generatePasswordResetText(user, resetToken, resetUrl)
    };
  }

  /**
   * Create login notification email data
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {Object} Email data object
   */
  static loginNotificationEmail(user, loginInfo) {
    return {
      to: user.email,
      subject: 'New Login Detected',
      template: EMAIL_TEMPLATES.LOGIN_NOTIFICATION,
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        loginTime: loginInfo.loginTime,
        ipAddress: loginInfo.ipAddress,
        userAgent: loginInfo.userAgent
      },
      html: this.generateLoginNotificationHtml(user, loginInfo),
      text: this.generateLoginNotificationText(user, loginInfo)
    };
  }

  /**
   * Generate welcome email HTML content
   * @param {Object} user - User object
   * @returns {string} HTML content
   */
  static generateWelcomeHtml(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Our E-commerce Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our E-commerce Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>Welcome to our e-commerce platform! We're excited to have you as part of our community.</p>
            <p>Your account has been successfully created and verified. You can now:</p>
            <ul>
              <li>Browse our extensive product catalog</li>
              <li>Make secure purchases</li>
              <li>Track your orders</li>
              <li>Manage your profile</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy shopping!</p>
          </div>
          <div class="footer">
            <p>© 2025 E-commerce Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email text content
   * @param {Object} user - User object
   * @returns {string} Text content
   */
  static generateWelcomeText(user) {
    return `
      Welcome to Our E-commerce Platform!
      
      Hello ${user.first_name}!
      
      Welcome to our e-commerce platform! We're excited to have you as part of our community.
      
      Your account has been successfully created and verified. You can now:
      - Browse our extensive product catalog
      - Make secure purchases
      - Track your orders
      - Manage your profile
      
      If you have any questions, feel free to contact our support team.
      
      Happy shopping!
      
      © 2025 E-commerce Platform. All rights reserved.
    `;
  }

  /**
   * Generate OTP email HTML content
   * @param {Object} user - User object
   * @param {string} otpCode - OTP code
   * @returns {string} HTML content
   */
  static generateOtpHtml(user, otpCode) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp-code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background-color: #e9ecef; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>Please use the following code to verify your email address:</p>
            <div class="otp-code">${otpCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 E-commerce Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate OTP email text content
   * @param {Object} user - User object
   * @param {string} otpCode - OTP code
   * @returns {string} Text content
   */
  static generateOtpText(user, otpCode) {
    return `
      Email Verification
      
      Hello ${user.first_name}!
      
      Please use the following code to verify your email address:
      
      ${otpCode}
      
      This code will expire in 10 minutes.
      
      If you didn't request this verification, please ignore this email.
      
      © 2025 E-commerce Platform. All rights reserved.
    `;
  }

  /**
   * Generate password reset email HTML content
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @param {string} resetUrl - Reset URL
   * @returns {string} HTML content
   */
  static generatePasswordResetHtml(user, resetToken, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .reset-button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>We received a request to reset your password. Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 E-commerce Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset email text content
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @param {string} resetUrl - Reset URL
   * @returns {string} Text content
   */
  static generatePasswordResetText(user, resetToken, resetUrl) {
    return `
      Password Reset Request
      
      Hello ${user.first_name}!
      
      We received a request to reset your password. Click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      
      © 2025 E-commerce Platform. All rights reserved.
    `;
  }

  /**
   * Generate login notification email HTML content
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {string} HTML content
   */
  static generateLoginNotificationHtml(user, loginInfo) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Login Detected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name}!</h2>
            <p>We detected a new login to your account:</p>
            <div class="info-box">
              <p><strong>Time:</strong> ${loginInfo.loginTime}</p>
              <p><strong>IP Address:</strong> ${loginInfo.ipAddress}</p>
              <p><strong>Device:</strong> ${loginInfo.userAgent}</p>
            </div>
            <p>If this was you, no action is required.</p>
            <p>If you didn't make this login, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© 2025 E-commerce Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate login notification email text content
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {string} Text content
   */
  static generateLoginNotificationText(user, loginInfo) {
    return `
      New Login Detected
      
      Hello ${user.first_name}!
      
      We detected a new login to your account:
      
      Time: ${loginInfo.loginTime}
      IP Address: ${loginInfo.ipAddress}
      Device: ${loginInfo.userAgent}
      
      If this was you, no action is required.
      
      If you didn't make this login, please contact our support team immediately.
      
      © 2025 E-commerce Platform. All rights reserved.
    `;
  }
}

module.exports = EmailFactory;
