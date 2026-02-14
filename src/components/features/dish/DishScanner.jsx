/**
 * DishScanner Component - Camera capture and AI dish recognition
 */
import React, { useState, useCallback } from 'react';
import { Camera, X, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, Spinner, ErrorMessage } from '../../shared';
import { useCamera } from '../../../hooks/useCamera';
import { dishApi } from '../../../services/api';

export function DishScanner({ isOpen, onClose, onRestaurantSelect, t }) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, capturePhoto } = useCamera();
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Start camera when modal opens
  const handleOpen = useCallback(async () => {
    setResult(null);
    setDescription('');
    setError(null);
  }, []);

  // Analyze dish
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      let imageData = null;

      // Capture from camera if active
      if (isActive) {
        imageData = capturePhoto();
      }

      // Call API
      const response = await dishApi.analyze({
        image: imageData,
        description: description || undefined
      });

      setResult(response);
    } catch (err) {
      setError(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle restaurant selection
  const handleViewRestaurant = () => {
    if (result?.restaurant && onRestaurantSelect) {
      onRestaurantSelect(result.restaurant);
      onClose();
    }
  };

  // Reset and close
  const handleClose = () => {
    stopCamera();
    setResult(null);
    setDescription('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="space-y-4">
        {/* Camera View */}
        {!result && (
          <>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {isActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-2 text-white hover:text-orange-400 transition-colors"
                  >
                    <Camera size={48} />
                    <span className="text-sm">Tap to start camera</span>
                  </button>
                </div>
              )}

              {/* Scanning overlay */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-orange-500 rounded-lg animate-pulse" />
                </div>
              )}

              {/* Camera error */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <div className="text-center text-white p-4">
                    <AlertCircle className="mx-auto mb-2 text-red-400" size={32} />
                    <p className="text-sm">{cameraError}</p>
                    <p className="text-xs text-gray-400 mt-1">Try describing the dish instead</p>
                  </div>
                </div>
              )}
            </div>

            {/* Text input fallback */}
            <div className="relative">
              <input
                type="text"
                placeholder="Or describe the dish (e.g., 'spicy noodle soup with shrimp')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!isActive && !description)}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera size={18} />
                  Analyze Dish
                </>
              )}
            </button>
          </>
        )}

        {/* Result */}
        {result && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-500" size={32} />
            </div>

            <p className="font-bold text-lg text-gray-800">{result.dishName}</p>
            {result.thaiName && (
              <p className="text-sm text-gray-500">{result.thaiName}</p>
            )}

            {result.description && (
              <p className="text-sm text-gray-600 mt-2">{result.description}</p>
            )}

            {result.restaurant && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Found at <span className="font-semibold text-orange-600">{result.restaurant.name}</span>
                </p>
                <button
                  onClick={handleViewRestaurant}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  View Restaurant
                </button>
              </div>
            )}

            {/* Confidence indicator */}
            {result.confidence && (
              <p className="text-xs text-gray-400 mt-3">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            )}

            {/* Similar dishes */}
            {result.similarDishes?.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-xs font-semibold text-gray-500 mb-2">Similar dishes:</p>
                <div className="space-y-1">
                  {result.similarDishes.map((dish, i) => (
                    <p key={i} className="text-xs text-gray-600">
                      • {dish.name} {dish.restaurantName && `@ ${dish.restaurantName}`}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); stopCamera(); }}
              className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
            >
              Scan another dish
            </button>
          </div>
        )}

        {/* Error */}
        {error && <ErrorMessage error={error} onRetry={handleAnalyze} />}
      </div>
    </Modal>
  );
}

export default DishScanner;
