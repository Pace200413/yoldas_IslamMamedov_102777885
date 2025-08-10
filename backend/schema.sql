-- groups like "Extra toppings", "Choose size", "No/Remove"
CREATE TABLE modifier_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_select TINYINT DEFAULT 0,   -- 0..n
  max_select TINYINT DEFAULT 0,   -- 0 = unlimited
  required TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- options inside a group
CREATE TABLE modifiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price_delta DECIMAL(10,2) DEFAULT 0.00,  -- +/− add-on price
  is_default TINYINT(1) DEFAULT 0,
  in_stock TINYINT(1) DEFAULT 1,
  FOREIGN KEY (group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE
);

-- attach groups to meals
CREATE TABLE meal_modifier_groups (
  meal_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (meal_id, group_id),
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE
);

-- store chosen customizations per line-item
ALTER TABLE order_items
  ADD COLUMN customizations JSON NULL;  -- [{group:"Size", option:"Large", delta:2.00}, ...]
