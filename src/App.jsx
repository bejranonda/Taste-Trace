import React, { useState, useMemo, useEffect } from 'react';
import {
  Star, Navigation, Search, X, Globe, ExternalLink, MapPin,
  Share2, Heart, Award, Filter, ChefHat, Leaf, Wheat, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom restaurant marker
const createRestaurantIcon = (dietary = []) => {
  let color = '#f97316'; // orange default
  if (dietary.includes('vegan')) color = '#22c55e';
  else if (dietary.includes('halal')) color = '#3b82f6';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// --- Internationalization (i18n) ---
const TRANSLATIONS = {
  th: {
    brandName: 'TasteTrace',
    tagline: 'ตามรอยความอร่อย',
    search: 'ค้นหาร้าน...',
    all: 'ทั้งหมด',
    michelinGuide: 'มิชลิน ไกด์',
    viewOnMap: 'ดูบนแผนที่',
    navigate: 'นำทาง',
    noRestaurants: 'ยังไม่มีข้อมูลร้านอาหาร',
    addRestaurants: 'เพิ่มร้านอาหารที่คุณชื่นชอบ',
    // Dietary
    dietary: 'อาหาร',
    vegan: 'มังสวิรัติ',
    halal: 'ฮาลาล',
    glutenFree: 'ไม่มีกลูเตน',
    // Social
    share: 'แชร์',
    copyLink: 'คัดลอกลิงก์',
    linkCopied: 'คัดลอกแล้ว!',
    // Profile
    tasteProfile: 'โปรไฟล์ความชอบ',
    favorites: 'ร้านโปรด',
    // Gamification
    achievements: 'ความสำเร็จ',
    explorer: 'นักสำรวจ',
    foodie: 'นักกิน',
    // Search
    searchPlaceholder: 'ค้นหาร้าน, หมวดหมู่...',
    noResults: 'ไม่พบร้านอาหาร',
    // Recommendations
    recommended: 'แนะนำสำหรับคุณ'
  },
  en: {
    brandName: 'TasteTrace',
    tagline: 'Trace the Taste',
    search: 'Search restaurants...',
    all: 'All',
    michelinGuide: 'Michelin Guide',
    viewOnMap: 'View on Map',
    navigate: 'Navigate',
    noRestaurants: 'No restaurants yet',
    addRestaurants: 'Add your favorite restaurants',
    dietary: 'Dietary',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Gluten-Free',
    share: 'Share',
    copyLink: 'Copy Link',
    linkCopied: 'Copied!',
    tasteProfile: 'Taste Profile',
    favorites: 'Favorites',
    achievements: 'Achievements',
    explorer: 'Explorer',
    foodie: 'Foodie',
    searchPlaceholder: 'Search restaurants, categories...',
    noResults: 'No restaurants found',
    recommended: 'Recommended for you'
  },
  de: {
    brandName: 'TasteTrace',
    tagline: 'Folge dem Geschmack',
    search: 'Restaurants suchen...',
    all: 'Alle',
    michelinGuide: 'Michelin Guide',
    viewOnMap: 'Auf Karte anzeigen',
    navigate: 'Navigieren',
    noRestaurants: 'Noch keine Restaurants',
    addRestaurants: 'Füge deine Lieblingsrestaurants hinzu',
    dietary: 'Ernährung',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Glutenfrei',
    share: 'Teilen',
    copyLink: 'Link kopieren',
    linkCopied: 'Kopiert!',
    tasteProfile: 'Geschmacksprofil',
    favorites: 'Favoriten',
    achievements: 'Erfolge',
    explorer: 'Entdecker',
    foodie: 'Feinschmecker',
    searchPlaceholder: 'Restaurants suchen...',
    noResults: 'Keine Restaurants gefunden',
    recommended: 'Für dich empfohlen'
  }
};

// --- Real Restaurant Data ---
const RESTAURANTS = [
  {
    id: 1,
    name: "ร้านเจ๊ไฝ (Jae Fai)",
    category: "Street Food",
    badges: ["michelin"],
    dietary: [],
    coordinates: [13.7563, 100.5018],
    googleMapsUrl: "https://www.google.com/maps/place/Raan+Jay+Fai"
  },
  {
    id: 2,
    name: "ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)",
    category: "Pad Thai",
    badges: ["michelin"],
    dietary: [],
    coordinates: [13.7506, 100.4996],
    googleMapsUrl: "https://www.google.com/maps/place/Thip+Samai"
  },
  {
    id: 3,
    name: "วัฒนาพานิช (Wattana Panich)",
    category: "Beef Noodle",
    badges: ["michelin"],
    dietary: [],
    coordinates: [13.7392, 100.5294],
    googleMapsUrl: "https://www.google.com/maps/place/Wattana+Panich"
  },
  {
    id: 4,
    name: "Broccoli Revolution",
    category: "Vegan",
    badges: [],
    dietary: ["vegan", "glutenFree"],
    coordinates: [13.7400, 100.5400],
    googleMapsUrl: "https://www.google.com/maps/place/Broccoli+Revolution+Bangkok"
  },
  {
    id: 5,
    name: "清真黄牛肉面馆 (Halal Beef Noodle)",
    category: "Halal",
    badges: [],
    dietary: ["halal"],
    coordinates: [13.7450, 100.5150],
    googleMapsUrl: "https://www.google.com/maps/search/Halal+restaurant+Bangkok"
  }
];

// Map component
const MapController = ({ selectedRestaurant }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.coordinates) {
      map.flyTo(selectedRestaurant.coordinates, 16, { duration: 1.5 });
    }
  }, [selectedRestaurant, map]);

  return null;
};

