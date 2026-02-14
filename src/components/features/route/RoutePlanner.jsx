/**
 * RoutePlanner Component - Plan food trip with optimized route
 */
import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Navigation, Car, Check } from 'lucide-react';
import { Modal, Spinner, ErrorMessage } from '../../shared';
import { routeApi } from '../../../services/api';

export function RoutePlanner({ isOpen, onClose, restaurants, t }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  // Toggle restaurant selection
  const toggleRestaurant = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedIds(restaurants.map(r => r.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Generate route
  const handleGenerate = async () => {
    if (selectedIds.length < 2) {
      setError(new Error('Please select at least 2 restaurants'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await routeApi.planTrip(selectedIds, startTime, { optimizeRoute: true });
      setRoute(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Open in Google Maps
  const openMaps = () => {
    if (route?.navigation?.googleMapsUrl) {
      window.open(route.navigation.googleMapsUrl, '_blank');
    }
  };

  // Reset
  const handleReset = () => {
    setRoute(null);
    setSelectedIds([]);
    setError(null);
  };

  // Get stop color
  const getStopColor = (index, total) => {
    if (index === 0) return 'bg-green-500';
    if (index === total - 1) return 'bg-red-500';
    return 'bg-orange-500';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t ? t('planTrip') : 'Food Trip Planner'}
      icon="🗺️"
      size="xl"
    >
      <div className="space-y-4">
        {!route ? (
          <>
            {/* Restaurant selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Select Restaurants</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-orange-500 hover:text-orange-600"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {restaurants.map(r => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(r.id)
                        ? 'bg-orange-50 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleRestaurant(r.id)}
                      className="rounded text-orange-500 focus:ring-orange-200"
                    />
                    <span className="flex-1 text-sm">{r.name}</span>
                    <span className="text-xs text-gray-400">{r.category}</span>
                  </label>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-1">
                {selectedIds.length} selected
              </p>
            </div>

            {/* Start time */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || selectedIds.length < 2}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Planning...
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Generate Route
                </>
              )}
            </button>

            {selectedIds.length < 2 && (
              <p className="text-xs text-gray-400 text-center">
                Select at least 2 restaurants to plan a route
              </p>
            )}
          </>
        ) : (
          <>
            {/* Route Results */}
            <div className="relative pl-4 border-l-2 border-dashed border-gray-300 space-y-4">
              {route.stops?.map((stop, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${getStopColor(index, route.stops.length)}`}
                  />
                  <div className="bg-gray-50 rounded-lg p-3 ml-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {stop.timing?.suggestedArrival}
                      </p>
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        {stop.timing?.mealType}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{stop.restaurant?.name}</p>
                    <p className="text-xs text-gray-500">{stop.restaurant?.category}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {stop.distance?.fromPrevious > 0 && (
                        <span className="flex items-center gap-1">
                          <Car size={10} />
                          {stop.distance.fromPrevious} km
                        </span>
                      )}
                      <span>~{stop.timing?.estimatedDiningTime} min</span>
                      <span>~฿{stop.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-xs">
              <div>
                <p className="text-gray-400">Total Distance</p>
                <p className="font-bold text-gray-900">{route.summary?.totalDistance} km</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-bold text-gray-900">{route.summary?.totalDuration} hrs</p>
              </div>
              <div>
                <p className="text-gray-400">Est. Cost</p>
                <p className="font-bold text-gray-900">฿{route.summary?.estimatedTotalCost}</p>
              </div>
              <div>
                <p className="text-gray-400">End Time</p>
                <p className="font-bold text-gray-900">{route.summary?.endTime}</p>
              </div>
            </div>

            {/* Tips */}
            <div className="text-xs text-gray-500 space-y-1">
              {route.tips?.slice(0, 2).map((tip, i) => (
                <p key={i} className="flex items-start gap-1">
                  <span className="text-orange-400">•</span>
                  {tip}
                </p>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={openMaps}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Navigation size={16} />
                {t ? t('startTrip') : 'Start Trip'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
              >
                Reset
              </button>
            </div>
          </>
        )}

        {error && <ErrorMessage error={error} onRetry={handleGenerate} />}
      </div>
    </Modal>
  );
}

export default RoutePlanner;
