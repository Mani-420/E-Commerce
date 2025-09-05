/**
 * Notification Factory
 * Centralized notification creation for different channels and types
 */

const { NOTIFICATION_TYPES } = require('../../constants/notificationTypes');
const EmailFactory = require('./emailFactory');

class NotificationFactory {
  /**
   * Create a notification object
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @param {string} channel - Notification channel (email, push, sms)
   * @returns {Object} Notification object
   */
  static create(type, data, channel = 'email') {
    const baseNotification = {
      type,
      channel,
      data,
      createdAt: new Date(),
      status: 'pending'
    };

    switch (channel) {
      case 'email':
        return this.createEmailNotification(type, data);
      case 'push':
        return this.createPushNotification(type, data);
      case 'sms':
        return this.createSmsNotification(type, data);
      default:
        return baseNotification;
    }
  }

  /**
   * Create email notification
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @returns {Object} Email notification object
   */
  static createEmailNotification(type, data) {
    let emailData;

    switch (type) {
      case NOTIFICATION_TYPES.WELCOME_EMAIL:
        emailData = EmailFactory.welcomeEmail(data.user);
        break;
      case NOTIFICATION_TYPES.OTP_EMAIL:
        emailData = EmailFactory.otpVerificationEmail(data.user, data.otpCode);
        break;
      case NOTIFICATION_TYPES.PASSWORD_RESET_EMAIL:
        emailData = EmailFactory.passwordResetEmail(data.user, data.resetToken, data.resetUrl);
        break;
      case NOTIFICATION_TYPES.LOGIN_NOTIFICATION:
        emailData = EmailFactory.loginNotificationEmail(data.user, data.loginInfo);
        break;
      default:
        throw new Error(`Unknown email notification type: ${type}`);
    }

    return {
      type,
      channel: 'email',
      recipient: emailData.to,
      subject: emailData.subject,
      content: {
        html: emailData.html,
        text: emailData.text
      },
      data: emailData.data,
      template: emailData.template,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  /**
   * Create push notification
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @returns {Object} Push notification object
   */
  static createPushNotification(type, data) {
    let pushData;

    switch (type) {
      case NOTIFICATION_TYPES.WELCOME_EMAIL:
        pushData = {
          title: 'Welcome!',
          body: `Welcome to our platform, ${data.user.first_name}!`,
          data: {
            type: 'welcome',
            userId: data.user.id
          }
        };
        break;
      case NOTIFICATION_TYPES.LOGIN_NOTIFICATION:
        pushData = {
          title: 'New Login Detected',
          body: `New login detected for your account at ${data.loginInfo.loginTime}`,
          data: {
            type: 'login',
            userId: data.user.id,
            loginTime: data.loginInfo.loginTime
          }
        };
        break;
      default:
        throw new Error(`Unknown push notification type: ${type}`);
    }

    return {
      type,
      channel: 'push',
      recipient: data.user.id, // User ID for push notifications
      title: pushData.title,
      body: pushData.body,
      data: pushData.data,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  /**
   * Create SMS notification
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @returns {Object} SMS notification object
   */
  static createSmsNotification(type, data) {
    let smsData;

    switch (type) {
      case NOTIFICATION_TYPES.OTP_EMAIL:
        smsData = {
          message: `Your verification code is: ${data.otpCode}. This code expires in 10 minutes.`
        };
        break;
      case NOTIFICATION_TYPES.LOGIN_NOTIFICATION:
        smsData = {
          message: `New login detected for your account at ${data.loginInfo.loginTime}. If this wasn't you, contact support immediately.`
        };
        break;
      default:
        throw new Error(`Unknown SMS notification type: ${type}`);
    }

    return {
      type,
      channel: 'sms',
      recipient: data.user.phone,
      message: smsData.message,
      createdAt: new Date(),
      status: 'pending'
    };
  }

  /**
   * Create multiple notifications for different channels
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   * @param {Array} channels - Array of channels to send to
   * @returns {Array} Array of notification objects
   */
  static createMultiChannel(type, data, channels = ['email']) {
    return channels.map(channel => this.create(type, data, channel));
  }

  /**
   * Create welcome notifications (email + push)
   * @param {Object} user - User object
   * @returns {Array} Array of welcome notifications
   */
  static createWelcomeNotifications(user) {
    const data = { user };
    return this.createMultiChannel(NOTIFICATION_TYPES.WELCOME_EMAIL, data, ['email', 'push']);
  }

  /**
   * Create OTP notifications (email + sms if phone available)
   * @param {Object} user - User object
   * @param {string} otpCode - OTP code
   * @returns {Array} Array of OTP notifications
   */
  static createOtpNotifications(user, otpCode) {
    const data = { user, otpCode };
    const channels = ['email'];
    
    if (user.phone) {
      channels.push('sms');
    }
    
    return this.createMultiChannel(NOTIFICATION_TYPES.OTP_EMAIL, data, channels);
  }

  /**
   * Create password reset notification
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @param {string} resetUrl - Reset URL
   * @returns {Object} Password reset notification
   */
  static createPasswordResetNotification(user, resetToken, resetUrl) {
    const data = { user, resetToken, resetUrl };
    return this.create(NOTIFICATION_TYPES.PASSWORD_RESET_EMAIL, data, 'email');
  }

  /**
   * Create login notification
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information
   * @returns {Array} Array of login notifications
   */
  static createLoginNotifications(user, loginInfo) {
    const data = { user, loginInfo };
    const channels = ['email'];
    
    if (user.phone) {
      channels.push('sms');
    }
    
    return this.createMultiChannel(NOTIFICATION_TYPES.LOGIN_NOTIFICATION, data, channels);
  }
}

module.exports = NotificationFactory;
