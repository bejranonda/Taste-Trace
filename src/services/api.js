/**
 * API Service - Centralized fetch wrapper with error handling
 */

const API_BASE = '/api';

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Restaurant API
export const restaurantApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.badge) params.append('badge', filters.badge);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/restaurants${query}`);
  },

  async getById(id) {
    return apiFetch(`/restaurants?id=${id}`);
  }
};

// Queue Prediction API
export const queueApi = {
  async getPrediction(restaurantId) {
    return apiFetch(`/queue/${restaurantId}`);
  }
};

// Dish Recognition API
export const dishApi = {
  async analyze(data) {
    return apiFetch('/dish/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Foodie Match API
export const matchApi = {
  async getSessions(restaurantId = null) {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return apiFetch(`/match${query}`);
  },

  async createSession(data) {
    return apiFetch('/match', {
      method: 'POST',
      body: JSON.stringify({ ...data, action: 'create' })
    });
  },

  async joinSession(sessionId, displayName) {
    return apiFetch('/match', {
      method: 'POST',
      body: JSON.stringify({ action: 'join', sessionId, displayName })
    });
  },

  async leaveSession(sessionId) {
    return apiFetch('/match', {
      method: 'POST',
      body: JSON.stringify({ action: 'leave', sessionId })
    });
  }
};

// Menu Decoder API
export const menuApi = {
  async decode(items, targetLanguage = 'en', targetCurrency = 'USD', restaurantId = null) {
    return apiFetch('/menu/decode', {
      method: 'POST',
      body: JSON.stringify({ items, targetLanguage, targetCurrency, restaurantId })
    });
  }
};

// Route Planner API
export const routeApi = {
  async planTrip(restaurantIds, startTime = '09:00', preferences = {}, sessionId = null) {
    return apiFetch('/route/plan', {
      method: 'POST',
      body: JSON.stringify({ restaurantIds, startTime, preferences, sessionId })
    });
  },

  async getTrip(tripId) {
    return apiFetch(`/route/plan?tripId=${tripId}`);
  }
};

// AI Summary API
export const aiApi = {
  async getSummary(restaurantId, language = 'en') {
    return apiFetch('/ai-summary', {
      method: 'POST',
      body: JSON.stringify({ restaurantId, language })
    });
  }
};

export default {
  restaurant: restaurantApi,
  queue: queueApi,
  dish: dishApi,
  match: matchApi,
  menu: menuApi,
  route: routeApi,
  ai: aiApi
};
