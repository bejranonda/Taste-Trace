import React, { useState, useMemo } from 'react';
import {
  Map, Star, Navigation, Award, ExternalLink,
  Youtube, Play, Clock, TrendingUp, AlertCircle,
  ThumbsUp, ThumbsDown, Filter, Search, X,
  ChevronRight, ArrowUpRight, Globe
} from 'lucide-react';

// --- Internationalization (i18n) ---
const TRANSLATIONS = {
  th: {
    brandName: 'TasteTrace',
    tagline: 'ตามรอยความอร่อย',
    search: 'ค้นหาร้าน, เมนู...',
    all: 'ทั้งหมด',
    shellChuanChim: 'เชลล์ชวนชิม',
    pebPisatarn: 'เปิบพิสดาร',
    reliabilityScore: 'คะแนนความน่าเชื่อถือ',
    reliabilityDesc: 'วิเคราะห์จากความสม่ำเสมอของรีวิว',
    trendTitle: 'Trend คะแนน (2021-2024)',
    pros: 'ข้อดี',
    cons: 'ข้อเสีย',
    aiSummary: 'AI Summary Insight',
    influencerReviews: 'รีวิวจาก Influencer',
    noInfluencerReviews: 'ยังไม่มีรีวิวจาก Influencer สำหรับร้านนี้',
    reviewAggregation: 'รวมรีวิวจากหลายแหล่ง',
    recentlyReviewed: 'รีวิวล่าสุด',
    pastReview: 'รีวิวเก่า',
    readFullReview: 'อ่านรีวิวเต็ม',
    jumpTo: 'ข้ามไปที่',
    reviewBy: 'รีวิวโดย',
    michelinGuide: 'มิชลิน ไกด์'
  },
  en: {
    brandName: 'TasteTrace',
    tagline: 'Trace the Taste',
    search: 'Search restaurants, menus...',
    all: 'All',
    shellChuanChim: 'Shell Chuan Chim',
    pebPisatarn: 'Peb Pisatarn',
    reliabilityScore: 'Reliability Score',
    reliabilityDesc: 'Analyzed from review consistency',
    trendTitle: 'Score Trend (2021-2024)',
    pros: 'Pros',
    cons: 'Cons',
    aiSummary: 'AI Summary Insight',
    influencerReviews: 'Influencer Reviews',
    noInfluencerReviews: 'No influencer reviews yet for this restaurant',
    reviewAggregation: 'Review Aggregation',
    recentlyReviewed: 'Recently Reviewed',
    pastReview: 'Past Review',
    readFullReview: 'Read full review',
    jumpTo: 'Jump to',
    reviewBy: 'Review by',
    michelinGuide: 'Michelin Guide'
  },
  de: {
    brandName: 'TasteTrace',
    tagline: 'Folge dem Geschmack',
    search: 'Restaurants suchen...',
    all: 'Alle',
    shellChuanChim: 'Shell Chuan Chim',
    pebPisatarn: 'Peb Pisatarn',
    reliabilityScore: 'Glaubwürdigkeitswert',
    reliabilityDesc: 'Analysiert aus Bewertungskonsistenz',
    trendTitle: 'Bewertungstrend (2021-2024)',
    pros: 'Vorteile',
    cons: 'Nachteile',
    aiSummary: 'KI-Zusammenfassung',
    influencerReviews: 'Influencer-Bewertungen',
    noInfluencerReviews: 'Noch keine Influencer-Bewertungen für dieses Restaurant',
    reviewAggregation: 'Bewertungsübersicht',
    recentlyReviewed: 'Kürzlich bewertet',
    pastReview: 'Vergangene Bewertung',
    readFullReview: 'Vollständige Bewertung lesen',
    jumpTo: 'Springen zu',
    reviewBy: 'Bewertung von',
    michelinGuide: 'Michelin Guide'
  }
};

