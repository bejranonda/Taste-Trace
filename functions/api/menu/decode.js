/**
 * Menu Decoder API
 * POST /api/menu/decode
 *
 * Translates menu items and converts prices to target currency
 */

// Static currency rates (fallback when API unavailable)
const CURRENCY_RATES = {
  THB: 1,
  USD: 0.028,
  EUR: 0.026,
  GBP: 0.022,
  JPY: 4.2,
  CNY: 0.20,
  KRW: 38,
  SGD: 0.038,
  MYR: 0.13,
  AUD: 0.043,
  INR: 2.3
};

// Currency symbols
const CURRENCY_SYMBOLS = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  SGD: 'S$',
  MYR: 'RM',
  AUD: 'A$',
  INR: '₹'
};

// Language translations for common Thai food terms
const THAI_FOOD_TERMS = {
  // Proteins
  'ไก่': 'chicken',
  'หมู': 'pork',
  'เนื้อ': 'beef',
  'ปลา': 'fish',
  'กุ้ง': 'shrimp',
  'ปู': 'crab',
  'หมึก': 'squid',
  'เป็ด': 'duck',
  'ไข่': 'egg',

  // Cooking methods
  'ผัด': 'stir-fried',
  'ทอด': 'fried',
  'ต้ม': 'boiled',
  'ย่าง': 'grilled',
  'นึ่ง': 'steamed',
  'แกง': 'curry',

  // Noodles & Rice
  'ก๋วยเตี๋ยว': 'noodles',
  'ข้าว': 'rice',
  'เส้น': 'noodle (type)',
  'หมี่': 'noodle',

  // Vegetables & Herbs
  'ผัก': 'vegetable',
  'โหระพา': 'basil',
  'ถั่ว': 'beans',
  'มะเขือ': 'eggplant',

  // Flavors
  'หวาน': 'sweet',
  'เผ็ด': 'spicy',
  'เปรี้ยว': 'sour',
  'เค็ม': 'salty',

  // Common dishes
  'ผัดไทย': 'Pad Thai',
  'ต้มยำ': 'Tom Yum',
  'ส้มตำ': 'Som Tum (papaya salad)',
  'ข้าวผัด': 'fried rice',
  'แกงเขียวหวาน': 'Green Curry',
  'แกงแดง': 'Red Curry',
  'มัสมั่น': 'Massaman Curry',
  'ผัดขี้เมา': 'Drunken Noodles',
  'ราดหน้า': 'Rat Na (noodles with gravy)',
  'ไข่เจียว': 'omelette'
};

// Known dishes database
const KNOWN_DISHES = {
  'ผัดไทย': { en: 'Pad Thai', desc: 'Stir-fried rice noodles with egg, tofu, and peanuts' },
  'ผัดไทยไข่ห่อ': { en: 'Pad Thai Wrapped in Egg', desc: 'Pad Thai encased in a thin egg crepe' },
  'ต้มยำกุ้ง': { en: 'Tom Yum Goong', desc: 'Spicy and sour shrimp soup with lemongrass' },
  'ต้มยำไก่': { en: 'Tom Yum Kai', desc: 'Spicy and sour chicken soup' },
  'ส้มตำไทย': { en: 'Som Tum Thai', desc: 'Green papaya salad with peanuts' },
  'ส้มตำปู': { en: 'Som Tum Pu', desc: 'Papaya salad with salted crab' },
  'ข้าวผัดกุ้ง': { en: 'Shrimp Fried Rice', desc: 'Fried rice with shrimp' },
  'แกงเขียวหวานไก่': { en: 'Green Curry Chicken', desc: 'Creamy coconut curry with Thai basil' },
  'ผัดขี้เมา': { en: 'Drunken Noodles (Pad Kee Mao)', desc: 'Spicy stir-fried wide noodles with basil' },
  'ก๋วยเตี๋ยวเนื้อ': { en: 'Beef Noodle Soup', desc: 'Rice noodles in beef broth' },
  'ไข่เจียวปู': { en: 'Crab Omelette', desc: 'Crispy omelette with fresh crab meat' },
  'บะหมี่หมูแดง': { en: 'BBQ Pork Noodles', desc: 'Egg noodles with Chinese BBQ pork' },
  'ข้าวมันไก่': { en: 'Chicken Rice (Khao Man Kai)', desc: 'Poached chicken with seasoned rice' },
  'ผัดซีอิ้ว': { en: 'Pad See Ew', desc: 'Stir-fried wide noodles with soy sauce' },
  'มัสมั่นไก่': { en: 'Massaman Chicken', desc: 'Rich, mildly spicy curry with peanuts' }
};

