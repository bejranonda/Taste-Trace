/**
 * Queue Prediction API
 * GET /api/queue/:restaurantId
 *
 * Returns current wait time prediction, best time to visit, and hourly predictions
 */

// Fallback mock data when database is unavailable
function generateFallbackPrediction(restaurantId) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  // Base wait times by restaurant type (rough estimates)
  const baseWaits = {
    1: { avg: 180, variance: 60 }, // Jae Fai - very long waits
    2: { avg: 45, variance: 20 },  // Thip Samai
    3: { avg: 15, variance: 10 },  // Wattana Panich
    4: { avg: 0, variance: 5 }     // Broccoli Revolution
  };

  const base = baseWaits[restaurantId] || { avg: 30, variance: 15 };

  // Generate hourly predictions (10 AM to 10 PM)
  const hourlyPrediction = [];
  for (let h = 10; h <= 22; h++) {
    let wait = base.avg;

    // Peak hours adjustment
    if (h >= 12 && h <= 14) wait *= 1.3; // Lunch rush
    if (h >= 18 && h <= 20) wait *= 1.5; // Dinner rush

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) wait *= 1.2;

    // Add some variance
    wait += (Math.random() - 0.5) * base.variance;
    wait = Math.max(0, Math.round(wait));

    hourlyPrediction.push({
      hour: h,
      waitMinutes: wait,
      crowdLevel: wait < 15 ? 'low' : wait < 45 ? 'medium' : wait < 90 ? 'high' : 'peak'
    });
  }

  // Find best time (lowest wait)
  const bestHour = hourlyPrediction.reduce((best, curr) =>
    curr.waitMinutes < best.waitMinutes ? curr : best
  );

  // Current wait
  const currentWait = hourlyPrediction.find(h => h.hour === hour)?.waitMinutes || base.avg;

  return {
    currentWait,
    bestTime: `${bestHour.hour}:00`,
    hourlyPrediction,
    confidence: 0.65,
    dataSource: 'estimated'
  };
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const restaurantId = parseInt(params.id);

  if (!restaurantId || isNaN(restaurantId)) {
    return new Response(JSON.stringify({ error: 'Invalid restaurant ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if D1 database is available
    if (!env.DB) {
      console.log('D1 database not available, using fallback');
      return new Response(JSON.stringify(generateFallbackPrediction(restaurantId)), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();

    // Query historical queue data for this restaurant and day
    const historyResult = await env.DB.prepare(`
      SELECT hour, wait_minutes, crowd_level
      FROM queue_history
      WHERE restaurant_id = ? AND day_of_week = ?
      ORDER BY hour ASC
    `).bind(restaurantId, dayOfWeek).all();

    if (!historyResult.results || historyResult.results.length === 0) {
      // No historical data, use fallback
      return new Response(JSON.stringify(generateFallbackPrediction(restaurantId)), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Calculate predictions based on historical data
    const hourlyPrediction = historyResult.results.map(row => ({
      hour: row.hour,
      waitMinutes: row.wait_minutes,
      crowdLevel: row.crowd_level
    }));

    // Find current wait (or interpolate)
    let currentWait = 30; // default
    const currentHourData = hourlyPrediction.find(h => h.hour === currentHour);
    if (currentHourData) {
      currentWait = currentHourData.waitMinutes;
    } else if (hourlyPrediction.length > 0) {
      // Interpolate from nearest hours
      const nearest = hourlyPrediction.reduce((prev, curr) =>
        Math.abs(curr.hour - currentHour) < Math.abs(prev.hour - currentHour) ? curr : prev
      );
      currentWait = nearest.waitMinutes;
    }

    // Find best time to visit (lowest wait)
    const bestHour = hourlyPrediction.reduce((best, curr) =>
      curr.waitMinutes < best.waitMinutes ? curr : best
    );

    // Try AI enhancement if available
    let aiEnhanced = false;
    let confidence = 0.8;

    if (env.AI) {
      try {
        // Use AI to refine prediction based on patterns
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'You are a queue prediction assistant. Given historical wait time data, predict the current wait time. Respond with only a number (minutes).'
            },
            {
              role: 'user',
              content: `Restaurant ${restaurantId}, Day ${dayOfWeek}, Hour ${currentHour}. Historical waits: ${JSON.stringify(hourlyPrediction.slice(0, 5))}. What is the predicted current wait in minutes?`
            }
          ],
          max_tokens: 10
        });

        const aiWait = parseInt(aiResponse.response?.trim());
        if (!isNaN(aiWait) && aiWait >= 0 && aiWait <= 300) {
          // Blend AI prediction with historical data (weighted average)
          currentWait = Math.round((currentWait * 0.7) + (aiWait * 0.3));
          aiEnhanced = true;
          confidence = 0.9;
        }
      } catch (aiError) {
        console.log('AI enhancement failed:', aiError.message);
      }
    }

    const response = {
      currentWait,
      bestTime: `${bestHour.hour}:00`,
      hourlyPrediction,
      confidence,
      dataSource: aiEnhanced ? 'ai_enhanced' : 'historical',
      lastUpdated: now.toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Queue prediction error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch queue prediction',
      fallback: generateFallbackPrediction(restaurantId)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
