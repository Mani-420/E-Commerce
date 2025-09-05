/**
 * Notification Service
 * Handles sending notifications through different channels
 */

const nodemailer = require('nodemailer');
const { createAppError } = require('../../utils/errorHandler');
const { NOTIFICATION_TYPES } = require('../../constants/notificationTypes');
const NotificationFactory = require('../factories/notificationFactory');

class NotificationService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ emailTransporter }) {
    this.emailTransporter = emailTransporter;
  }

  /**
   * Send email notification
   * @param {Object} emailData - Email data object
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, html, text } = emailData;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to,
        subject,
        html,
        text
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw createAppError({
        message: 'Failed to send email',
        statusCode: 500,
        code: 'EMAIL_SEND_ERROR'
      });
    }
  }

  /**
   * Send welcome notification
   * @param {Object} user - User object
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeNotification(user) {
    try {
      const notification = NotificationFactory.createWelcomeNotifications(user);
      
      // Send email notification
      const emailNotification = notification.find(n => n.channel === 'email');
      if (emailNotification) {
        await this.sendEmail({
          to: emailNotification.recipient,
          subject: emailNotification.subject,
          html: emailNotification.content.html,
          text: emailNotification.content.text
        });
      }

      // TODO: Implement push notification sending
      // const pushNotification = notification.find(n => n.channel === 'push');
      // if (pushNotification) {
      //   await this.sendPushNotification(pushNotification);
      // }

      return {
        success: true,
        message: 'Welcome notification sent successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to send welcome notification',
        statusCode: 500,
        code: 'WELCOME_NOTIFICATION_ERROR'
      });
    }
  }

  /**
   * Send OTP notification
   * @param {Object} user - User object
   * @param {string} otpCode - OTP code
   * @param {string} type - OTP type
   * @returns {Promise<Object>} Send result
   */
  async sendOtpNotification(user, otpCode, type) {
    try {
      const notifications = NotificationFactory.createOtpNotifications(user, otpCode);
      
      // Send email notification
      const emailNotification = notifications.find(n => n.channel === 'email');
      if (emailNotification) {
        await this.sendEmail({
          to: emailNotification.recipient,
          subject: emailNotification.subject,
          html: emailNotification.content.html,
          text: emailNotification.content.text
        });
      }

      // TODO: Implement SMS notification sending
      // const smsNotification = notifications.find(n => n.channel === 'sms');
      // if (smsNotification) {
      //   await this.sendSms(smsNotification);
      // }

      return {
        success: true,
        message: 'OTP notification sent successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to send OTP notification',
        statusCode: 500,
        code: 'OTP_NOTIFICATION_ERROR'
      });
    }
  }

  /**
   * Send password reset notification
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @param {string} resetUrl - Reset URL
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetNotification(user, resetToken, resetUrl) {
    try {
      const notification = NotificationFactory.createPasswordResetNotification(user, resetToken, resetUrl);
      
      await this.sendEmail({
        to: notification.recipient,
        subject: notification.subject,
        html: notification.content.html,
        text: notification.content.text
      });

      return {
        success: true,
        message: 'Password reset notification sent successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to send password reset notification',
        statusCode: 500,
        code: 'PASSWORD_RESET_NOTIFICATION_ERROR'
      });
    }
  }

  /**
   * Send login notification
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {Promise<Object>} Send result
   */
  async sendLoginNotification(user, loginInfo) {
    try {
      const notifications = NotificationFactory.createLoginNotifications(user, loginInfo);
      
      // Send email notification
      const emailNotification = notifications.find(n => n.channel === 'email');
      if (emailNotification) {
        await this.sendEmail({
          to: emailNotification.recipient,
          subject: emailNotification.subject,
          html: emailNotification.content.html,
          text: emailNotification.content.text
        });
      }

      // TODO: Implement SMS notification sending
      // const smsNotification = notifications.find(n => n.channel === 'sms');
      // if (smsNotification) {
      //   await this.sendSms(smsNotification);
      // }

      return {
        success: true,
        message: 'Login notification sent successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to send login notification',
        statusCode: 500,
        code: 'LOGIN_NOTIFICATION_ERROR'
      });
    }
  }

  /**
   * Send custom notification
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @param {string} channel - Notification channel
   * @returns {Promise<Object>} Send result
   */
  async sendCustomNotification(type, data, channel = 'email') {
    try {
      const notification = NotificationFactory.create(type, data, channel);
      
      if (channel === 'email') {
        await this.sendEmail({
          to: notification.recipient,
          subject: notification.subject,
          html: notification.content.html,
          text: notification.content.text
        });
      }
      // TODO: Implement other channels

      return {
        success: true,
        message: 'Custom notification sent successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to send custom notification',
        statusCode: 500,
        code: 'CUSTOM_NOTIFICATION_ERROR'
      });
    }
  }

  /**
   * Test email configuration
   * @returns {Promise<Object>} Test result
   */
  async testEmailConfiguration() {
    try {
      const testEmail = {
        to: process.env.EMAIL_USER,
        subject: 'Test Email Configuration',
        html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>',
        text: 'Test Email - This is a test email to verify email configuration.'
      };

      await this.sendEmail(testEmail);

      return {
        success: true,
        message: 'Email configuration test successful'
      };
    } catch (error) {
      throw createAppError({
        message: 'Email configuration test failed',
        statusCode: 500,
        code: 'EMAIL_CONFIG_TEST_ERROR'
      });
    }
  }
}

module.exports = NotificationService;
