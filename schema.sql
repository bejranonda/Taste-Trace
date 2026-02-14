-- TasteTrace Database Schema for Cloudflare D1
-- Only real, verifiable data

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  badges TEXT, -- JSON array of badges: ["michelin"]
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  google_maps_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences (for personalization)
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  language TEXT DEFAULT 'th',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_badges ON restaurants(badges);

-- Insert real restaurant data only
INSERT INTO restaurants (name, category, badges, lat, lng, google_maps_url) VALUES
('ร้านเจ๊ไฝ (Jae Fai)', 'Street Food', '["michelin"]', 13.7563, 100.5018, 'https://www.google.com/maps/place/Raan+Jay+Fai'),
('ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)', 'Pad Thai', '["michelin"]', 13.7506, 100.4996, 'https://www.google.com/maps/place/Thip+Samai'),
('วัฒนาพานิช (Wattana Panich)', 'Beef Noodle', '["michelin"]', 13.7392, 100.5294, 'https://www.google.com/maps/place/Wattana+Panich');
