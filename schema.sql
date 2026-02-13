-- TasteTrace Database Schema for Cloudflare D1

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT,
  badges TEXT, -- JSON array of badges: ["michelin", "shell", "peib"]
  lat REAL,
  lng REAL,
  rating REAL,
  image TEXT,
  summary TEXT,
  summary_en TEXT,
  pros TEXT, -- JSON array
  cons TEXT, -- JSON array
  credibility INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (aggregated from multiple sources)
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'google', 'wongnai', 'pantip', etc.
  source_url TEXT,
  score REAL,
  text TEXT,
  freshness TEXT DEFAULT 'New', -- 'New', 'Medium', 'Old'
  review_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Influencer reviews table
CREATE TABLE IF NOT EXISTS influencer_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', 'instagram'
  influencer_name TEXT NOT NULL,
  video_title TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  timestamp TEXT, -- e.g., "5:20"
  quote TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Review trends table (historical scores)
CREATE TABLE IF NOT EXISTS review_trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  score REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- User preferences (for personalization)
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  language TEXT DEFAULT 'th',
  preferred_categories TEXT, -- JSON array
  preferred_badges TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search history (for analytics)
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  query TEXT,
  results_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_badges ON restaurants(badges);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_influencer_restaurant ON influencer_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_trends_restaurant ON review_trends(restaurant_id);

-- Insert sample data
INSERT INTO restaurants (name, name_en, category, badges, lat, lng, rating, image, summary, summary_en, pros, cons, credibility) VALUES
('ร้านเจ๊ไฝ', 'Jae Fai', 'Street Food', '["michelin","shell","peib"]', 13.7563, 100.5018, 4.8,
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
 'ราชินีสตรีทฟู้ดเมืองไทย โดดเด่นด้วยไข่เจียวปูระดับตำนาน',
 'Queen of Thai street food, famous for legendary crab omelet',
 '["วัตถุดิบคุณภาพสูงมาก (ปูก้อน)","รสชาติเป็นเอกลักษณ์ (กลิ่นกระทะ)","ได้มาตรฐานสม่ำเสมอ"]',
 '["ราคาสูงเมื่อเทียบกับปริมาณ","คิวรอนานมาก (2-4 ชั่วโมง)","รับเฉพาะเงินสด"]',
 98);

INSERT INTO restaurants (name, name_en, category, badges, lat, lng, rating, image, summary, summary_en, pros, cons, credibility) VALUES
('ทิพย์สมัย ผัดไทยประตูผี', 'Thip Samai Pad Thai', 'Pad Thai', '["shell"]', 13.7506, 100.4996, 4.2,
 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=1000',
 'ผัดไทยห่อไข่เจ้าดัง ต้นตำรับเส้นจันท์ใส่น้ำส้ม',
 'Famous Pad Thai with egg wrapper, original recipe with tamarind juice',
 '["เส้นเหนียวนุ่ม","กุ้งสด","บริการรวดเร็วแม้คนเยอะ"]',
 '["รสชาติออกหวานนำ","ราคาสูงกว่าร้านทั่วไป"]',
 85);

INSERT INTO restaurants (name, name_en, category, badges, lat, lng, rating, image, summary, summary_en, pros, cons, credibility) VALUES
('วัฒนาพานิช', 'Wattana Panich', 'Beef Noodle', '["shell","peib"]', 13.7392, 100.5294, 4.7,
 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1000',
 'ตำนานน้ำซุป 50 ปีที่เคี่ยวตลอดเวลา รสชาติเข้มข้นถึงใจสายเนื้อ',
 '50-year legendary stewed beef noodle soup with rich, intense flavor',
 '["เนื้อเปื่อยนุ่มมาก","น้ำซุปเข้มข้นกลมกล่อม","ปริมาณสมราคา"]',
 '["ที่จอดรถหายาก","ร้านค่อนข้างร้อน"]',
 92);
