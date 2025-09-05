/**
 * JWT Utility Functions
 * Helper functions for JWT token generation and verification
 */

const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../constants/jwtConfig');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(
      {
        ...payload,
        type: JWT_CONFIG.ACCESS_TOKEN
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }
    );
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(
      {
        ...payload,
        type: JWT_CONFIG.REFRESH_TOKEN
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE
      }
    );
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} Object containing both tokens
 */
const generateTokens = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken
};
