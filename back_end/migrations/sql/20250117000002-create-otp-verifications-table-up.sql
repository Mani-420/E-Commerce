-- Create otp_verifications table
CREATE TABLE otp_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_otp_code (otp_code),
  INDEX idx_type (type),
  INDEX idx_expires_at (expires_at),
  INDEX idx_used (used)
);
