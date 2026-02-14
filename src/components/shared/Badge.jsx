/**
 * Badge Component - Restaurant badges and dietary tags
 */
import React from 'react';

export function Badge({ type, t, onClick }) {
  const styles = {
    michelin: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      labelKey: "michelinGuide",
      icon: "⭐"
    },
    shell_chuan_chim: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      labelKey: "Shell Chuan Chim",
      icon: "🐚"
    },
    vegan: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      labelKey: "vegan",
      icon: "🌱"
    },
    halal: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      labelKey: "halal",
      icon: "🕌"
    },
    glutenFree: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      labelKey: "glutenFree",
      icon: "🌾"
    }
  };

  const style = styles[type] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    labelKey: type,
    icon: "🏷️"
  };

  const label = t ? t(style.labelKey) : style.labelKey;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <span className="mr-1.5">{style.icon}</span> {label}
    </span>
  );
}

/**
 * Achievement Badge Component - Gamification badges
 */
export function AchievementBadge({ type, earned, t }) {
  const achievements = {
    explorer: { icon: "🗺️", name: t ? t('explorer') : 'Explorer', desc: "View 5 restaurants" },
    foodie: { icon: "🍜", name: t ? t('foodie') : 'Foodie', desc: "Add 3 favorites" },
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
}

export default Badge;