// --- Mock Data: ข้อมูลจำลองร้านอาหารและรีวิว ---
const RESTAURANTS = [
  {
    id: 1,
    name: "ร้านเจ๊ไฝ (Jae Fai)",
    category: "Street Food",
    badges: ["michelin", "shell", "peib"], // shell = เชลล์ชวนชิม, peib = เปิบพิสดาร
    lat: 40, left: 45, // ตำแหน่งสมมติบนแผนที่
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000",
    summary: "ราชินีสตรีทฟู้ดเมืองไทย โดดเด่นด้วยไข่เจียวปูระดับตำนานที่ใช้เนื้อปูก้อนโต สดใหม่ และเตาถ่านที่ควบคุมไฟได้อย่างแม่นยำ",
    pros: ["วัตถุดิบคุณภาพสูงมาก (ปูก้อน)", "รสชาติเป็นเอกลักษณ์ (กลิ่นกระทะ)", "ได้มาตรฐานสม่ำเสมอ"],
    cons: ["ราคาสูงเมื่อเทียบกับปริมาณ", "คิวรอนานมาก (2-4 ชั่วโมง)", "รับเฉพาะเงินสด"],
    credibility: 98, // คะแนนความน่าเชื่อถือ
    reviewTrend: [ // คะแนนย้อนหลัง (แกนเวลา)
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
      },
      { 
        platform: "Tiktok", 
        name: "FoodieBKK", 
        title: "พาไปกินเจ๊ไฝ 2024", 
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400",
        link: "#",
        timestamp: "0:45",
        quote: "ดูก้อนปูนั่นสิทุกคน!"
      }
    ]
  },
  {
    id: 2,
    name: "ทิพย์สมัย ผัดไทยประตูผี",
    category: "Pad Thai",
    badges: ["shell"],
    lat: 45, left: 55,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=1000",
    summary: "ผัดไทยห่อไข่เจ้าดัง ต้นตำรับเส้นจันท์ใส่น้ำส้ม ผู้คนต่อคิวยาวเหยียดทุกคืน",
    pros: ["เส้นเหนียวนุ่ม", "กุ้งสด", "บริการรวดเร็วแม้คนเยอะ"],
    cons: ["รสชาติออกหวานนำ", "ราคาสูงกว่าร้านทั่วไป"],
    credibility: 85,
    reviewTrend: [
      { year: '2021', score: 4.5 },
      { year: '2022', score: 4.3 },
      { year: '2023', score: 4.1 },
      { year: '2024', score: 4.2 }
    ],
    reviews: [
      { source: "Google Maps", score: 4.0, text: "หวานไปหน่อยสำหรับคนไม่ชอบหวาน", link: "#", freshness: "New" },
      { source: "Pantip", score: 4.5, text: "ชอบน้ำส้มที่นี่มาก", link: "#", freshness: "Medium" }
    ],
    influencers: [
      { 
        platform: "Youtube", 
        name: "Bearhug", 
        title: "ตะลุยประตูผี", 
        thumbnail: "https://images.unsplash.com/photo-1541533848490-bc9c30d4b398?auto=format&fit=crop&q=80&w=400",
        link: "#",
        timestamp: "8:15",
        quote: "ผัดไทยมันกุ้งคือดีงาม"
      }
    ]
  },
  {
    id: 3,
    name: "วัฒนาพานิช (เนื้อตุ๋น)",
    category: "Beef Noodle",
    badges: ["shell", "peib"],
    lat: 30, left: 60,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1000",
    summary: "ตำนานน้ำซุป 50 ปีที่เคี่ยวตลอดเวลา รสชาติเข้มข้นถึงใจสายเนื้อ",
    pros: ["เนื้อเปื่อยนุ่มมาก", "น้ำซุปเข้มข้นกลมกล่อม", "ปริมาณสมราคา"],
    cons: ["ที่จอดรถหายาก", "ร้านค่อนข้างร้อน"],
    credibility: 92,
    reviewTrend: [
      { year: '2021', score: 4.6 },
      { year: '2022', score: 4.7 },
      { year: '2023', score: 4.7 },
      { year: '2024', score: 4.7 }
    ],
    reviews: [
      { source: "Facebook", score: 4.8, text: "ที่สุดของเนื้อตุ๋นในกรุงเทพ", link: "#", freshness: "New" }
    ],
    influencers: []
  }
];

// --- Components ---