// Badge component
const Badge = ({ type, t }) => {
  const styles = {
    michelin: { bg: "bg-orange-100", text: "text-orange-800", labelKey: "michelinGuide", icon: "⭐" },
    vegan: { bg: "bg-green-100", text: "text-green-800", labelKey: "vegan", icon: "🌱" },
    halal: { bg: "bg-blue-100", text: "text-blue-800", labelKey: "halal", icon: "🕌" },
    glutenFree: { bg: "bg-yellow-100", text: "text-yellow-800", labelKey: "glutenFree", icon: "🌾" }
  };
  const style = styles[type];
  if (!style) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      <span className="mr-1">{style.icon}</span> {t(style.labelKey)}
    </span>
  );
};

// Achievement Badge component
const AchievementBadge = ({ type, earned, t }) => {
  const achievements = {
    explorer: { icon: "🗺️", name: t('explorer'), desc: "View 5 restaurants" },
    foodie: { icon: "🍜", name: t('foodie'), desc: "Add 3 favorites" },
    vegan: { icon: "🥬", name: "Vegan Lover", desc: "Filter vegan 5 times" },
    sharer: { icon: "📱", name: "Social", desc: "Share 3 restaurants" }
  };
  const a = achievements[type];
  if (!a) return null;

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${earned ? 'bg-orange-100' : 'bg-gray-100 opacity-50'}`}>
      <span className="text-xl">{a.icon}</span>
      <div>
        <p className="text-xs font-medium">{a.name}</p>
        <p className="text-[10px] text-gray-500">{a.desc}</p>
      </div>
      {earned && <span className="ml-auto text-green-500">✓</span>}
    </div>
  );
};

// Local Storage helpers
const STORAGE_KEYS = {
  favorites: 'tastetrace_favorites',
  achievements: 'tastetrace_achievements',
  tasteProfile: 'tastetrace_profile',
  stats: 'tastetrace_stats'
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled
  }
};

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState(null);
  const [language, setLanguage] = useState('th');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Phase 3: User Taste Profile
  const [favorites, setFavorites] = useState(() => loadFromStorage(STORAGE_KEYS.favorites, []));
  const [tasteProfile, setTasteProfile] = useState(() => loadFromStorage(STORAGE_KEYS.tasteProfile, { dietary: [], categories: [] }));

  // Phase 7: Gamification
  const [stats, setStats] = useState(() => loadFromStorage(STORAGE_KEYS.stats, { viewed: [], shared: 0 }));
  const [achievements, setAchievements] = useState(() => loadFromStorage(STORAGE_KEYS.achievements, []));

  const t = (key) => TRANSLATIONS[language][key] || key;

  // Phase 6: Advanced Search + Phase 2: Dietary Filters
  const filteredRestaurants = useMemo(() => {
    let results = RESTAURANTS;

    // Badge filter
    if (filter !== "all") {
      results = results.filter(r => r.badges.includes(filter));
    }

    // Dietary filter
    if (dietaryFilter) {
      results = results.filter(r => r.dietary?.includes(dietaryFilter));
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      );
    }

    return results;
  }, [filter, dietaryFilter, searchQuery]);

  // Phase 5: Social Sharing
  const handleShare = async (restaurant) => {
    const url = `${window.location.origin}?restaurant=${restaurant.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `Check out ${restaurant.name} on TasteTrace!`,
          url: url
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    // Update stats
    const newStats = { ...stats, shared: stats.shared + 1 };
    setStats(newStats);
    saveToStorage(STORAGE_KEYS.stats, newStats);

    // Check achievement
    if (newStats.shared >= 3 && !achievements.includes('sharer')) {
      const newAchievements = [...achievements, 'sharer'];
      setAchievements(newAchievements);
      saveToStorage(STORAGE_KEYS.achievements, newAchievements);
    }
  };

  // Toggle favorite
  const toggleFavorite = (restaurantId) => {
    const newFavorites = favorites.includes(restaurantId)
      ? favorites.filter(id => id !== restaurantId)
      : [...favorites, restaurantId];
    setFavorites(newFavorites);
    saveToStorage(STORAGE_KEYS.favorites, newFavorites);

    // Check achievement
    if (newFavorites.length >= 3 && !achievements.includes('foodie')) {
      const newAchievements = [...achievements, 'foodie'];
      setAchievements(newAchievements);
      saveToStorage(STORAGE_KEYS.achievements, newAchievements);
    }
  };

  // Track restaurant view
  useEffect(() => {
    if (selectedRestaurant && !stats.viewed.includes(selectedRestaurant.id)) {
      const newViewed = [...stats.viewed, selectedRestaurant.id];
      const newStats = { ...stats, viewed: newViewed };
      setStats(newStats);
      saveToStorage(STORAGE_KEYS.stats, newStats);

      // Check achievement
      if (newViewed.length >= 5 && !achievements.includes('explorer')) {
        const newAchievements = [...achievements, 'explorer'];
        setAchievements(newAchievements);
        saveToStorage(STORAGE_KEYS.achievements, newAchievements);
      }
    }
  }, [selectedRestaurant]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">

      {/* --- Sidebar: Restaurant List --- */}
      <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-full border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 text-white p-2 rounded-lg shadow-lg">
                <Navigation size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                  {t('brandName')}
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">{t('tagline')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Achievements Button */}
              {achievements.length > 0 && (
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                  <Award size={12} className="text-yellow-600" />
                  <span className="text-xs text-yellow-700 ml-1">{achievements.length}</span>
                </div>
              )}
              {/* Language Switcher */}
              <Globe size={16} className="text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-gray-100 rounded-full px-2 py-1 border-0 focus:outline-none cursor-pointer"
              >
                <option value="th">🇹🇭</option>
                <option value="en">🇬🇧</option>
                <option value="de">🇩🇪</option>
              </select>
            </div>
          </div>

          {/* Phase 6: Advanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Phase 1: Badge Filters */}
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => { setFilter('all'); setDietaryFilter(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' && !dietaryFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => { setFilter('michelin'); setDietaryFilter(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'michelin' && !dietaryFilter ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
            >
              ⭐ Michelin
            </button>
            {/* Phase 3: Favorites Filter */}
            <button
              onClick={() => { setFilter('favorites'); setDietaryFilter(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'favorites' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
              ❤️ {favorites.length}
            </button>
          </div>

          {/* Phase 2: Dietary Filters */}
          <div className="flex space-x-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'vegan' ? null : 'vegan')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${dietaryFilter === 'vegan' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
            >
              🌱 {t('vegan')}
            </button>
            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'halal' ? null : 'halal')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${dietaryFilter === 'halal' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              🕌 {t('halal')}
            </button>
            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'glutenFree' ? null : 'glutenFree')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${dietaryFilter === 'glutenFree' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
            >
              🌾 {t('glutenFree')}
            </button>
          </div>
        </div>

        {/* Restaurant List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-orange-50 ${selectedRestaurant?.id === restaurant.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 relative">
                    <MapPin size={20} />
                    {favorites.includes(restaurant.id) && (
                      <Heart size={12} className="absolute -top-1 -right-1 text-red-500 fill-current" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{restaurant.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.badges.map(b => <Badge key={b} type={b} t={t} />)}
                      {restaurant.dietary?.map(d => <Badge key={d} type={d} t={t} />)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">{t('noResults')}</p>
              <p className="text-xs mt-2 text-gray-400">{t('addRestaurants')}</p>
            </div>
          )}
        </div>

        {/* Phase 7: Achievements Panel */}
        {achievements.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 mb-2">{t('achievements')}</p>
            <div className="grid grid-cols-2 gap-2">
              <AchievementBadge type="explorer" earned={achievements.includes('explorer')} t={t} />
              <AchievementBadge type="foodie" earned={achievements.includes('foodie')} t={t} />
            </div>
          </div>
        )}
      </div>

      {/* --- Main Content: Map & Details --- */}
      <div className="flex-1 relative bg-gray-100">

        {/* Leaflet Map */}
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={13}
          className="absolute inset-0 z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController selectedRestaurant={selectedRestaurant} />

          {filteredRestaurants.map(r => (
            <Marker
              key={r.id}
              position={r.coordinates}
              icon={createRestaurantIcon(r.dietary)}
              eventHandlers={{ click: () => setSelectedRestaurant(r) }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-bold text-sm mb-1">{r.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{r.category}</p>
                  <a
                    href={r.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600 transition"
                  >
                    <Navigation size={12} className="mr-1" /> {t('navigate')}
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Restaurant Detail Panel */}
        {selectedRestaurant && (
          <div className="absolute top-0 right-0 w-full md:w-[400px] h-full bg-white shadow-2xl overflow-y-auto animate-slideInRight border-l border-gray-200 z-30">
            <div className="p-6">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="mt-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0 relative">
                    <MapPin size={24} />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedRestaurant.id); }}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:scale-110 transition"
                    >
                      <Heart
                        size={16}
                        className={favorites.includes(selectedRestaurant.id) ? 'text-red-500 fill-current' : 'text-gray-300'}
                      />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRestaurant.name}</h2>
                    <p className="text-sm text-gray-500">{selectedRestaurant.category}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRestaurant.badges.map(b => <Badge key={b} type={b} t={t} />)}
                  {selectedRestaurant.dietary?.map(d => <Badge key={d} type={d} t={t} />)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-6">
                  <a
                    href={selectedRestaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    <Navigation size={18} className="mr-2" /> {t('navigate')}
                  </a>
                  {/* Phase 5: Social Share */}
                  <button
                    onClick={() => handleShare(selectedRestaurant)}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {copied && (
                  <p className="text-xs text-green-600 text-center -mt-4 mb-4">{t('linkCopied')}</p>
                )}

                {/* Coordinates */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                  <p className="text-sm font-mono text-gray-700">
                    {selectedRestaurant.coordinates[0].toFixed(4)}, {selectedRestaurant.coordinates[1].toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-xs font-semibold mb-2">TasteTrace</div>
          <div className="text-xs text-gray-500">
            {filteredRestaurants.length} {t('all').toLowerCase()} restaurants
          </div>
          {favorites.length > 0 && (
            <div className="text-xs text-red-500 mt-1">
              ❤️ {favorites.length} {t('favorites')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
