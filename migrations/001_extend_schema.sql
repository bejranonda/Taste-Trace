-- TasteTrace Schema Extension Migration
-- Version: 2.0.0
-- Adds tables for: Queue Prediction, Foodie Match, Menu Decoder, Route Planner

-- ============================================
-- Queue History for ML Predictions
-- ============================================
CREATE TABLE IF NOT EXISTS queue_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  wait_minutes INTEGER NOT NULL,
  crowd_level TEXT CHECK (crowd_level IN ('low', 'medium', 'high', 'peak')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_queue_history_restaurant ON queue_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_day_hour ON queue_history(day_of_week, hour);

-- ============================================
-- Foodie Matching Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS matching_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  scheduled_time TEXT,
  max_participants INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matching_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_session_id TEXT NOT NULL,
  display_name TEXT,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES matching_sessions(id) ON DELETE CASCADE,
  UNIQUE(session_id, user_session_id)
);

CREATE INDEX IF NOT EXISTS idx_matching_sessions_restaurant ON matching_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_matching_sessions_status ON matching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_matching_participants_session ON matching_participants(session_id);

-- ============================================
-- Menu Translations Cache
-- ============================================
CREATE TABLE IF NOT EXISTS menu_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER,
  dish_name_original TEXT NOT NULL,
  dish_name_en TEXT,
  description_en TEXT,
  price_thb INTEGER,
  is_signature INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_menu_translations_restaurant ON menu_translations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_translations_original ON menu_translations(dish_name_original);

-- ============================================
-- Food Trip Planning
-- ============================================
CREATE TABLE IF NOT EXISTS food_trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  stop_order INTEGER NOT NULL,
  suggested_time TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES food_trips(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE(trip_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_food_trips_creator ON food_trips(creator_session_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops(trip_id);

-- ============================================
-- Extend Restaurants Table (via new columns)
-- Note: D1 doesn't support ALTER TABLE ADD COLUMN with constraints
-- These columns are added as optional TEXT fields
-- ============================================

-- Queue History Seed Data (based on real Bangkok restaurant patterns)
INSERT INTO queue_history (restaurant_id, day_of_week, hour, wait_minutes, crowd_level) VALUES
-- Jae Fai (id=1) - Famous for extremely long queues
(1, 0, 8, 30, 'medium'),
(1, 0, 9, 60, 'high'),
(1, 0, 10, 120, 'peak'),
(1, 0, 11, 180, 'peak'),
(1, 0, 12, 240, 'peak'),
(1, 0, 13, 200, 'peak'),
(1, 0, 14, 150, 'high'),
(1, 0, 15, 90, 'high'),
(1, 0, 16, 60, 'medium'),
(1, 0, 17, 120, 'high'),
(1, 1, 8, 20, 'medium'),
(1, 1, 9, 45, 'medium'),
(1, 1, 10, 90, 'high'),
(1, 1, 11, 150, 'peak'),
(1, 1, 12, 200, 'peak'),
(1, 1, 13, 180, 'peak'),
(1, 2, 8, 15, 'low'),
(1, 2, 9, 30, 'medium'),
(1, 2, 10, 60, 'medium'),
(1, 2, 11, 100, 'high'),
(1, 3, 8, 20, 'medium'),
(1, 3, 9, 40, 'medium'),
(1, 3, 10, 80, 'high'),
(1, 4, 8, 25, 'medium'),
(1, 4, 9, 50, 'medium'),
(1, 4, 10, 100, 'high'),
(1, 4, 11, 160, 'peak'),
(1, 5, 8, 30, 'medium'),
(1, 5, 9, 60, 'high'),
(1, 5, 10, 120, 'peak'),
(1, 5, 11, 200, 'peak'),
(1, 6, 8, 40, 'high'),
(1, 6, 9, 80, 'high'),
(1, 6, 10, 150, 'peak'),
(1, 6, 11, 220, 'peak'),

-- Thip Samai (id=2) - Pad Thai, busy dinner times
(2, 0, 17, 45, 'high'),
(2, 0, 18, 60, 'high'),
(2, 0, 19, 75, 'peak'),
(2, 0, 20, 60, 'high'),
(2, 1, 17, 30, 'medium'),
(2, 1, 18, 45, 'high'),
(2, 1, 19, 60, 'high'),
(2, 2, 17, 20, 'medium'),
(2, 2, 18, 30, 'medium'),
(2, 3, 17, 25, 'medium'),
(2, 3, 18, 40, 'high'),
(2, 4, 17, 35, 'high'),
(2, 4, 18, 50, 'high'),
(2, 5, 17, 40, 'high'),
(2, 5, 18, 55, 'high'),
(2, 6, 17, 50, 'high'),
(2, 6, 18, 70, 'peak'),

-- Wattana Panich (id=3) - Beef Noodle, lunch rush
(3, 0, 11, 15, 'medium'),
(3, 0, 12, 25, 'high'),
(3, 0, 13, 20, 'medium'),
(3, 1, 11, 10, 'low'),
(3, 1, 12, 20, 'medium'),
(3, 2, 11, 8, 'low'),
(3, 2, 12, 15, 'medium'),
(3, 3, 11, 12, 'medium'),
(3, 3, 12, 22, 'medium'),
(3, 4, 11, 15, 'medium'),
(3, 4, 12, 25, 'high'),
(3, 5, 11, 18, 'medium'),
(3, 5, 12, 30, 'high'),
(3, 6, 11, 20, 'high'),
(3, 6, 12, 35, 'high');

-- Menu Translations Seed Data
INSERT INTO menu_translations (restaurant_id, dish_name_original, dish_name_en, description_en, price_thb, is_signature) VALUES
-- Jae Fai
(1, 'ไข่เจียวปู', 'Crab Omelette', 'Legendary crispy omelette stuffed with fresh crab meat', 1000, 1),
(1, 'ผัดขี้เมา', 'Drunken Noodles', 'Spicy stir-fried noodles with Thai basil', 500, 0),
(1, 'ผัดไทย', 'Pad Thai', 'Classic Thai stir-fried rice noodles', 400, 0),
(1, 'ข้าวผัดปู', 'Crab Fried Rice', 'Fried rice with fresh crab meat', 600, 0),

-- Thip Samai
(2, 'ผัดไทยไข่ห่อ', 'Pad Thai Wrapped in Egg', 'Signature Pad Thai encased in thin egg crepe', 150, 1),
(2, 'ผัดไทยธรรมดา', 'Regular Pad Thai', 'Classic Pad Thai without egg wrapper', 80, 0),
(2, 'ส้มกรอก', 'Fresh Orange Juice', 'Freshly squeezed Thai orange juice', 50, 1),

-- Wattana Panich
(3, 'ก๋วยเตี๋ยวเนื้อน้ำตก', 'Beef Noodle Soup', 'Rich broth stewed for 50 years with tender beef', 100, 1),
(3, 'เนื้อทับ', 'Extra Beef', 'Additional beef slices', 50, 0),
(3, 'เส้นเล็ก', 'Small Rice Noodles', 'Thin rice noodles', 0, 0),

-- Broccoli Revolution
(4, 'คีนัวเบอร์เกอร์', 'Quinoa Burger', 'Plant-based burger with quinoa patty', 250, 1),
(4, 'สลัดอะโวคาโด', 'Avocado Salad', 'Fresh avocado with mixed greens', 180, 0),
(4, 'สมูทตี้เขียว', 'Green Smoothie', 'Spinach, banana, and almond milk blend', 120, 0);
