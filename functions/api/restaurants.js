/**
 * Cloudflare Pages Function: /api/restaurants
 * Fetches restaurants from D1 database
 */

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const filter = url.searchParams.get('filter') || 'all';
  const search = url.searchParams.get('search') || '';

  try {
    if (env.DB) {
      let query = 'SELECT * FROM restaurants WHERE 1=1';
      const params = [];

      if (filter !== 'all') {
        query += ' AND badges LIKE ?';
        params.push(`%"${filter}"%`);
      }

      if (search) {
        query += ' AND (name LIKE ? OR category LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const result = await env.DB.prepare(query).bind(...params).all();

      // Transform to frontend format
      const restaurants = result.results.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        badges: JSON.parse(r.badges || '[]'),
        coordinates: [r.lat, r.lng],
        googleMapsUrl: r.google_maps_url
      }));

      return jsonResponse(restaurants);
    }

    // Fallback mock data
    return jsonResponse(getMockRestaurants());
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function getMockRestaurants() {
  return [
    {
      id: 1,
      name: "ร้านเจ๊ไฝ (Jae Fai)",
      category: "Street Food",
      badges: ["michelin"],
      coordinates: [13.7563, 100.5018],
      googleMapsUrl: "https://www.google.com/maps/place/Raan+Jay+Fai"
    },
    {
      id: 2,
      name: "ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)",
      category: "Pad Thai",
      badges: ["michelin"],
      coordinates: [13.7506, 100.4996],
      googleMapsUrl: "https://www.google.com/maps/place/Thip+Samai"
    },
    {
      id: 3,
      name: "วัฒนาพานิช (Wattana Panich)",
      category: "Beef Noodle",
      badges: ["michelin"],
      coordinates: [13.7392, 100.5294],
      googleMapsUrl: "https://www.google.com/maps/place/Wattana+Panich"
    }
  ];
}
