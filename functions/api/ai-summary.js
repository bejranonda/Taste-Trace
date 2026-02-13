/**
 * Cloudflare Pages Function: /api/ai-summary
 * Uses Workers AI to generate restaurant summaries
 */

export async function onRequest(context) {
  const { env, request } = context;

  // Only accept POST requests
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await request.json();
    const { restaurantName, reviews, language = 'th' } = body;

    if (!restaurantName || !reviews) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    // Language-specific prompts
    const prompts = {
      th: `วิเคราะห์รีวิวร้านอาหาร "${restaurantName}" และสรุปเป็น:
1. สรุปสั้นๆ (2-3 ประโยค)
2. ข้อดี 3 ข้อ
3. ข้อเสีย 3 ข้อ

รีวิว:
${reviews}

ตอบในรูปแบบ JSON:
{"summary": "...", "pros": [...], "cons": [...]}`,
      en: `Analyze reviews for "${restaurantName}" restaurant and summarize:
1. Brief summary (2-3 sentences)
2. 3 pros
3. 3 cons

Reviews:
${reviews}

Respond in JSON format:
{"summary": "...", "pros": [...], "cons": [...]}`,
      de: `Analysiere Bewertungen für "${restaurantName}" Restaurant und fasse zusammen:
1. Kurze Zusammenfassung (2-3 Sätze)
2. 3 Vorteile
3. 3 Nachteile

Bewertungen:
${reviews}

Antworte im JSON-Format:
{"summary": "...", "pros": [...], "cons": [...]}`
    };

    // Use Workers AI if available
    if (env.AI) {
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: prompts[language] || prompts.en,
        max_tokens: 512
      });

      // Parse AI response
      let aiResult;
      try {
        // Try to extract JSON from response
        const jsonMatch = response.response?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          aiResult = {
            summary: response.response,
            pros: [],
            cons: []
          };
        }
      } catch {
        aiResult = {
          summary: response.response,
          pros: [],
          cons: []
        };
      }

      return jsonResponse(aiResult);
    }

    // Fallback if AI is not available
    return jsonResponse({
      error: 'AI service not available',
      fallback: true
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
