/**
 * useRestaurants Hook - Fetch and filter restaurants from API
 */
import { useState, useEffect, useMemo } from 'react';
import { restaurantApi } from '../services/api';
import { RESTAURANTS } from '../data/restaurants';

export function useRestaurants(initialFilters = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch restaurants
  useEffect(() => {
    let mounted = true;

    async function fetchRestaurants() {
      setLoading(true);
      try {
        // Try API first
        const data = await restaurantApi.getAll(filters);
        if (mounted) {
          setRestaurants(data.restaurants || data || []);
        }
      } catch (err) {
        console.log('Using fallback restaurant data');
        // Fallback to local data
        if (mounted) {
          setRestaurants(RESTAURANTS);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchRestaurants();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    let results = restaurants;

    // Badge filter
    if (filters.badge && filters.badge !== 'all') {
      results = results.filter(r => r.badges?.includes(filters.badge));
    }

    // Dietary filter
    if (filters.dietary) {
      results = results.filter(r => r.dietary?.includes(filters.dietary));
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      );
    }

    // Favorites filter
    if (filters.favorites && Array.isArray(filters.favorites)) {
      results = results.filter(r => filters.favorites.includes(r.id));
    }

    return results;
  }, [restaurants, filters]);

  return {
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    loading,
    error,
    filters,
    setFilters,
    refetch: () => setLoading(true)
  };
}

export default useRestaurants;
