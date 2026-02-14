-- TasteTrace Database Schema for Cloudflare D1
-- Version: 2.0.0
-- Complete schema with all tables for EatJourney features

-- ============================================
-- Core Tables
-- ============================================

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  badges TEXT, -- JSON array of badges: ["michelin", "shell_chuan_chim"]
  dietary TEXT DEFAULT '[]', -- JSON array: ["vegan", "halal", "glutenFree"]
  price_range TEXT DEFAULT '$$', -- $, $$, $$$, $$$$
  opening_hours TEXT, -- JSON object: {"open": "09:00", "close": "21:00", "days": [0,1,2,3,4,5,6]}
  average_wait INTEGER DEFAULT 30, -- Average wait time in minutes
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  google_maps_url TEXT,
  ai_analysis TEXT, -- JSON object: {"pros": [], "cons": [], "credibilityScore": 80, "trend": []}
  reviews TEXT, -- JSON object: {"google": 4.2, "facebook": 4.5, "wongnai": 3.8}
  influencer_reviews TEXT DEFAULT '[]', -- JSON array of video reviews
  dishes TEXT DEFAULT '[]', -- JSON array of menu items
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences (for personalization)
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'th',
  favorites TEXT DEFAULT '[]', -- JSON array of restaurant IDs
  taste_profile TEXT DEFAULT '{}', -- JSON object with dietary preferences
  achievements TEXT DEFAULT '[]', -- JSON array of earned achievements
  stats TEXT DEFAULT '{}', -- JSON object with user statistics
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_restaurants_badges ON restaurants(badges);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_session ON user_preferences(session_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_restaurant ON queue_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_day_hour ON queue_history(day_of_week, hour);
CREATE INDEX IF NOT EXISTS idx_matching_sessions_restaurant ON matching_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_matching_sessions_status ON matching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_matching_participants_session ON matching_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_menu_translations_restaurant ON menu_translations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_trips_creator ON food_trips(creator_session_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops(trip_id);

-- ============================================
-- Seed Data: Real Restaurants Only
-- ============================================

-- Insert real restaurant data with full EatJourney features
INSERT INTO restaurants (name, category, badges, dietary, price_range, opening_hours, average_wait, lat, lng, google_maps_url, ai_analysis, reviews, influencer_reviews, dishes) VALUES
('ร้านเจ๊ไฝ (Jae Fai)', 'Street Food',
  '["michelin", "shell_chuan_chim"]',
  '[]',
  '$$$',
  '{"open": "15:00", "close": "00:00", "days": [2,3,4,5,6]}',
  180,
  13.7523, 100.5108,
  'https://www.google.com/maps/place/Raan+Jay+Fai',
  '{"pros": ["Crab Omelette is legendary", "Open kitchen experience", "Michelin Star quality"], "cons": ["Extremely long wait", "Expensive for street food", "No reservations"], "credibilityScore": 95, "trend": [60, 75, 85, 90, 95, 92]}',
  '{"google": 4.4, "facebook": 4.8, "wongnai": 4.0}',
  '[{"id":"v1","platform":"youtube","thumbnail":"https://img.youtube.com/vi/1ZgD3j2y4y8/maxresdefault.jpg","url":"https://www.youtube.com/watch?v=1ZgD3j2y4y8","title":"Mark Wiens - Eating at Jae Fai","timestamp":"5m 30s"}]',
  '[{"name":"ไข่เจียวปู","nameEn":"Crab Omelette","price":1000,"isSignature":true},{"name":"ผัดขี้เมา","nameEn":"Drunken Noodles","price":500,"isSignature":false}]'
),

('ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)', 'Pad Thai',
  '["michelin", "shell_chuan_chim"]',
  '[]',
  '$$',
  '{"open": "17:00", "close": "01:00", "days": [0,1,2,3,4,5,6]}',
  45,
  13.7528, 100.5048,
  'https://www.google.com/maps/place/Thip+Samai',
  '{"pros": ["Iconic Pad Thai", "Fast service", "Original recipe"], "cons": ["Sweet taste profile", "Crowded with tourists", "Long queue at dinner"], "credibilityScore": 88, "trend": [70, 75, 80, 85, 88, 85]}',
  '{"google": 4.2, "facebook": 4.5, "wongnai": 3.8}',
  '[]',
  '[{"name":"ผัดไทยไข่ห่อ","nameEn":"Pad Thai Wrapped in Egg","price":150,"isSignature":true},{"name":"ส้มกรอก","nameEn":"Fresh Orange Juice","price":50,"isSignature":true}]'
),

('วัฒนาพานิช (Wattana Panich)', 'Beef Noodle',
  '["michelin", "shell_chuan_chim"]',
  '[]',
  '$',
  '{"open": "09:00", "close": "17:00", "days": [0,1,2,3,4,5,6]}',
  15,
  13.7392, 100.5294,
  'https://www.google.com/maps/place/Wattana+Panich',
  '{"pros": ["Rich broth stewed for 50 years", "Tender beef", "Authentic vibe"], "cons": ["Small portion", "Hot environment", "Limited seating"], "credibilityScore": 92, "trend": [80, 82, 85, 88, 90, 92]}',
  '{"google": 4.5, "facebook": 4.7, "wongnai": 4.2}',
  '[]',
  '[{"name":"ก๋วยเตี๋ยวเนื้อน้ำตก","nameEn":"Beef Noodle Soup","price":100,"isSignature":true}]'
),

('Broccoli Revolution', 'Vegan',
  '[]',
  '["vegan", "glutenFree"]',
  '$$',
  '{"open": "10:00", "close": "22:00", "days": [0,1,2,3,4,5,6]}',
  0,
  13.7400, 100.5400,
  'https://www.google.com/maps/place/Broccoli+Revolution+Bangkok',
  '{"pros": ["Health-conscious", "Modern atmosphere", "Creative menu"], "cons": ["Pricey", "Small portions", "Service can be slow"], "credibilityScore": 85, "trend": [70, 75, 78, 80, 82, 85]}',
  '{"google": 4.3, "facebook": 4.4, "wongnai": 4.0}',
  '[]',
  '[{"name":"คีนัวเบอร์เกอร์","nameEn":"Quinoa Burger","price":250,"isSignature":true}]'
);

-- Queue History Seed Data
INSERT INTO queue_history (restaurant_id, day_of_week, hour, wait_minutes, crowd_level) VALUES
-- Jae Fai (id=1)
(1, 0, 15, 30, 'medium'), (1, 0, 16, 60, 'high'), (1, 0, 17, 120, 'peak'), (1, 0, 18, 180, 'peak'), (1, 0, 19, 240, 'peak'), (1, 0, 20, 200, 'peak'),
(1, 1, 15, 20, 'medium'), (1, 1, 16, 45, 'medium'), (1, 1, 17, 90, 'high'), (1, 1, 18, 150, 'peak'),
(1, 2, 15, 15, 'low'), (1, 2, 16, 30, 'medium'), (1, 2, 17, 60, 'medium'), (1, 2, 18, 100, 'high'),
(1, 3, 15, 20, 'medium'), (1, 3, 16, 40, 'medium'), (1, 3, 17, 80, 'high'),
(1, 4, 15, 25, 'medium'), (1, 4, 16, 50, 'medium'), (1, 4, 17, 100, 'high'), (1, 4, 18, 160, 'peak'),
(1, 5, 15, 30, 'medium'), (1, 5, 16, 60, 'high'), (1, 5, 17, 120, 'peak'), (1, 5, 18, 200, 'peak'),
(1, 6, 15, 40, 'high'), (1, 6, 16, 80, 'high'), (1, 6, 17, 150, 'peak'), (1, 6, 18, 220, 'peak'),

-- Thip Samai (id=2)
(2, 0, 17, 45, 'high'), (2, 0, 18, 60, 'high'), (2, 0, 19, 75, 'peak'), (2, 0, 20, 60, 'high'),
(2, 1, 17, 30, 'medium'), (2, 1, 18, 45, 'high'), (2, 1, 19, 60, 'high'),
(2, 2, 17, 20, 'medium'), (2, 2, 18, 30, 'medium'),
(2, 3, 17, 25, 'medium'), (2, 3, 18, 40, 'high'),
(2, 4, 17, 35, 'high'), (2, 4, 18, 50, 'high'),
(2, 5, 17, 40, 'high'), (2, 5, 18, 55, 'high'),
(2, 6, 17, 50, 'high'), (2, 6, 18, 70, 'peak'),

-- Wattana Panich (id=3)
(3, 0, 11, 15, 'medium'), (3, 0, 12, 25, 'high'), (3, 0, 13, 20, 'medium'),
(3, 1, 11, 10, 'low'), (3, 1, 12, 20, 'medium'),
(3, 2, 11, 8, 'low'), (3, 2, 12, 15, 'medium'),
(3, 3, 11, 12, 'medium'), (3, 3, 12, 22, 'medium'),
(3, 4, 11, 15, 'medium'), (3, 4, 12, 25, 'high'),
(3, 5, 11, 18, 'medium'), (3, 5, 12, 30, 'high'),
(3, 6, 11, 20, 'high'), (3, 6, 12, 35, 'high');

-- Menu Translations Seed Data
INSERT INTO menu_translations (restaurant_id, dish_name_original, dish_name_en, description_en, price_thb, is_signature) VALUES
(1, 'ไข่เจียวปู', 'Crab Omelette', 'Legendary crispy omelette stuffed with fresh crab meat', 1000, 1),
(1, 'ผัดขี้เมา', 'Drunken Noodles', 'Spicy stir-fried noodles with Thai basil', 500, 0),
(1, 'ผัดไทย', 'Pad Thai', 'Classic Thai stir-fried rice noodles', 400, 0),
(2, 'ผัดไทยไข่ห่อ', 'Pad Thai Wrapped in Egg', 'Signature Pad Thai encased in thin egg crepe', 150, 1),
(2, 'ผัดไทยธรรมดา', 'Regular Pad Thai', 'Classic Pad Thai without egg wrapper', 80, 0),
(2, 'ส้มกรอก', 'Fresh Orange Juice', 'Freshly squeezed Thai orange juice', 50, 1),
(3, 'ก๋วยเตี๋ยวเนื้อน้ำตก', 'Beef Noodle Soup', 'Rich broth stewed for 50 years with tender beef', 100, 1),
(4, 'คีนัวเบอร์เกอร์', 'Quinoa Burger', 'Plant-based burger with quinoa patty', 250, 1);
