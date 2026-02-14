/**
 * TasteTrace App - Main Application
 * Refactored with modular components
 */
import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Data & i18n
import { RESTAURANTS } from './data/restaurants';
import { getTranslation } from './i18n/translations';

// Hooks
import { useLocalStorage, STORAGE_KEYS, loadFromStorage, saveToStorage } from './hooks/useLocalStorage';

// Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DetailPanel from './components/layout/DetailPanel';
import { MapController, createRestaurantIcon } from './components/map/MapController';

// Feature Modals
import DishScanner from './components/features/dish/DishScanner';
import FoodieMatch from './components/features/match/FoodieMatch';
import MenuDecoder from './components/features/menu/MenuDecoder';
import RoutePlanner from './components/features/route/RoutePlanner';

// Fix Leaflet default marker icons
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function App() {
  // State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState(null);
  const [language, setLanguage] = useLocalStorage(STORAGE_KEYS.language, 'th');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Feature modals
  const [activeFeature, setActiveFeature] = useState(null);

  // User data (persisted)
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);
  const [stats, setStats] = useLocalStorage(STORAGE_KEYS.stats, { viewed: [], shared: 0 });
  const [achievements, setAchievements] = useLocalStorage(STORAGE_KEYS.achievements, []);

  // Translation helper
  const t = getTranslation(language);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    let results = RESTAURANTS;

    // Badge filter
    if (filter !== 'all') {
      if (filter === 'favorites') {
        results = results.filter(r => favorites.includes(r.id));
      } else {
        results = results.filter(r => r.badges?.includes(filter));
      }
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
  }, [filter, dietaryFilter, searchQuery, favorites]);

  // Social sharing
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

    // Check achievement
    if (newStats.shared >= 3 && !achievements.includes('sharer')) {
      setAchievements([...achievements, 'sharer']);
    }
  };

  // Toggle favorite
  const toggleFavorite = (restaurantId) => {
    const newFavorites = favorites.includes(restaurantId)
      ? favorites.filter(id => id !== restaurantId)
      : [...favorites, restaurantId];
    setFavorites(newFavorites);

    // Check achievement
    if (newFavorites.length >= 3 && !achievements.includes('foodie')) {
      setAchievements([...achievements, 'foodie']);
    }
  };

  // Track restaurant view
  useEffect(() => {
    if (selectedRestaurant && !stats.viewed.includes(selectedRestaurant.id)) {
      const newViewed = [...stats.viewed, selectedRestaurant.id];
      setStats({ ...stats, viewed: newViewed });

      // Check achievement
      if (newViewed.length >= 5 && !achievements.includes('explorer')) {
        setAchievements([...achievements, 'explorer']);
      }
    }
  }, [selectedRestaurant]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        restaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        dietaryFilter={dietaryFilter}
        onDietaryFilterChange={setDietaryFilter}
        favorites={favorites}
        achievements={achievements}
        t={t}
      >
        {/* Header inside sidebar */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          achievementsCount={achievements.length}
          t={t}
        />

        {/* Feature buttons */}
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

        {/* AI button in search */}
        <button
          onClick={() => setActiveFeature('dishScan')}
          className="absolute right-3 top-2.5 text-orange-500 hover:text-orange-600 transition-transform hover:scale-110 z-10"
          title="Dish Recognition AI"
        >
          <div className="flex items-center justify-center w-5 h-5 bg-orange-100 rounded text-[10px] font-bold">
            AI
          </div>
        </button>
      </Sidebar>

      {/* Main Content - Map */}
      <div className="flex-1 relative bg-gray-100">
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={13}
          className="absolute inset-0 z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                    🧭 {t('navigate')}
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Detail Panel */}
        <DetailPanel
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onToggleFavorite={() => toggleFavorite(selectedRestaurant?.id)}
          onShare={() => handleShare(selectedRestaurant)}
          isFavorite={favorites.includes(selectedRestaurant?.id)}
          copied={copied}
          t={t}
        />

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

      {/* Feature Modals */}
      <DishScanner
        isOpen={activeFeature === 'dishScan'}
        onClose={() => setActiveFeature(null)}
        onRestaurantSelect={setSelectedRestaurant}
        t={t}
      />

      <FoodieMatch
        isOpen={activeFeature === 'foodieMatch'}
        onClose={() => setActiveFeature(null)}
        restaurant={selectedRestaurant}
        t={t}
      />

      <MenuDecoder
        isOpen={activeFeature === 'menuDecode'}
        onClose={() => setActiveFeature(null)}
        restaurant={selectedRestaurant}
        dishes={selectedRestaurant?.dishes}
        t={t}
      />

      <RoutePlanner
        isOpen={activeFeature === 'routePlanner'}
        onClose={() => setActiveFeature(null)}
        restaurants={RESTAURANTS}
        t={t}
      />
    </div>
  );
}
