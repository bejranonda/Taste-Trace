/**
 * Header Component - Brand, language switcher, achievements
 */
import React from 'react';
import { Navigation, Globe, Award } from 'lucide-react';

export function Header({
  language,
  onLanguageChange,
  achievementsCount,
  t
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Brand */}
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

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Achievements */}
        {achievementsCount > 0 && (
          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
            <Award size={12} className="text-yellow-600" />
            <span className="text-xs text-yellow-700 ml-1">{achievementsCount}</span>
          </div>
        )}

        {/* Language Switcher */}
        <Globe size={16} className="text-gray-400" />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs bg-gray-100 rounded-full px-2 py-1 border-0 focus:outline-none cursor-pointer"
        >
          <option value="th">🇹🇭</option>
          <option value="en">🇬🇧</option>
          <option value="de">🇩🇪</option>
        </select>
      </div>
    </div>
  );
}

export default Header;
