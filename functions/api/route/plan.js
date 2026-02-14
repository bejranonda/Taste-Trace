/**
 * Route Planner API
 * POST /api/route/plan
 *
 * Plans an optimized food trip route with timing recommendations
 */

// Haversine formula for distance calculation
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Nearest neighbor algorithm for route optimization
function optimizeRoute(restaurants) {
  if (restaurants.length <= 2) return restaurants;

  const optimized = [restaurants[0]];
  const remaining = restaurants.slice(1);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(
        current.lat, current.lng,
        remaining[i].lat, remaining[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    optimized.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  return optimized;
}

// Estimate travel time (Bangkok traffic considered)
function estimateTravelTime(distanceKm) {
  // Average speed in Bangkok: 20 km/h (heavy traffic)
  const avgSpeedKmH = 20;
  const hours = distanceKm / avgSpeedKmH;
  return Math.ceil(hours * 60); // minutes
}

// Estimate time at restaurant
function estimateDiningTime(restaurant, mealType) {
  const baseTimes = {
    breakfast: 30,
    lunch: 45,
    dinner: 60,
    snack: 20,
    dessert: 25
  };

  // Add queue time if available
  const queueTime = restaurant.average_wait || 30;
  return (baseTimes[mealType] || 45) + queueTime;
}

// Generate Google Maps URL
function generateMapsUrl(stops) {
  if (stops.length === 0) return '';

  const origin = `${stops[0].lat},${stops[0].lng}`;
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
  const waypoints = stops.slice(1, -1)
    .map(s => `${s.lat},${s.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }

  return url;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      restaurantIds,
      startTime = '09:00',
      preferences = {},
      sessionId
    } = body;

    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return new Response(JSON.stringify({
        error: 'Please provide an array of restaurant IDs'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Fetch restaurant data
    let restaurants = [];

    if (env.DB) {
      const placeholders = restaurantIds.map(() => '?').join(',');
      const result = await env.DB.prepare(`
        SELECT id, name, category, lat, lng, average_wait, opening_hours, price_range, google_maps_url
        FROM restaurants
        WHERE id IN (${placeholders})
      `).bind(...restaurantIds).all();

      restaurants = result.results || [];
    }

    // If no database data, use mock data
    if (restaurants.length === 0) {
      restaurants = restaurantIds.map((id, idx) => ({
        id,
        name: `Restaurant ${id}`,
        category: 'Thai Food',
        lat: 13.75 + (Math.random() * 0.02 - 0.01),
        lng: 100.5 + (Math.random() * 0.02 - 0.01),
        average_wait: 30,
        opening_hours: '{"open": "09:00", "close": "21:00"}',
        price_range: '$$',
        google_maps_url: '#'
      }));
    }

    // Optimize route
    const optimized = preferences.optimizeRoute !== false
      ? optimizeRoute(restaurants)
      : restaurants;

    // Calculate timing
    const [startHour, startMin] = startTime.split(':').map(Number);
    let currentTime = startHour * 60 + startMin; // minutes from midnight
    let totalDistance = 0;
    let totalCost = 0;

    const stops = optimized.map((restaurant, index) => {
      const prevRestaurant = index > 0 ? optimized[index - 1] : null;

      // Calculate distance and travel time
      let distance = 0;
      let travelTime = 0;

      if (prevRestaurant) {
        distance = haversineDistance(
          prevRestaurant.lat, prevRestaurant.lng,
          restaurant.lat, restaurant.lng
        );
        travelTime = estimateTravelTime(distance);
        totalDistance += distance;
      }

      // Update current time with travel
      currentTime += travelTime;

      // Determine meal type based on time
      const hour = Math.floor(currentTime / 60) % 24;
      let mealType = 'snack';
      if (hour >= 6 && hour < 11) mealType = 'breakfast';
      else if (hour >= 11 && hour < 14) mealType = 'lunch';
      else if (hour >= 14 && hour < 17) mealType = 'snack';
      else if (hour >= 17 && hour < 21) mealType = 'dinner';
      else mealType = 'dessert';

      // Estimate dining time
      const diningTime = estimateDiningTime(restaurant, mealType);

      // Parse opening hours
      let openingHours = { open: '09:00', close: '21:00' };
      try {
        openingHours = JSON.parse(restaurant.opening_hours || '{}');
      } catch (e) {}

      // Calculate suggested arrival time
      const suggestedTime = `${String(Math.floor(currentTime / 60) % 24).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;

      // Update time after dining
      currentTime += diningTime;

      // Estimate cost based on price range
      const priceEstimates = { '$': 100, '$$': 250, '$$$': 500, '$$$$': 1000 };
      const estimatedCost = priceEstimates[restaurant.price_range] || 200;
      totalCost += estimatedCost;

      return {
        order: index + 1,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          category: restaurant.category,
          googleMapsUrl: restaurant.google_maps_url
        },
        timing: {
          suggestedArrival: suggestedTime,
          travelTimeFromPrevious: travelTime,
          estimatedDiningTime: diningTime,
          mealType
        },
        distance: {
          fromPrevious: Math.round(distance * 10) / 10,
          unit: 'km'
        },
        openingHours,
        estimatedCost,
        coordinates: {
          lat: restaurant.lat,
          lng: restaurant.lng
        }
      };
    });

    // Calculate total time
    const endHour = Math.floor(currentTime / 60) % 24;
    const endMin = currentTime % 60;
    const totalDuration = currentTime - (startHour * 60 + startMin);

    // Generate Google Maps URL
    const mapsUrl = generateMapsUrl(optimized);

    // Save trip to database if session provided
    let tripId = null;
    if (env.DB && sessionId) {
      try {
        const tripResult = await env.DB.prepare(`
          INSERT INTO food_trips (creator_session_id, name, start_time)
          VALUES (?, ?, ?)
          RETURNING id
        `).bind(sessionId, `Food Trip ${new Date().toLocaleDateString()}`, startTime).first();

        tripId = tripResult?.id;

        // Save stops
        if (tripId) {
          for (const stop of stops) {
            await env.DB.prepare(`
              INSERT INTO trip_stops (trip_id, restaurant_id, stop_order, suggested_time)
              VALUES (?, ?, ?, ?)
            `).bind(tripId, stop.restaurant.id, stop.order, stop.timing.suggestedArrival).run();
          }
        }
      } catch (dbError) {
        console.log('Failed to save trip:', dbError.message);
      }
    }

    const response = {
      tripId,
      stops,
      summary: {
        totalStops: stops.length,
        totalDistance: Math.round(totalDistance * 10) / 10,
        distanceUnit: 'km',
        totalDuration: Math.round(totalDuration / 60 * 10) / 10,
        durationUnit: 'hours',
        estimatedTotalCost: totalCost,
        currency: 'THB',
        startTime,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
      },
      navigation: {
        googleMapsUrl: mapsUrl,
        instructions: 'Open in Google Maps for turn-by-turn navigation'
      },
      tips: [
        'Traffic in Bangkok can be unpredictable - allow extra time',
        'Some restaurants may have long queues during peak hours',
        'Consider using BTS/MRT for faster travel during rush hours',
        'Many street food vendors close early - check opening hours'
      ],
      createdAt: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Route planning error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to plan route',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// GET - Retrieve saved trip
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const tripId = url.searchParams.get('tripId');

  if (!tripId) {
    return new Response(JSON.stringify({
      error: 'Trip ID is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({
      error: 'Database not available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const trip = await env.DB.prepare(`
      SELECT * FROM food_trips WHERE id = ?
    `).bind(tripId).first();

    if (!trip) {
      return new Response(JSON.stringify({
        error: 'Trip not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const stops = await env.DB.prepare(`
      SELECT ts.*, r.name, r.category, r.lat, r.lng, r.google_maps_url
      FROM trip_stops ts
      LEFT JOIN restaurants r ON ts.restaurant_id = r.id
      WHERE ts.trip_id = ?
      ORDER BY ts.stop_order ASC
    `).bind(tripId).all();

    return new Response(JSON.stringify({
      trip: {
        id: trip.id,
        name: trip.name,
        startTime: trip.start_time,
        createdAt: trip.created_at,
        stops: stops.results || []
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Get trip error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve trip'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Handle CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
