-- Create product_images table
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_id (product_id),
  INDEX idx_is_primary (is_primary),
  INDEX idx_sort_order (sort_order),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
