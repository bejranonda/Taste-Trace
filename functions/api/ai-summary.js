/**
 * Cloudflare Pages Function: /api/ai-summary
 * Uses Workers AI to generate restaurant summaries
 * Note: Requires real review data to generate accurate summaries
 */

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await request.json();
    const { restaurantName, language = 'th' } = body;

    if (!restaurantName) {
      return jsonResponse({ error: 'Restaurant name required' }, 400);
    }

    // Check if AI is available
    if (env.AI) {
      const prompts = {
        th: `ร้าน "${restaurantName}" เป็นร้านอาหารที่มีชื่อเสียงในกรุงเทพฯ โปรดให้ข้อมูลทั่วไปเกี่ยวกับร้านนี้ (2-3 ประโยค)`,
        en: `"${restaurantName}" is a famous restaurant in Bangkok. Please provide general information about this restaurant (2-3 sentences).`,
        de: `"${restaurantName}" ist ein berühmtes Restaurant in Bangkok. Bitte geben Sie allgemeine Informationen zu diesem Restaurant (2-3 Sätze).`
      };

      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: prompts[language] || prompts.en,
        max_tokens: 256
      });

      return jsonResponse({
        summary: response.response,
        generated: true
      });
    }

    // Fallback if AI is not available
    return jsonResponse({
      summary: null,
      message: 'AI service not available. Add real review data to generate summaries.',
      generated: false
    });

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
