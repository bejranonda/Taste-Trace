# TasteTrace

> ตามรอยความอร่อย | Trace the Taste | Folge dem Geschmack

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bejranonda/Taste-Trace)

Restaurant discovery app that helps you find great dining experiences in Thailand.

## ✨ Features

### Core Features
- 🗺️ **Interactive Map** - Real OpenStreetMap with restaurant markers (100% free, no API key)
- 🔗 **Google Maps Navigation** - Direct links to navigate to restaurants
- 🌍 **Multi-Language** - Thai 🇹🇭, English 🇬🇧, German 🇩🇪

### 🚀 EatJourney Prototype Features (New)
- 🎥 **Influencer Hub** - Integrated video reviews from YouTube & TikTok with timestamp jumps
- 🤖 **AI Analysis** - Pros/Cons summaries, Credibility Scores, and Sentiment Trend graphs
- ⏳ **Queue Prediction** - Live wait times and "Best Time to Visit" charts
- 📷 **Dish Recognition** - AI-powered dish scanning (UI Prototype)
- 🤝 **Foodie Match** - Find dining partners for specific restaurants (UI Prototype)
- 🗺️ **Food Trip Planner** - Auto-generate eating itineraries (UI Prototype)

### Map Features
- **Premium Pins** - Special icons for "Michelin" (⭐) and "Shell Chuan Chim" (🐚) awards
- Custom color-coded markers (orange/default, green/vegan, blue/halal)
- Fly-to animation when selecting restaurant
- Popup previews with quick info

### Dietary & Preferences
- 🌱 **Vegan Filter** - Find plant-based restaurants
- 🕌 **Halal Filter** - Discover halal-certified dining
- 🌾 **Gluten-Free Filter** - Gluten-sensitive options
- ❤️ **Favorites** - Save your favorite restaurants (localStorage)

### Discovery & Social
- 🔍 **Advanced Search** - Search by name or category
- 📱 **Social Sharing** - Share restaurants via Web Share API
- 🏆 **Gamification** - Earn achievements (Explorer, Foodie, Sharer)

### Data Philosophy
- **Only real, verifiable data** - No fake reviews or ratings
- **No placeholder images** - UI uses icons instead of stock photos
- **Transparent sources** - All restaurant info links to Google Maps

### Map Features
- Custom color-coded markers (orange/default, green/vegan, blue/halal)
- Fly-to animation when selecting restaurant
- Google Maps navigation integration
- Popup previews with quick info

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Leaflet + React-Leaflet | Interactive Maps |
| OpenStreetMap | Free Map Tiles |
| Lucide Icons | Icon Library |

### Backend (Cloudflare)
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Cloudflare Pages | Hosting | Unlimited |
| Pages Functions | API Endpoints | 100k req/day |
| D1 Database | SQLite Storage | 5GB, 5M reads/day |
| Workers AI | LLM Summaries | 10k req/day |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/bejranonda/Taste-Trace.git
cd Taste-Trace

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173 to view the app.

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Cloudflare deployment instructions.
See [SETUP.md](./SETUP.md) for API token configuration.

### Quick Deploy to Cloudflare Pages

1. Fork this repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Create new project → Connect GitHub
4. Configure build:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. Deploy!

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/restaurants` | GET | List restaurants with filtering |
| `/api/ai-summary` | POST | Generate AI summary (requires real data) |

## 📁 Project Structure

```
tastetrace/
├── src/
│   ├── App.jsx              # Main React component with Leaflet map
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind + Leaflet styles
├── functions/api/
│   ├── restaurants.js       # Restaurant API (D1)
│   └── ai-summary.js        # AI summary (Workers AI)
├── public/
│   └── favicon.svg          # App icon
├── schema.sql               # D1 database schema
├── wrangler.toml            # Cloudflare configuration
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── DEPLOYMENT.md            # Deployment guide
├── IMPROVEMENTS.md          # Feature roadmap
└── SETUP.md                 # Setup instructions
```

## 🗺️ Map Integration

TasteTrace uses **Leaflet + OpenStreetMap** for free, unlimited mapping:

- **No API key required**
- **No usage limits**
- **No credit card needed**

## 🗺️ Roadmap

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed feature planning.

### ✅ Completed (v1.1.0)
- [x] Leaflet Map Integration
- [x] Dietary Filters (vegan, halal, gluten-free)
- [x] User Taste Profiles (favorites)
- [x] Social Sharing (Web Share API)
- [x] Advanced Search
- [x] Gamification (achievements)

### 🔜 High Priority
- [ ] AI Recommendations (Cloudflare Workers AI)
- [ ] Add more real restaurants with verified data
- [ ] Real-time data from Google Places API
- [ ] Price tracking

### 🔮 Future
- [ ] Mobile app (React Native)
- [ ] AR menu preview
- [ ] Reservation integration
- [ ] More languages (Chinese, Japanese)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note**: Please only add real, verifiable restaurant data. No fake reviews or placeholder images.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Restaurant data from real, verifiable sources
- Maps powered by [OpenStreetMap](https://www.openstreetmap.org) & [Leaflet](https://leafletjs.com)
- Icons by [Lucide](https://lucide.dev)
- Built with [Cloudflare](https://cloudflare.com) infrastructure

---

Made with ❤️ in Thailand 🇹🇭
