import React, { useState, useMemo, useEffect } from 'react';
import {
  Star, Navigation, Search, X, Globe, ExternalLink, MapPin
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
const createRestaurantIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: #f97316;
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
    addRestaurants: 'เพิ่มร้านอาหารที่คุณชื่นชอบ'
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
    addRestaurants: 'Add your favorite restaurants'
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
    addRestaurants: 'Füge deine Lieblingsrestaurants hinzu'
  }
};

// --- Real Restaurant Data ---
// Only verifiable, factual information
const RESTAURANTS = [
  {
    id: 1,
    name: "ร้านเจ๊ไฝ (Jae Fai)",
    category: "Street Food",
    badges: ["michelin"],
    coordinates: [13.7563, 100.5018],
    googleMapsUrl: "https://www.google.com/maps/place/Raan+Jay+Fai"
  },
  {
    id: 2,
    name: "ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)",
    category: "Pad Thai",
    badges: ["michelin"],
    coordinates: [13.7506, 100.4996],
    googleMapsUrl: "https://www.google.com/maps/place/Thip+Samai"
  },
  {
    id: 3,
    name: "วัฒนาพานิช (Wattana Panich)",
    category: "Beef Noodle",
    badges: ["michelin"],
    coordinates: [13.7392, 100.5294],
    googleMapsUrl: "https://www.google.com/maps/place/Wattana+Panich"
  }
];

// Map component to handle fly to restaurant
const MapController = ({ selectedRestaurant }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.coordinates) {
      map.flyTo(selectedRestaurant.coordinates, 16, {
        duration: 1.5
      });
    }
  }, [selectedRestaurant, map]);

  return null;
};

// Badge component
const Badge = ({ type, t }) => {
  const styles = {
    michelin: { bg: "bg-orange-100", text: "text-orange-800", labelKey: "michelinGuide", icon: "⭐" }
  };
  const style = styles[type];
  if (!style) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      <span className="mr-1">{style.icon}</span> {t(style.labelKey)}
    </span>
  );
};

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState("all");
  const [language, setLanguage] = useState('th');

  const t = (key) => TRANSLATIONS[language][key] || key;

  const filteredRestaurants = useMemo(() => {
    if (filter === "all") return RESTAURANTS;
    return RESTAURANTS.filter(r => r.badges.includes(filter));
  }, [filter]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">

      {/* --- Sidebar: Restaurant List --- */}
      <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-full border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
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
            {/* Language Switcher */}
            <div className="flex items-center">
              <Globe size={16} className="text-gray-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-gray-100 rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
              >
                <option value="th">🇹🇭 ไทย</option>
                <option value="en">🇬🇧 EN</option>
                <option value="de">🇩🇪 DE</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilter('michelin')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'michelin' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
            >
              ⭐ Michelin
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-orange-50 ${selectedRestaurant?.id === restaurant.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{restaurant.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.badges.map(b => <Badge key={b} type={b} t={t} />)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">{t('noRestaurants')}</p>
              <p className="text-xs mt-2 text-gray-400">{t('addRestaurants')}</p>
            </div>
          )}
        </div>
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
              icon={createRestaurantIcon()}
              eventHandlers={{
                click: () => setSelectedRestaurant(r)
              }}
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

              {/* Restaurant Info */}
              <div className="mt-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRestaurant.name}</h2>
                    <p className="text-sm text-gray-500">{selectedRestaurant.category}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedRestaurant.badges.map(b => (
                    <Badge key={b} type={b} t={t} />
                  ))}
                </div>

                {/* Navigate Button */}
                <a
                  href={selectedRestaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <Navigation size={18} className="mr-2" /> {t('navigate')}
                  <ExternalLink size={14} className="ml-2" />
                </a>

                {/* Coordinates */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
        </div>
      </div>
    </div>
  );
}
