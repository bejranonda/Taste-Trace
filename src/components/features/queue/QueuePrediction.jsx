/**
 * QueuePrediction Component - Live wait times and best time to visit
 */
import React, { useState, useEffect } from 'react';
import { Clock, TrendingDown, AlertCircle } from 'lucide-react';
import { Spinner, ErrorMessage } from '../../shared';
import { queueApi } from '../../../services/api';

export function QueuePrediction({ restaurant, t }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let interval;

    async function fetchPrediction() {
      try {
        const data = await queueApi.getPrediction(restaurant.id);
        if (mounted) {
          setPrediction(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          // Use fallback data from restaurant
          if (restaurant.queueData) {
            setPrediction({
              currentWait: restaurant.queueData.currentWait || 0,
              bestTime: restaurant.queueData.bestTime || 'Now',
              hourlyPrediction: restaurant.queueData.history?.map((w, i) => ({
                hour: 10 + i * 2,
                waitMinutes: w,
                crowdLevel: w < 30 ? 'low' : w < 90 ? 'medium' : 'high'
              })) || [],
              confidence: 0.7,
              dataSource: 'estimated'
            });
          } else {
            setError(err);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPrediction();

    // Auto-refresh every 5 minutes
    interval = setInterval(fetchPrediction, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [restaurant.id, restaurant.queueData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner className="text-blue-500" />
      </div>
    );
  }

  if (error && !prediction) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
        <span className="flex items-center">
          <span className="w-1 h-4 bg-blue-500 rounded-full mr-2" />
          {t ? t('Queue Prediction') : 'Queue Prediction'}
        </span>
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
          {t ? t('live') : 'Live'}
        </span>
      </h3>

      {/* Current Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">
            {t ? t('currentWait') : 'Current Wait'}
          </p>
          <p className="text-xl font-bold text-gray-900">
            {prediction?.currentWait || 0} min
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {t ? t('bestTime') : 'Best Time'}
          </p>
          <p className="text-sm font-semibold text-green-600 flex items-center justify-end gap-1">
            <TrendingDown size={14} />
            {prediction?.bestTime || 'Now'}
          </p>
        </div>
      </div>

      {/* Hourly Chart */}
      {prediction?.hourlyPrediction && prediction.hourlyPrediction.length > 0 && (
        <div className="h-16 flex items-end justify-between gap-1">
          {prediction.hourlyPrediction.map((h, i) => (
            <div
              key={i}
              className="w-full bg-blue-100 rounded-t-sm relative group cursor-pointer"
              style={{ height: `${Math.min((h.waitMinutes / 240) * 100, 100)}%` }}
            >
              <div
                className="absolute bottom-0 w-full bg-blue-500 opacity-40 hover:opacity-100 transition-opacity"
                style={{ height: '100%' }}
              />
              <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap">
                {h.hour}:00 - {h.waitMinutes}m
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Source Indicator */}
      {prediction?.dataSource === 'estimated' && (
        <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
          <AlertCircle size={10} />
          Estimated data - AI prediction unavailable
        </p>
      )}
    </div>
  );
}

export default QueuePrediction;
