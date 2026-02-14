/**
 * Dish Recognition API
 * POST /api/dish/analyze
 *
 * Analyzes a dish image and returns dish name, restaurant match, and recommendations
 */

// Thai dish database for matching
const DISH_DATABASE = [
  {
    name: 'Crab Omelette',
    thaiName: 'ไข่เจียวปู',
    restaurantId: 1,
    restaurantName: 'Jae Fai',
    price: 1000,
    description: 'Legendary crispy omelette stuffed with fresh crab meat',
    keywords: ['omelette', 'crab', 'egg', 'yellow', 'crispy', 'khai', 'poo', 'jeaw']
  },
  {
    name: 'Pad Thai',
    thaiName: 'ผัดไทย',
    restaurantId: 2,
    restaurantName: 'Thip Samai',
    price: 150,
    description: 'Classic Thai stir-fried rice noodles with egg and peanuts',
    keywords: ['noodles', 'pad thai', 'stir fry', 'shrimp', 'peanuts', 'bean sprouts']
  },
  {
    name: 'Drunken Noodles',
    thaiName: 'ผัดขี้เมา',
    restaurantId: 1,
    restaurantName: 'Jae Fai',
    price: 500,
    description: 'Spicy stir-fried wide noodles with Thai basil',
    keywords: ['noodles', 'basil', 'spicy', 'wide', 'drunk', 'pad ki mao', 'kee mao']
  },
  {
    name: 'Beef Noodle Soup',
    thaiName: 'ก๋วยเตี๋ยวเนื้อ',
    restaurantId: 3,
    restaurantName: 'Wattana Panich',
    price: 100,
    description: 'Rich broth stewed for 50 years with tender beef slices',
    keywords: ['noodles', 'beef', 'soup', 'broth', 'kuay tiew', 'nuea', 'stew']
  },
  {
    name: 'Quinoa Burger',
    thaiName: 'คีนัวเบอร์เกอร์',
    restaurantId: 4,
    restaurantName: 'Broccoli Revolution',
    price: 250,
    description: 'Plant-based burger with quinoa patty',
    keywords: ['burger', 'quinoa', 'vegan', 'plant', 'vegetarian']
  },
  {
    name: 'Tom Yum Goong',
    thaiName: 'ต้มยำกุ้ง',
    restaurantId: null,
    restaurantName: 'Various',
    price: 200,
    description: 'Spicy and sour shrimp soup with lemongrass',
    keywords: ['soup', 'shrimp', 'spicy', 'sour', 'lemongrass', 'tom yum', 'goong']
  },
  {
    name: 'Green Curry',
    thaiName: 'แกงเขียวหวาน',
    restaurantId: null,
    restaurantName: 'Various',
    price: 150,
    description: 'Creamy coconut curry with Thai basil and vegetables',
    keywords: ['curry', 'green', 'coconut', 'chicken', 'basil', 'kaeng', 'kiao']
  },
  {
    name: 'Mango Sticky Rice',
    thaiName: 'ข้าวเหนียวมะม่วง',
    restaurantId: null,
    restaurantName: 'Various',
    price: 100,
    description: 'Sweet coconut sticky rice with fresh mango',
    keywords: ['dessert', 'mango', 'sticky rice', 'coconut', 'sweet', 'khao', 'mamuang']
  }
];

// Keyword-based dish matching (fallback when AI unavailable)
function matchDishByKeywords(query) {
  const queryLower = query.toLowerCase();
  const matches = [];

  for (const dish of DISH_DATABASE) {
    let score = 0;
    for (const keyword of dish.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      matches.push({ ...dish, confidence: Math.min(score / dish.keywords.length, 0.9) });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// Generate AI analysis prompt
function buildAnalysisPrompt(imageDescription) {
  return `Analyze this Thai dish description and identify the dish: "${imageDescription}"

Respond in this JSON format only:
{
  "dishName": "English name",
  "thaiName": "Thai name if known",
  "category": "category (e.g., Noodles, Curry, Street Food, Dessert)",
  "mainIngredients": ["ingredient1", "ingredient2"],
  "spiciness": "mild/medium/hot/very hot",
  "confidence": 0.0-1.0
}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { image, description, text } = body;

    // Need either image data or text description
    if (!image && !description && !text) {
      return new Response(JSON.stringify({
        error: 'Please provide an image, description, or text to analyze'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let dishName = '';
    let analysisResult = null;
    let confidence = 0;

    // Try AI analysis first
    if (env.AI && (description || text)) {
      try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: `You are a Thai food expert. Identify dishes from descriptions. Respond with JSON only:
{
  "dishName": "English name",
  "thaiName": "Thai name",
  "category": "category",
  "mainIngredients": ["list"],
  "spiciness": "level",
  "confidence": 0.0-1.0
}`
            },
            {
              role: 'user',
              content: `Identify this Thai dish: "${description || text}"`
            }
          ],
          max_tokens: 200
        });

        // Parse AI response
        const jsonMatch = aiResponse.response?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
          dishName = analysisResult.dishName;
          confidence = analysisResult.confidence || 0.7;
        }
      } catch (aiError) {
        console.log('AI analysis failed:', aiError.message);
      }
    }

    // If no AI result, use keyword matching
    if (!dishName) {
      const query = description || text || '';
      const matches = matchDishByKeywords(query);

      if (matches.length > 0) {
        analysisResult = matches[0];
        dishName = matches[0].name;
        confidence = matches[0].confidence;
      }
    }

    // If still no match, return generic response
    if (!dishName) {
      return new Response(JSON.stringify({
        dishName: 'Unknown Dish',
        thaiName: 'ไม่ทราบชื่อ',
        description: 'Could not identify this dish. Please try a different image or description.',
        confidence: 0,
        similarDishes: DISH_DATABASE.slice(0, 3).map(d => ({
          name: d.name,
          thaiName: d.thaiName,
          restaurantName: d.restaurantName
        }))
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Find matching dish in database
    const dbMatch = DISH_DATABASE.find(d =>
      d.name.toLowerCase() === dishName.toLowerCase() ||
      d.thaiName === analysisResult?.thaiName
    );

    // Find similar dishes
    const similarDishes = DISH_DATABASE
      .filter(d => d.name !== dishName && d.category === (dbMatch?.category || analysisResult?.category))
      .slice(0, 3)
      .map(d => ({
        name: d.name,
        thaiName: d.thaiName,
        restaurantName: d.restaurantName,
        price: d.price
      }));

    const response = {
      dishName: dbMatch?.name || dishName,
      thaiName: dbMatch?.thaiName || analysisResult?.thaiName || '',
      category: analysisResult?.category || 'Thai Food',
      description: dbMatch?.description || analysisResult?.description || '',
      mainIngredients: analysisResult?.mainIngredients || [],
      spiciness: analysisResult?.spiciness || 'unknown',
      confidence,
      restaurant: dbMatch?.restaurantName ? {
        id: dbMatch.restaurantId,
        name: dbMatch.restaurantName,
        price: dbMatch.price
      } : null,
      similarDishes,
      analyzedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Dish analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to analyze dish',
      message: error.message
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
