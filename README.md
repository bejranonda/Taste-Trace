# TasteTrace

> ตามรอยความอร่อย | Trace the Taste | Folge dem Geschmack

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bejranonda/Taste-Trace)

AI-powered restaurant review aggregator that helps you discover the best dining experiences in Thailand.

## Features

- **AI Summary Insights** - Get consolidated pros/cons analysis from multiple reviews using Workers AI
- **Influencer Reviews** - See video reviews from YouTube/TikTok food content creators
- **Credibility Scoring** - Trust scores based on review consistency over time
- **Review Trends** - Track restaurant quality trends (2021-2024)
- **Multi-Language Support** - Thai 🇹🇭, English 🇬🇧, German 🇩🇪
- **Interactive Map** - Visual restaurant discovery

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide Icons

### Backend (Cloudflare)
- Cloudflare Pages
- Cloudflare Pages Functions
- D1 Database (SQLite)
- Workers AI (Llama 3.1 8B)

## Quick Start

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

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Cloudflare deployment instructions.

### Quick Deploy

1. Fork this repository
2. Connect to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/restaurants` | GET | List restaurants with optional filtering |
| `/api/ai-summary` | POST | Generate AI summary from reviews |

### Example: Get Restaurants

```bash
curl "https://your-domain.pages.dev/api/restaurants?filter=shell&lang=th"
```

### Example: AI Summary

```bash
curl -X POST "https://your-domain.pages.dev/api/ai-summary" \
  -H "Content-Type: application/json" \
  -d '{"restaurantName":"Jae Fai","reviews":"...","language":"th"}'
```

## Supported Review Sources

| Source | Badge | Description |
|--------|-------|-------------|
| Michelin Guide | ⭐ | Michelin-starred restaurants |
| เชลล์ชวนชิม | 🥣 | Shell Chuan Chim (Thai food guide) |
| เปิบพิสดาร | 😋 | Peb Pisatarn (Thai food show) |
| Google Maps | - | User reviews |
| Wongnai | - | Thai local reviews |

## Project Structure

```
tastetrace/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind styles
├── functions/
│   └── api/
│       ├── restaurants.js  # Restaurant API
│       └── ai-summary.js   # AI summary API
├── public/
│   └── favicon.svg      # App icon
├── schema.sql           # D1 database schema
├── wrangler.toml        # Cloudflare config
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── DEPLOYMENT.md        # Deployment guide
```

## Environment Variables

No environment variables required for basic deployment. Workers AI and D1 are configured via `wrangler.toml`.

## Free Tier Limits (Cloudflare)

| Service | Free Tier |
|---------|-----------|
| Pages | Unlimited requests |
| D1 Database | 5 GB storage, 5M reads/day |
| Workers AI | 10,000 requests/day |

## Roadmap

- [ ] User authentication
- [ ] Personalized recommendations
- [ ] Restaurant owner dashboard
- [ ] Mobile app (React Native)
- [ ] More AI features (sentiment analysis, fake review detection)
- [ ] Additional languages (Chinese, Japanese)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Restaurant data inspired by Thai street food culture
- Icons by [Lucide](https://lucide.dev)
- Built with [Cloudflare](https://cloudflare.com) infrastructure
