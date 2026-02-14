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
// --- Real Restaurant Data with Mocked "EatJourney" Features ---
const RESTAURANTS = [
  {
    id: 1,
    name: "ร้านเจ๊ไฝ (Jae Fai)",
    category: "Street Food",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7523, 100.5108], // Fixed coordinates for real Jae Fai
    googleMapsUrl: "https://www.google.com/maps/place/Raan+Jay+Fai",
    images: ["https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    reviews: {
      google: 4.4,
      facebook: 4.8,
      wongnai: 4.0
    },
    influencerReviews: [
      {
        id: "v1",
        platform: "youtube",
        thumbnail: "https://img.youtube.com/vi/1ZgD3j2y4y8/maxresdefault.jpg",
        url: "https://www.youtube.com/watch?v=1ZgD3j2y4y8",
        title: "Mark Wiens - Eating at Jae Fai",
        timestamp: "5m 30s"
      },
      {
        id: "v2",
        platform: "tiktok",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        url: "#",
        title: "@FoodieBKK Reviews",
        timestamp: "0:45"
      }
    ],
    aiAnalysis: {
      pros: ["Crab Omelette is legendary", "Open kitchen experience", "Michelin Star quality"],
      cons: ["Extremely long wait", "Expensive for street food", "No reservations"],
      credibilityScore: 95,
      trend: [60, 75, 85, 90, 95, 92]
    },
    queueData: {
      bestTime: "8:30 AM (Before opening)",
      currentWait: 180, // minutes
      history: [10, 30, 120, 180, 240, 150, 60] // mock hourly wait
    },
    dishes: [
      { name: "Crab Omelette", price: 1000, isSignature: true, image: "https://images.unsplash.com/photo-1599020792689-9fdeefad48cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" },
      { name: "Drunken Noodles", price: 500, isSignature: false, image: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" }
    ]
  },
  {
    id: 2,
    name: "ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)",
    category: "Pad Thai",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7528, 100.5048],
    googleMapsUrl: "https://www.google.com/maps/place/Thip+Samai",
    images: ["https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    reviews: { google: 4.2, facebook: 4.5, wongnai: 3.8 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Iconic Pad Thai", "Fast service", "Original recipe"],
      cons: ["Sweet taste profile", "Crowded with tourists", "Long queue at dinner"],
      credibilityScore: 88,
      trend: [70, 75, 80, 85, 88, 85]
    },
    queueData: { bestTime: "5:00 PM (Early dinner)", currentWait: 45, history: [0, 20, 45, 60, 90, 30] },
    dishes: [
      { name: "Superb Pad Thai", price: 120, isSignature: true, image: null },
      { name: "Orange Juice", price: 150, isSignature: true, image: null }
    ]
  },
  {
    id: 3,
    name: "วัฒนาพานิช (Wattana Panich)",
    category: "Beef Noodle",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7392, 100.5294],
    googleMapsUrl: "https://www.google.com/maps/place/Wattana+Panich",
    images: [],
    reviews: { google: 4.5, facebook: 4.7, wongnai: 4.2 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Rich broth stewed for 50 years", "Tender beef", "Authentic vibe"],
      cons: ["Small portion", "Hot environment", "Limited seating"],
      credibilityScore: 92,
      trend: [80, 82, 85, 88, 90, 92]
    },
    queueData: { bestTime: "10:00 AM", currentWait: 15, history: [10, 30, 45, 20, 10, 5] },
    dishes: [{ name: "Beef Noodle Soup", price: 100, isSignature: true, image: null }]
  },
  {
    id: 4,
    name: "Broccoli Revolution",
    category: "Vegan",
    badges: [],
    dietary: ["vegan", "glutenFree"],
    coordinates: [13.7400, 100.5400],
    googleMapsUrl: "https://www.google.com/maps/place/Broccoli+Revolution+Bangkok",
    images: [],
    reviews: { google: 4.3, facebook: 4.4, wongnai: 4.0 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Health-conscious", "Modern atmosphere", "Creative menu"],
      cons: ["Pricey", "Small portions", "Service can be slow"],
      credibilityScore: 85,
      trend: [70, 75, 78, 80, 82, 85]
    },
    queueData: { bestTime: "2:00 PM", currentWait: 0, history: [0, 10, 20, 15, 5, 0] },
    dishes: [{ name: "Quinoa Burger", price: 250, isSignature: true, image: null }]
  },
  {
    id: 5,
    name: "Raan Jay Fai (Duplicate Test)", // Removed, keeping limited set for prototype
    category: "Street Food",
    badges: [],
    dietary: ["halal"],
    coordinates: [13.7450, 100.5150], // Placeholder coords
    googleMapsUrl: "https://www.google.com/maps",
    images: [], reviews: {}, influencerReviews: [], aiAnalysis: {}, queueData: {}, dishes: []
  }
].slice(0, 4); // Keep top 4 for prototype

