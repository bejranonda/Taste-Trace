/**
 * Sidebar Component - Restaurant list with filters
 */
import React from 'react';
import { Search, X, MapPin, Heart } from 'lucide-react';
import { Badge } from '../shared';

export function Sidebar({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  dietaryFilter,
  onDietaryFilterChange,
  favorites,
  achievements,
  t,
  children // For feature buttons
}) {
  return (
    <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-full border-r border-gray-200">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 bg-white">
        {children}

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-100 pl-10 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Badge Filters */}
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { onFilterChange('all'); onDietaryFilterChange(null); }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'all' && !dietaryFilter
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => { onFilterChange('michelin'); onDietaryFilterChange(null); }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'michelin' && !dietaryFilter
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            ⭐ Michelin
          </button>
          <button
            onClick={() => { onFilterChange('favorites'); onDietaryFilterChange(null); }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === 'favorites'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            ❤️ {favorites.length}
          </button>
        </div>

        {/* Dietary Filters */}
        <div className="flex space-x-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => onDietaryFilterChange(dietaryFilter === 'vegan' ? null : 'vegan')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              dietaryFilter === 'vegan'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            🌱 {t('vegan')}
          </button>
          <button
            onClick={() => onDietaryFilterChange(dietaryFilter === 'halal' ? null : 'halal')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              dietaryFilter === 'halal'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🕌 {t('halal')}
          </button>
          <button
            onClick={() => onDietaryFilterChange(dietaryFilter === 'glutenFree' ? null : 'glutenFree')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              dietaryFilter === 'glutenFree'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            🌾 {t('glutenFree')}
          </button>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto">
        {restaurants.length > 0 ? (
          restaurants.map(restaurant => (
            <div
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-orange-50 ${
                selectedRestaurant?.id === restaurant.id
                  ? 'bg-orange-50 border-l-4 border-l-orange-500'
                  : ''
              }`}
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
                    {restaurant.badges?.map(b => <Badge key={b} type={b} t={t} />)}
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

      {/* Achievements Panel */}
      {achievements.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">{t('achievements')}</p>
          <div className="grid grid-cols-2 gap-2">
            {['explorer', 'foodie'].map(type => (
              <div
                key={type}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  achievements.includes(type)
                    ? 'bg-orange-100'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <span className="text-lg">
                  {type === 'explorer' ? '🗺️' : '🍜'}
                </span>
                <div>
                  <p className="text-xs font-medium">
                    {type === 'explorer' ? t('explorer') : t('foodie')}
                  </p>
                </div>
                {achievements.includes(type) && (
                  <span className="ml-auto text-green-500">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