// Convert price
function convertPrice(priceTHB, targetCurrency) {
  const rate = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
  const converted = priceTHB * rate;

  // Round appropriately based on currency
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

// Translate Thai dish name
function translateDish(thaiName) {
  // Check known dishes first
  if (KNOWN_DISHES[thaiName]) {
    return KNOWN_DISHES[thaiName];
  }

  // Try word-by-word translation
  let translated = thaiName;
  let description = [];

  for (const [thai, english] of Object.entries(THAI_FOOD_TERMS)) {
    if (thaiName.includes(thai)) {
      translated = translated.replace(thai, english);
      description.push(english);
    }
  }

  // If no translation found, return original
  if (translated === thaiName) {
    return {
      en: thaiName,
      desc: 'Thai dish'
    };
  }

  return {
    en: translated.charAt(0).toUpperCase() + translated.slice(1),
    desc: description.join(', ') || 'Thai dish'
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      items,
      targetLanguage = 'en',
      targetCurrency = 'USD',
      restaurantId
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({
        error: 'Please provide an array of menu items'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const decodedItems = [];

    for (const item of items) {
      const originalName = item.name || item;
      const priceTHB = parseInt(item.price) || 0;

      // Check cache first
      let cachedTranslation = null;
      if (env.DB && restaurantId) {
        const cached = await env.DB.prepare(`
          SELECT dish_name_en, description_en FROM menu_translations
          WHERE restaurant_id = ? AND dish_name_original = ?
        `).bind(restaurantId, originalName).first();

        if (cached) {
          cachedTranslation = {
            en: cached.dish_name_en,
            desc: cached.description_en
          };
        }
      }

      // Translate
      let translation;
      if (cachedTranslation) {
        translation = cachedTranslation;
      } else {
        // Try AI translation if available
        if (env.AI && !cachedTranslation) {
          try {
            const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: [
                {
                  role: 'system',
                  content: 'Translate this Thai dish name to English. Reply with: English Name | Brief Description'
                },
                {
                  role: 'user',
                  content: originalName
                }
              ],
              max_tokens: 100
            });

            const [enName, desc] = aiResponse.response?.split('|').map(s => s.trim()) || [];
            if (enName) {
              translation = { en: enName, desc: desc || '' };
            }
          } catch (aiError) {
            console.log('AI translation failed:', aiError.message);
          }
        }

        // Fallback to dictionary translation
        if (!translation) {
          translation = translateDish(originalName);
        }
      }

      // Convert price
      const convertedPrice = convertPrice(priceTHB, targetCurrency);
      const currencySymbol = CURRENCY_SYMBOLS[targetCurrency] || '$';

      decodedItems.push({
        original: originalName,
        translated: translation.en,
        description: translation.desc,
        price: {
          original: priceTHB,
          originalCurrency: 'THB',
          originalSymbol: '฿',
          converted: convertedPrice,
          convertedCurrency: targetCurrency,
          convertedSymbol: currencySymbol
        },
        isSignature: item.isSignature || false
      });
    }

    // AI enhancement: Identify must-try items
    let mustTryItems = [];
    if (env.AI && decodedItems.length > 0) {
      try {
        const itemNames = decodedItems.map(i => i.translated).join(', ');
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'From this list of Thai dishes, identify which 1-2 are most famous or must-try. Reply with just the dish names separated by commas.'
            },
            {
              role: 'user',
              content: itemNames
            }
          ],
          max_tokens: 50
        });

        mustTryItems = aiResponse.response?.split(',').map(s => s.trim().toLowerCase()) || [];
      } catch (aiError) {
        console.log('Must-try identification failed:', aiError.message);
      }
    }

    // Mark must-try items
    decodedItems.forEach(item => {
      if (mustTryItems.some(m => item.translated.toLowerCase().includes(m))) {
        item.isMustTry = true;
      }
    });

    return new Response(JSON.stringify({
      items: decodedItems,
      targetLanguage,
      targetCurrency,
      exchangeRate: CURRENCY_RATES[targetCurrency],
      dataSource: env.DB ? 'database' : 'dictionary',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Menu decode error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to decode menu',
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
