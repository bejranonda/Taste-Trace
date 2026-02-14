/**
 * Foodie Match API
 * GET /api/match - List active sessions
 * POST /api/match - Create new session
 * POST /api/match/join - Join a session
 * DELETE /api/match/:sessionId - Leave/cancel session
 */

// In-memory session cache (D1 will be primary storage)
let sessionCache = new Map();

// Generate a unique session ID
function generateSessionId() {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate user session ID from request
function getUserSessionId(request) {
  // Use CF-Ray header or generate from IP + User-Agent
  const cfRay = request.headers.get('CF-Ray');
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return cfRay ? `user_${cfRay}` : `user_${ip.replace(/\./g, '_')}`;
}

// GET - List active matching sessions
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get('restaurantId');

  try {
    let sessions = [];

    // Try to fetch from D1
    if (env.DB) {
      let query = `
        SELECT
          ms.*,
          r.name as restaurant_name,
          r.category as restaurant_category,
          COUNT(mp.id) as participant_count
        FROM matching_sessions ms
        LEFT JOIN restaurants r ON ms.restaurant_id = r.id
        LEFT JOIN matching_participants mp ON ms.id = mp.session_id
        WHERE ms.status = 'active' AND ms.expires_at > datetime('now')
      `;
      const params = [];

      if (restaurantId) {
        query += ' AND ms.restaurant_id = ?';
        params.push(restaurantId);
      }

      query += ' GROUP BY ms.id ORDER BY ms.created_at DESC LIMIT 20';

      const result = await env.DB.prepare(query).bind(...params).all();
      sessions = result.results || [];
    } else {
      // Use in-memory cache as fallback
      const now = new Date();
      sessions = Array.from(sessionCache.values())
        .filter(s => s.status === 'active' && new Date(s.expires_at) > now)
        .filter(s => !restaurantId || s.restaurant_id == restaurantId)
        .map(s => ({
          ...s,
          participant_count: s.participants?.length || 0
        }));
    }

    // Add mock participants for demo if no real data
    if (sessions.length === 0 && restaurantId) {
      // Return demo sessions for prototype
      const demoSession = {
        id: 'demo_1',
        restaurant_id: parseInt(restaurantId),
        restaurant_name: 'Jae Fai',
        scheduled_time: `${new Date().getHours() + 2}:00`,
        max_participants: 10,
        participant_count: 3,
        status: 'active',
        is_demo: true
      };
      sessions = [demoSession];
    }

    return new Response(JSON.stringify({
      sessions,
      total: sessions.length,
      dataSource: env.DB ? 'database' : 'cache'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Match list error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch sessions',
      sessions: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// POST - Create or join a session
export async function onRequestPost(context) {
  const { request, env } = context;
  const userSessionId = getUserSessionId(request);

  try {
    const body = await request.json();
    const { action, restaurantId, scheduledTime, displayName, sessionId } = body;

    // JOIN existing session
    if (action === 'join' && sessionId) {
      return await joinSession(env, sessionId, userSessionId, displayName);
    }

    // LEAVE session
    if (action === 'leave' && sessionId) {
      return await leaveSession(env, sessionId, userSessionId);
    }

    // CREATE new session
    if (!restaurantId) {
      return new Response(JSON.stringify({
        error: 'Restaurant ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Calculate expiration (4 hours from now)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // Create session in D1
    if (env.DB) {
      const result = await env.DB.prepare(`
        INSERT INTO matching_sessions (restaurant_id, scheduled_time, max_participants, expires_at)
        VALUES (?, ?, 10, ?)
        RETURNING id
      `).bind(restaurantId, scheduledTime || null, expiresAt).first();

      const newSessionId = result.id;

      // Add creator as first participant
      await env.DB.prepare(`
        INSERT INTO matching_participants (session_id, user_session_id, display_name)
        VALUES (?, ?, ?)
      `).bind(newSessionId, userSessionId, displayName || 'Foodie').run();

      return new Response(JSON.stringify({
        success: true,
        sessionId: newSessionId,
        expiresAt,
        message: 'Session created successfully'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Fallback: Create in-memory session
    const newSession = {
      id: generateSessionId(),
      restaurant_id: restaurantId,
      scheduled_time: scheduledTime,
      max_participants: 10,
      status: 'active',
      expires_at: expiresAt,
      participants: [{ userSessionId, displayName: displayName || 'Foodie' }]
    };

    sessionCache.set(newSession.id, newSession);

    return new Response(JSON.stringify({
      success: true,
      sessionId: newSession.id,
      expiresAt,
      message: 'Session created (in-memory, will not persist)'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Match create error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create session',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Join session helper
async function joinSession(env, sessionId, userSessionId, displayName) {
  if (env.DB) {
    // Check if already joined
    const existing = await env.DB.prepare(`
      SELECT id FROM matching_participants
      WHERE session_id = ? AND user_session_id = ?
    `).bind(sessionId, userSessionId).first();

    if (existing) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Already joined this session'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Check session capacity
    const session = await env.DB.prepare(`
      SELECT ms.max_participants, COUNT(mp.id) as current_count
      FROM matching_sessions ms
      LEFT JOIN matching_participants mp ON ms.id = mp.session_id
      WHERE ms.id = ? AND ms.status = 'active'
      GROUP BY ms.id
    `).bind(sessionId).first();

    if (!session) {
      return new Response(JSON.stringify({
        error: 'Session not found or inactive'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (session.current_count >= session.max_participants) {
      return new Response(JSON.stringify({
        error: 'Session is full'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Join session
    await env.DB.prepare(`
      INSERT INTO matching_participants (session_id, user_session_id, display_name)
      VALUES (?, ?, ?)
    `).bind(sessionId, userSessionId, displayName || 'Foodie').run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Joined session successfully',
      participantCount: session.current_count + 1
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // In-memory fallback
  const session = sessionCache.get(sessionId);
  if (!session) {
    return new Response(JSON.stringify({
      error: 'Session not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (!session.participants.find(p => p.userSessionId === userSessionId)) {
    session.participants.push({ userSessionId, displayName: displayName || 'Foodie' });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Joined session successfully',
    participantCount: session.participants.length
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

// Leave session helper
async function leaveSession(env, sessionId, userSessionId) {
  if (env.DB) {
    await env.DB.prepare(`
      DELETE FROM matching_participants
      WHERE session_id = ? AND user_session_id = ?
    `).bind(sessionId, userSessionId).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Left session successfully'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // In-memory fallback
  const session = sessionCache.get(sessionId);
  if (session) {
    session.participants = session.participants.filter(p => p.userSessionId !== userSessionId);
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Left session successfully'
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
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
