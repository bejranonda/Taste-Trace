/**
 * Cloudflare Pages Function: /api/restaurants
 * Fetches restaurants from D1 database with optional filtering
 */

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // Get query parameters
  const filter = url.searchParams.get('filter') || 'all';
  const search = url.searchParams.get('search') || '';
  const lang = url.searchParams.get('lang') || 'th';

  try {
    // If D1 database is available, use it
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
      return jsonResponse(result.results);
    }

    // Fallback to mock data if no database
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

// Mock data for development/fallback
function getMockRestaurants() {
  return [
    {
      id: 1,
      name: "ร้านเจ๊ไฝ (Jae Fai)",
      category: "Street Food",
      badges: ["michelin", "shell", "peib"],
      lat: 40,
      left: 45,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000",
      summary: "ราชินีสตรีทฟู้ดเมืองไทย โดดเด่นด้วยไข่เจียวปูระดับตำนานที่ใช้เนื้อปูก้อนโต สดใหม่ และเตาถ่านที่ควบคุมไฟได้อย่างแม่นยำ",
      pros: ["วัตถุดิบคุณภาพสูงมาก (ปูก้อน)", "รสชาติเป็นเอกลักษณ์ (กลิ่นกระทะ)", "ได้มาตรฐานสม่ำเสมอ"],
      cons: ["ราคาสูงเมื่อเทียบกับปริมาณ", "คิวรอนานมาก (2-4 ชั่วโมง)", "รับเฉพาะเงินสด"],
      credibility: 98,
      reviewTrend: [
        { year: '2021', score: 4.5 },
        { year: '2022', score: 4.7 },
        { year: '2023', score: 4.9 },
        { year: '2024', score: 4.8 }
      ],
      reviews: [
        { source: "Google Maps", score: 4.6, text: "ไข่เจียวปูคือที่สุด แต่ต้องจองล่วงหน้า", link: "#", freshness: "New" },
        { source: "Wongnai", score: 4.5, text: "อร่อยสมคำร่ำลือ แต่ราคาแรงจริง", link: "#", freshness: "Old" }
      ],
      influencers: [
        {
          platform: "Youtube",
          name: "Mark Wiens",
          title: "Eating at JAE FAI - Thai Street Food",
          thumbnail: "https://img.youtube.com/vi/aLWy1gT6Qz0/mqdefault.jpg",
          link: "https://www.youtube.com/watch?v=aLWy1gT6Qz0",
          timestamp: "5:20",
          quote: "The crab omelet is literally a pillow of crab!"
        }
      ]
    }
  ];
}
