/**
 * DetailPanel Component - Restaurant detail slide-out
 */
import React, { useState } from 'react';
import { X, MapPin, Heart, Navigation, Share2, Award } from 'lucide-react';
import { Badge } from '../shared';
import QueuePrediction from '../features/queue/QueuePrediction';

export function DetailPanel({
  restaurant,
  onClose,
  onToggleFavorite,
  onShare,
  isFavorite,
  copied,
  t
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!restaurant) return null;

  return (
    <div className="absolute top-0 right-0 w-full md:w-[400px] h-full bg-white shadow-2xl overflow-y-auto animate-slideInRight border-l border-gray-200 z-30">
      <div className="p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mt-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0 relative">
              <MapPin size={24} />
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:scale-110 transition"
              >
                <Heart
                  size={16}
                  className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}
                />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
              <p className="text-sm text-gray-500">{restaurant.category}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.badges?.map(b => <Badge key={b} type={b} t={t} />)}
            {restaurant.dietary?.map(d => <Badge key={d} type={d} t={t} />)}
          </div>

          {/* Influencer Hub */}
          {restaurant.influencerReviews?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <span className="w-1 h-4 bg-orange-500 rounded-full mr-2" />
                Influencer Hub
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {restaurant.influencerReviews.map((review) => (
                  <a
                    key={review.id}
                    href={review.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-48 group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    <img
                      src={review.thumbnail}
                      alt={review.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-orange-600">▶</span>
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs font-bold text-gray-900 truncate">{review.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        <span className={`inline-block px-1 rounded text-white mr-1 ${
                          review.platform === 'youtube' ? 'bg-red-600' : 'bg-black'
                        }`}>
                          {review.platform === 'youtube' ? 'YT' : 'TK'}
                        </span>
                        Jump to <span className="text-orange-500 font-bold">{review.timestamp}</span>
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {restaurant.aiAnalysis && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credibility Score */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-indigo-900">Credibility Score</h4>
                  <Award size={14} className="text-indigo-500" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-indigo-600">
                    {restaurant.aiAnalysis.credibilityScore || 80}
                  </span>
                  <span className="text-xs text-indigo-400 mb-1">/ 100</span>
                </div>
              </div>

              {/* Reviews */}
              {restaurant.reviews && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 mb-2">Web Reviews</h4>
                  {restaurant.reviews.google && (
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Google</span>
                      <span className="font-bold">{restaurant.reviews.google} ⭐</span>
                    </div>
                  )}
                  {restaurant.reviews.facebook && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Facebook</span>
                      <span className="font-bold">{restaurant.reviews.facebook} ⭐</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Summary - Pros/Cons */}
          {restaurant.aiAnalysis?.pros && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <span className="w-1 h-4 bg-green-500 rounded-full mr-2" />
                AI Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <p className="text-xs font-bold text-green-800 mb-2">👍 Pros</p>
                  <ul className="text-[10px] text-green-700 space-y-1 list-disc pl-3">
                    {restaurant.aiAnalysis.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                {restaurant.aiAnalysis.cons && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <p className="text-xs font-bold text-red-800 mb-2">👎 Cons</p>
                    <ul className="text-[10px] text-red-700 space-y-1 list-disc pl-3">
                      {restaurant.aiAnalysis.cons.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Queue Prediction */}
          <div className="mb-6">
            <QueuePrediction restaurant={restaurant} t={t} />
          </div>

          {/* Signature Dishes */}
          {restaurant.dishes?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Signature Dishes</h3>
              <div className="space-y-3">
                {restaurant.dishes.map((dish, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white border border-gray-50 p-2 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 bg-gray-100 rounded-md bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'})`
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{dish.name}</p>
                      <p className="text-xs text-orange-500">{dish.price} THB</p>
                    </div>
                    {dish.isSignature && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Must Try
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-100 -mx-2">
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all transform active:scale-95"
            >
              <Navigation size={18} className="mr-2" /> {t('navigate')}
            </a>
            <button
              onClick={onShare}
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
              {restaurant.coordinates?.[0]?.toFixed(4)}, {restaurant.coordinates?.[1]?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;
