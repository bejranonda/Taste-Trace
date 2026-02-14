/**
 * MapController Component - Handles map interactions
 */
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapController({ selectedRestaurant }) {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.coordinates) {
      map.flyTo(selectedRestaurant.coordinates, 18, { duration: 1.5 });
    }
  }, [selectedRestaurant, map]);

  return null;
}

/**
 * Create custom restaurant marker icon
 */
export function createRestaurantIcon(restaurant) {
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

  // Use inline SVG for better quality
  const svgIcon = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.059 0 0 8.059 0 18c0 10.5 18 26 18 26s18-15.5 18-26c0-9.941-8.059-18-18-18z" fill="${color}" stroke="${borderColor}" stroke-width="3"/>
      <text x="18" y="22" text-anchor="middle" font-size="14">${icon}</text>
    </svg>
  `;

  // Fallback to div icon for simplicity
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
}

export default MapController;