const Badge = ({ type, t }) => {
  const styles = {
    shell: { bg: "bg-green-100", text: "text-green-800", labelKey: "shellChuanChim", icon: "🥣" },
    peib: { bg: "bg-red-100", text: "text-red-800", labelKey: "pebPisatarn", icon: "😋" },
    michelin: { bg: "bg-orange-100", text: "text-orange-800", labelKey: "michelinGuide", icon: "⭐" }
  };
  const style = styles[type];
  if (!style) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text} mr-1 mb-1 border border-current opacity-90`}>
      <span className="mr-1">{style.icon}</span> {t(style.labelKey)}
    </span>
  );
};

const CredibilityGauge = ({ score, t }) => {
  let color = "text-green-500";
  if (score < 70) color = "text-yellow-500";
  if (score < 50) color = "text-red-500";

  return (
    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            className={color}
          />
        </svg>
        <span className={`absolute text-sm font-bold ${color}`}>{score}%</span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-700">{t('reliabilityScore')}</div>
        <div className="text-xs text-gray-500">{t('reliabilityDesc')}</div>
      </div>
    </div>
  );
};

const ReviewTimeline = ({ data, t }) => {
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2 flex items-center">
        <TrendingUp size={14} className="mr-1" /> {t('trendTitle')}
      </div>
      <div className="h-24 flex items-end space-x-2 border-b border-gray-200 pb-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group relative">
            <div 
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all duration-300 relative"
              style={{ height: `${(item.score / 5) * 100}%`, minHeight: '20%' }}
            >
               <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                 {item.score}/5
               </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{item.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState("all"); // all, shell, peib
  const [language, setLanguage] = useState('th');

  // Translation function
  const t = (key) => TRANSLATIONS[language][key] || key;

  const filteredRestaurants = useMemo(() => {
    if (filter === "all") return RESTAURANTS;
    return RESTAURANTS.filter(r => r.badges.includes(filter));
  }, [filter]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      
      {/* --- Sidebar: รายชื่อร้าน --- */}
      <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-full border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 text-white p-2 rounded-lg shadow-lg">
                <Navigation size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                  {t('brandName')}
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">{t('tagline')}</p>
              </div>
            </div>
            {/* Language Switcher */}
            <div className="flex items-center">
              <Globe size={16} className="text-gray-400 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-gray-100 rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
              >
                <option value="th">🇹🇭 ไทย</option>
                <option value="en">🇬🇧 EN</option>
                <option value="de">🇩🇪 DE</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>

          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilter('shell')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'shell' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
            >
              🥣 {t('shellChuanChim')}
            </button>
            <button
              onClick={() => setFilter('peib')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'peib' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
              😋 {t('pebPisatarn')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-orange-50 ${selectedRestaurant?.id === restaurant.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
            >
              <div className="flex space-x-3">
                <img src={restaurant.image} alt={restaurant.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
                    <div className="flex items-center text-xs font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">
                      <Star size={10} className="mr-1 fill-current" />
                      {restaurant.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{restaurant.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {restaurant.badges.map(b => <Badge key={b} type={b} t={t} />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Main Content: Map & Details --- */}
      <div className="flex-1 relative bg-gray-100">
        
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gray-200 overflow-hidden pattern-dots">
            {/* Grid Lines for Map Feel */}
            <div className="w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            {/* Map Markers */}
            {filteredRestaurants.map(r => (
               <button
                 key={r.id}
                 onClick={() => setSelectedRestaurant(r)}
                 className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-110 z-10`}
                 style={{ top: `${r.lat}%`, left: `${r.left}%` }}
               >
                 <div className={`relative flex flex-col items-center ${selectedRestaurant?.id === r.id ? 'scale-110' : ''}`}>
                    <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden ${selectedRestaurant?.id === r.id ? 'ring-4 ring-orange-400' : ''}`}>
                      <img src={r.image} className="w-full h-full object-cover" />
                    </div>
                    <div className={`mt-1 px-2 py-1 bg-white rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${selectedRestaurant?.id === r.id ? 'opacity-100' : ''}`}>
                      {r.name}
                    </div>
                    {/* Pin Tip */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-0.5 shadow-sm"></div>
                 </div>
               </button>
            ))}

            {/* User Location */}
            <div className="absolute bottom-10 right-10 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 text-blue-600">
                <Navigation size={24} className="fill-current" />
            </div>
        </div>

        {/* --- Restaurant Detail Panel (Overlay) --- */}
        {selectedRestaurant && (
          <div className="absolute top-0 right-0 w-full md:w-[500px] h-full bg-white shadow-2xl overflow-y-auto animate-slideInRight border-l border-gray-200 z-30">
            {/* Header Image */}
            <div className="relative h-64">
              <img src={selectedRestaurant.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <div className="flex justify-between items-end">
                  <div>
                     <h2 className="text-3xl font-bold mb-1 leading-tight">{selectedRestaurant.name}</h2>
                     <div className="flex items-center space-x-2 text-sm text-gray-200">
                       <span className="flex items-center"><Star size={14} className="fill-orange-400 text-orange-400 mr-1"/> {selectedRestaurant.rating}</span>
                       <span>•</span>
                       <span>{selectedRestaurant.category}</span>
                     </div>
                  </div>
                  <a href="#" className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg transition-transform hover:scale-105">
                    <Navigation size={20} className="text-white" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">

              {/* Badges Section */}
              <div className="flex flex-wrap gap-2">
                {selectedRestaurant.badges.map(b => (
                   <div key={b} className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                      <Award size={16} className={b === 'shell' ? 'text-green-600' : b === 'peib' ? 'text-red-600' : 'text-orange-500'} />
                      <span className="text-sm font-medium text-gray-700">
                        {b === 'shell' ? t('shellChuanChim') : b === 'peib' ? t('pebPisatarn') : t('michelinGuide')}
                      </span>
                   </div>
                ))}
              </div>

              {/* AI Summary Section */}
              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <div className="flex items-center space-x-2 mb-3">
                   <div className="p-1.5 bg-orange-500 rounded text-white"><ArrowUpRight size={16}/></div>
                   <h3 className="font-bold text-gray-900">{t('aiSummary')}</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedRestaurant.summary}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-green-700 mb-2 flex items-center uppercase tracking-wide"><ThumbsUp size={12} className="mr-1"/> {t('pros')}</div>
                    <ul className="text-xs space-y-1.5">
                      {selectedRestaurant.pros.map((p, i) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <span className="mr-2 text-green-500">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-700 mb-2 flex items-center uppercase tracking-wide"><ThumbsDown size={12} className="mr-1"/> {t('cons')}</div>
                    <ul className="text-xs space-y-1.5">
                      {selectedRestaurant.cons.map((p, i) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <span className="mr-2 text-red-500">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Credibility & Trend */}
              <div className="grid grid-cols-2 gap-4">
                 <CredibilityGauge score={selectedRestaurant.credibility} t={t} />
                 <ReviewTimeline data={selectedRestaurant.reviewTrend} t={t} />
              </div>

              {/* Influencer Hub */}
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <Youtube size={20} className="mr-2 text-red-600" />
                  {t('influencerReviews')}
                </h3>
                <div className="space-y-4">
                  {selectedRestaurant.influencers.length > 0 ? selectedRestaurant.influencers.map((inf, i) => (
                    <div key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                       <div className="flex">
                         <div className="w-32 h-24 relative flex-shrink-0">
                           <img src={inf.thumbnail} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                             <Play size={24} className="text-white fill-current opacity-90" />
                           </div>
                           <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                             {inf.platform}
                           </span>
                         </div>
                         <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-xs text-gray-500 mb-0.5">{t('reviewBy')} {inf.name}</div>
                              <div className="text-sm font-semibold leading-snug line-clamp-2">{inf.title}</div>
                            </div>
                            <a
                              href={`${inf.link}&t=${inf.timestamp.replace(':','m')}s`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="self-start mt-2 text-xs flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100 transition-colors font-medium"
                            >
                              <Clock size={12} className="mr-1" /> {t('jumpTo')} {inf.timestamp}
                            </a>
                         </div>
                       </div>
                       {inf.quote && (
                         <div className="px-3 pb-3 pt-0">
                           <p className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2 mt-1">"{inf.quote}"</p>
                         </div>
                       )}
                    </div>
                  )) : (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg text-sm border border-dashed border-gray-300">
                      {t('noInfluencerReviews')}
                    </div>
                  )}
                </div>
              </div>

              {/* Aggregated Reviews */}
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center">
                   <AlertCircle size={20} className="mr-2 text-blue-600" />
                   {t('reviewAggregation')}
                </h3>
                <div className="space-y-3">
                  {selectedRestaurant.reviews.map((rev, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${rev.source === 'Google Maps' ? 'bg-blue-500' : rev.source === 'Wongnai' ? 'bg-orange-500' : 'bg-blue-700'}`}>
                            {rev.source}
                          </span>
                          <span className="flex items-center text-xs font-bold text-gray-700">
                             <Star size={10} className="fill-orange-400 text-orange-400 mr-1"/> {rev.score}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rev.freshness === 'New' ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-500'}`}>
                          {rev.freshness === 'New' ? t('recentlyReviewed') : t('pastReview')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">"{rev.text}"</p>
                      <a href={rev.link} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center">
                        {t('readFullReview')} <ExternalLink size={10} className="ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-10"></div> {/* Bottom Spacing */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}