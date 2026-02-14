// Internationalization (i18n) translations
export const TRANSLATIONS = {
  th: {
    brandName: 'TasteTrace',
    tagline: 'ตามรอยความอร่อย',
    search: 'ค้นหาร้าน...',
    all: 'ทั้งหมด',
    michelinGuide: 'มิชลิน ไกด์',
    viewOnMap: 'ดูบนแผนที่',
    navigate: 'นำทาง',
    noRestaurants: 'ยังไม่มีข้อมูลร้านอาหาร',
    addRestaurants: 'เพิ่มร้านอาหารที่คุณชื่นชอบ',
    // Dietary
    dietary: 'อาหาร',
    vegan: 'มังสวิรัติ',
    halal: 'ฮาลาล',
    glutenFree: 'ไม่มีกลูเตน',
    // Social
    share: 'แชร์',
    copyLink: 'คัดลอกลิงก์',
    linkCopied: 'คัดลอกแล้ว!',
    // Profile
    tasteProfile: 'โปรไฟล์ความชอบ',
    favorites: 'ร้านโปรด',
    // Gamification
    achievements: 'ความสำเร็จ',
    explorer: 'นักสำรวจ',
    foodie: 'นักกิน',
    // Search
    searchPlaceholder: 'ค้นหาร้าน, หมวดหมู่...',
    noResults: 'ไม่พบร้านอาหาร',
    // Recommendations
    recommended: 'แนะนำสำหรับคุณ',
    // Queue
    currentWait: 'รอปัจจุบัน',
    bestTime: 'เวลาที่ดีที่สุด',
    live: 'สด',
    // Match
    findPartners: 'หาเพื่อนกินด้วย',
    joinGroup: 'เข้าร่วมกลุ่ม',
    // Route
    planTrip: 'วางแผนทริป',
    startTrip: 'เริ่มทริป'
  },
  en: {
    brandName: 'TasteTrace',
    tagline: 'Trace the Taste',
    search: 'Search restaurants...',
    all: 'All',
    michelinGuide: 'Michelin Guide',
    viewOnMap: 'View on Map',
    navigate: 'Navigate',
    noRestaurants: 'No restaurants yet',
    addRestaurants: 'Add your favorite restaurants',
    dietary: 'Dietary',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Gluten-Free',
    share: 'Share',
    copyLink: 'Copy Link',
    linkCopied: 'Copied!',
    tasteProfile: 'Taste Profile',
    favorites: 'Favorites',
    achievements: 'Achievements',
    explorer: 'Explorer',
    foodie: 'Foodie',
    searchPlaceholder: 'Search restaurants, categories...',
    noResults: 'No restaurants found',
    recommended: 'Recommended for you',
    currentWait: 'Current Wait',
    bestTime: 'Best Time',
    live: 'Live',
    findPartners: 'Find Partners',
    joinGroup: 'Join Group',
    planTrip: 'Plan Trip',
    startTrip: 'Start Trip'
  },
  de: {
    brandName: 'TasteTrace',
    tagline: 'Folge dem Geschmack',
    search: 'Restaurants suchen...',
    all: 'Alle',
    michelinGuide: 'Michelin Guide',
    viewOnMap: 'Auf Karte anzeigen',
    navigate: 'Navigieren',
    noRestaurants: 'Noch keine Restaurants',
    addRestaurants: 'Füge deine Lieblingsrestaurants hinzu',
    dietary: 'Ernährung',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Glutenfrei',
    share: 'Teilen',
    copyLink: 'Link kopieren',
    linkCopied: 'Kopiert!',
    tasteProfile: 'Geschmacksprofil',
    favorites: 'Favoriten',
    achievements: 'Erfolge',
    explorer: 'Entdecker',
    foodie: 'Feinschmecker',
    searchPlaceholder: 'Restaurants suchen...',
    noResults: 'Keine Restaurants gefunden',
    recommended: 'Für dich empfohlen',
    currentWait: 'Aktuelle Wartezeit',
    bestTime: 'Beste Zeit',
    live: 'Live',
    findPartners: 'Partner finden',
    joinGroup: 'Gruppe beitreten',
    planTrip: 'Tour planen',
    startTrip: 'Tour starten'
  }
};

export const getTranslation = (language) => {
  return (key) => TRANSLATIONS[language]?.[key] || key;
};

export default TRANSLATIONS;