// Map component
const MapController = ({ selectedRestaurant }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.coordinates) {
      map.flyTo(selectedRestaurant.coordinates, 18, { duration: 1.5 }); // Zoomed in closer
    }
  }, [selectedRestaurant, map]);

  return null;
};

// Custom restaurant marker - Enhanced
const createRestaurantIcon = (restaurant) => {
  let color = '#f97316'; // orange default
  let borderColor = 'white';
  let icon = '';

  if (restaurant.dietary?.includes('vegan')) color = '#22c55e';
  else if (restaurant.dietary?.includes('halal')) color = '#3b82f6';

  // Special Award Styling
  if (restaurant.badges?.includes('michelin')) {
    borderColor = '#eab308'; // Gold border for Michelin
    icon = '⭐';
  } else if (restaurant.badges?.includes('shell_chuan_chim')) {
    borderColor = '#16a34a'; // Green border for Shell Chuan Chim
    icon = '🐚';
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid ${borderColor};
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">
      <div style="transform: rotate(45deg); line-height: 1;">${icon}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Badge component
const Badge = ({ type, t }) => {
  const styles = {
    michelin: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", labelKey: "michelinGuide", icon: "⭐" },
    shell_chuan_chim: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", labelKey: "Shell Chuan Chim", icon: "🐚" }, // New
    vegan: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", labelKey: "vegan", icon: "🌱" },
    halal: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", labelKey: "halal", icon: "🕌" },
    glutenFree: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", labelKey: "glutenFree", icon: "🌾" }
  };
  const style = styles[type] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200", labelKey: type, icon: "🏷️" };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm`}>
      <span className="mr-1.5">{style.icon}</span> {t(style.labelKey) || type}
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

const FeatureModal = ({ feature, onClose }) => {
  if (!feature) return null;

  const content = {
    dishScan: {
      title: "Dish Recognition AI",
      icon: "📸",
      body: (
        <div className="text-center">
          <div className="w-full h-48 bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1599020792689-9fdeefad48cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" className="opacity-50 absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-orange-500 rounded-lg animate-pulse"></div>
            </div>
            <p className="relative text-white font-mono text-sm bg-black/50 px-2 py-1 rounded">Scanning...</p>
          </div>
          <p className="font-bold text-lg text-gray-800">Crab Omelette (Khai Jeaw Poo)</p>
          <p className="text-sm text-gray-500 mb-4">Detected at <span className="font-semibold text-orange-600">Raan Jay Fai</span></p>
          <div className="flex gap-2 justify-center">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">View Restaurant</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      )
    },
    foodieMatch: {
      title: "Foodie Match",
      icon: "🤝",
      body: (
        <div className="text-center">
          <div className="flex justify-center -space-x-2 mb-4">
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=1" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=2" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=3" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">+5</div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Found <strong>8 people</strong> interested in <br /><strong>Jay Fai</strong> for Lunch today!</p>
          <button className="w-full py-2 bg-pink-500 text-white rounded-lg font-bold mb-2">Join Group</button>
          <button className="text-sm text-gray-400 underline" onClick={onClose}>Maybe later</button>
        </div>
      )
    },
    routePlanner: {
      title: "Food Trip Planner",
      icon: "🗺️",
      body: (
        <div className="text-left">
          <div className="relative pl-4 border-l-2 border-dashed border-gray-300 space-y-6">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-400">09:00 AM</p>
              <p className="font-bold text-sm">Jay Fai (Queue)</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-orange-500 rounded-full"></div>
              <p className="text-xs text-gray-400">11:00 AM</p>
              <p className="font-bold text-sm">Thip Samai (Lunch)</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-xs text-gray-400">01:00 PM</p>
              <p className="font-bold text-sm">Mont Nomsod (Dessert)</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Total Calories: <strong>Too many</strong></span>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs" onClick={onClose}>Start Trip</button>
          </div>
        </div>
      )
    }
  };

  const activeContent = content[feature];
  if (!activeContent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl relative animate-scaleIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
            {activeContent.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{activeContent.title}</h3>
        </div>
        {activeContent.body}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState(null);
  const [language, setLanguage] = useState('th');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState(null); // 'dishScan', 'foodieMatch', 'routePlanner'


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

          {/* --- EatJourney Prototype Features --- */}
          <div className="flex gap-2 mb-3 px-1 mt-2">
            <button
              onClick={() => setActiveFeature('foodieMatch')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 font-bold"
            >
              <span className="text-sm">🤝</span> Match
            </button>
            <button
              onClick={() => setActiveFeature('routePlanner')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 font-bold"
            >
              <span className="text-sm">🗺️</span> Plan Trip
            </button>
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
                className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => setActiveFeature('dishScan')}
              className="absolute right-3 top-2.5 text-orange-500 hover:text-orange-600 transition-transform hover:scale-110"
              title="Dish Recognition AI"
            >
              <div className="flex items-center justify-center w-5 h-5 bg-orange-100 rounded text-[10px] font-bold">AI</div>
            </button>
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
              icon={createRestaurantIcon(r)}
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
                {/* --- EatJourney New Features --- */}

                {/* 1. Influencer Hub */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                    Influencer Hub
                  </h3>
                  {selectedRestaurant.influencerReviews?.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedRestaurant.influencerReviews.map((review) => (
                        <a
                          key={review.id}
                          href={review.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-48 group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                        >
                          <img src={review.thumbnail} alt={review.title} className="w-full h-28 object-cover" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-orange-600">▶</span>
                            </div>
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-xs font-bold text-gray-900 truncate">{review.title}</p>
                            <p className="text-[10px] text-gray-500 mt-1 flex items-center">
                              <span className={`inline-block px-1 rounded text-white mr-1 ${review.platform === 'youtube' ? 'bg-red-600' : 'bg-black'}`}>
                                {review.platform === 'youtube' ? 'YT' : 'TK'}
                              </span>
                              Jump to <span className="text-orange-500 font-bold ml-1">{review.timestamp}</span>
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-400 border border-gray-100 border-dashed">
                      No influencer reviews yet. Be the first to review!
                    </div>
                  )}
                </div>

                {/* 2. AI Analysis & Smart Aggregation */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credibility Score */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-indigo-900">Credibility Score</h4>
                      <Award size={14} className="text-indigo-500" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-indigo-600">{selectedRestaurant.aiAnalysis?.credibilityScore || 80}</span>
                      <span className="text-xs text-indigo-400 mb-1">/ 100</span>
                    </div>
                    <p className="text-[10px] text-indigo-400 mt-1">Based on multi-platform sentiment</p>
                  </div>

                  {/* Aggregated Reviews */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 mb-2">Web Reviews</h4>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Google</span>
                      <span className="font-bold text-gray-900">{selectedRestaurant.reviews?.google || '-'} ⭐</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Facebook</span>
                      <span className="font-bold text-gray-900">{selectedRestaurant.reviews?.facebook || '-'} ⭐</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                    AI Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-800 mb-2 flex items-center"><span className="mr-1">👍</span> Pros</p>
                      <ul className="text-[10px] text-green-700 space-y-1 list-disc pl-3">
                        {selectedRestaurant.aiAnalysis?.pros?.map((p, i) => <li key={i}>{p}</li>) || <li>Great food</li>}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-xs font-bold text-red-800 mb-2 flex items-center"><span className="mr-1">👎</span> Cons</p>
                      <ul className="text-[10px] text-red-700 space-y-1 list-disc pl-3">
                        {selectedRestaurant.aiAnalysis?.cons?.map((p, i) => <li key={i}>{p}</li>) || <li>Long wait</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. Queue Prediction */}
                <div className="mb-6 bg-white border border-gray-100 rounded-xl shadow-sm p-4 mx-[-8px]">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center"><span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span> Queue Prediction</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">Live</span>
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Current Wait</p>
                      <p className="text-xl font-bold text-gray-900">{selectedRestaurant.queueData?.currentWait || 0} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Best Time</p>
                      <p className="text-sm font-semibold text-green-600">{selectedRestaurant.queueData?.bestTime || 'Now'}</p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="h-16 flex items-end justify-between gap-1">
                    {selectedRestaurant.queueData?.history?.map((h, i) => (
                      <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group" style={{ height: `${(h / 240) * 100}%` }}>
                        <div className="absolute bottom-0 w-full bg-blue-500 opacity-20 hover:opacity-100 transition-opacity" style={{ height: '100%' }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-[9px] px-1 py-0.5 rounded">
                          {h}m
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-2">Historic wait times by hour (10AM - 8PM)</p>
                </div>

                {/* 4. Menu & Signature Dishes */}
                {selectedRestaurant.dishes?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Signature Dishes</h3>
                    <div className="space-y-3">
                      {selectedRestaurant.dishes.map((dish, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white border border-gray-50 p-2 rounded-lg hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-gray-100 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'})` }}></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{dish.name}</p>
                            <p className="text-xs text-orange-500">{dish.price} THB</p>
                          </div>
                          {dish.isSignature && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Must Try</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy Action Buttons (Restored) */}
                <div className="flex gap-2 mb-6 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-100">
                  <a
                    href={selectedRestaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all transform active:scale-95"
                  >
                    <Navigation size={18} className="mr-2" /> {t('navigate')}
                  </a>
                  <button
                    onClick={() => handleShare(selectedRestaurant)}
                    className="flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-medium shadow-sm transition-colors"
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
      <FeatureModal feature={activeFeature} onClose={() => setActiveFeature(null)} />
    </div>
  );
}
