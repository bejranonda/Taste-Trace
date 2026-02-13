# TasteTrace

> ตามรอยความอร่อย | Trace the Taste | Folge dem Geschmack

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bejranonda/Taste-Trace)

AI-powered restaurant review aggregator that helps you discover the best dining experiences in Thailand.

![TasteTrace Screenshot](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

### Core Features
- 🗺️ **Interactive Map** - Real OpenStreetMap with restaurant markers (100% free, no API key)
- 🤖 **AI Summary Insights** - Consolidated pros/cons analysis using Workers AI
- 🎬 **Influencer Reviews** - Video reviews from YouTube/TikTok food creators
- 📊 **Credibility Scoring** - Trust scores based on review consistency
- 📈 **Review Trends** - Track restaurant quality over time (2021-2024)
- 🌍 **Multi-Language** - Thai 🇹🇭, English 🇬🇧, German 🇩🇪

### Map Features
- Custom rating-based markers (🟠 4.5+, 🟢 4.0-4.4, ⚪ <4.0)
- Fly-to animation when selecting restaurants
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
| `/api/ai-summary` | POST | Generate AI summary from reviews |

### Example Requests

```bash
# Get restaurants
curl "https://tastetrace.pages.dev/api/restaurants?filter=shell&lang=th"

# Generate AI summary
curl -X POST "https://tastetrace.pages.dev/api/ai-summary" \
  -H "Content-Type: application/json" \
  -d '{"restaurantName":"Jae Fai","reviews":"Great crab omelet...","language":"th"}'
```

## 🏷️ Supported Review Sources

| Source | Badge | Description |
|--------|-------|-------------|
| Michelin Guide | ⭐ | Michelin-starred restaurants |
| เชลล์ชวนชิม | 🥣 | Shell Chuan Chim (Thai food guide) |
| เปิบพิสดาร | 😋 | Peb Pisatarn (Thai food show) |
| Google Maps | - | User reviews |
| Wongnai | - | Thai local reviews |

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
└── IMPROVEMENTS.md          # Feature roadmap
```

## 🗺️ Map Integration

TasteTrace uses **Leaflet + OpenStreetMap** for free, unlimited mapping:

- **No API key required**
- **No usage limits**
- **No credit card needed**

```jsx
// Example: Adding a restaurant marker
<Marker
  position={[13.7563, 100.5018]}
  icon={createRestaurantIcon(4.8)}
>
  <Popup>Restaurant info...</Popup>
</Marker>
```

## 🗺️ Roadmap

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed feature planning.

### High Priority
- [ ] Dietary filters (vegan, halal, gluten-free)
- [ ] AI-powered recommendations
- [ ] Real-time wait times
- [ ] Price tracking

### Medium Priority
- [ ] Social features (share lists, follow friends)
- [ ] Food journey tracking
- [ ] Advanced natural language search

### Future
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

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Restaurant data inspired by Thai street food culture
- Maps powered by [OpenStreetMap](https://www.openstreetmap.org) & [Leaflet](https://leafletjs.com)
- Icons by [Lucide](https://lucide.dev)
- Built with [Cloudflare](https://cloudflare.com) infrastructure

---

Made with ❤️ in Thailand 🇹🇭
