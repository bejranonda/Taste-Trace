// Restaurant data - Real Thai restaurants with EatJourney features
export const RESTAURANTS = [
  {
    id: 1,
    name: "ร้านเจ๊ไฝ (Jae Fai)",
    category: "Street Food",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7523, 100.5108],
    googleMapsUrl: "https://www.google.com/maps/place/Raan+Jay+Fai",
    images: ["https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    reviews: {
      google: 4.4,
      facebook: 4.8,
      wongnai: 4.0
    },
    influencerReviews: [
      {
        id: "v1",
        platform: "youtube",
        thumbnail: "https://img.youtube.com/vi/1ZgD3j2y4y8/maxresdefault.jpg",
        url: "https://www.youtube.com/watch?v=1ZgD3j2y4y8",
        title: "Mark Wiens - Eating at Jae Fai",
        timestamp: "5m 30s"
      },
      {
        id: "v2",
        platform: "tiktok",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        url: "#",
        title: "@FoodieBKK Reviews",
        timestamp: "0:45"
      }
    ],
    aiAnalysis: {
      pros: ["Crab Omelette is legendary", "Open kitchen experience", "Michelin Star quality"],
      cons: ["Extremely long wait", "Expensive for street food", "No reservations"],
      credibilityScore: 95,
      trend: [60, 75, 85, 90, 95, 92]
    },
    queueData: {
      bestTime: "8:30 AM (Before opening)",
      currentWait: 180,
      history: [10, 30, 120, 180, 240, 150, 60]
    },
    dishes: [
      { name: "Crab Omelette", price: 1000, isSignature: true, image: "https://images.unsplash.com/photo-1599020792689-9fdeefad48cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" },
      { name: "Drunken Noodles", price: 500, isSignature: false, image: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" }
    ]
  },
  {
    id: 2,
    name: "ทิพย์สมัย ผัดไทยประตูผี (Thip Samai)",
    category: "Pad Thai",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7528, 100.5048],
    googleMapsUrl: "https://www.google.com/maps/place/Thip+Samai",
    images: ["https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    reviews: { google: 4.2, facebook: 4.5, wongnai: 3.8 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Iconic Pad Thai", "Fast service", "Original recipe"],
      cons: ["Sweet taste profile", "Crowded with tourists", "Long queue at dinner"],
      credibilityScore: 88,
      trend: [70, 75, 80, 85, 88, 85]
    },
    queueData: { bestTime: "5:00 PM (Early dinner)", currentWait: 45, history: [0, 20, 45, 60, 90, 30] },
    dishes: [
      { name: "Superb Pad Thai", price: 120, isSignature: true, image: null },
      { name: "Orange Juice", price: 150, isSignature: true, image: null }
    ]
  },
  {
    id: 3,
    name: "วัฒนาพานิช (Wattana Panich)",
    category: "Beef Noodle",
    badges: ["michelin", "shell_chuan_chim"],
    dietary: [],
    coordinates: [13.7392, 100.5294],
    googleMapsUrl: "https://www.google.com/maps/place/Wattana+Panich",
    images: [],
    reviews: { google: 4.5, facebook: 4.7, wongnai: 4.2 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Rich broth stewed for 50 years", "Tender beef", "Authentic vibe"],
      cons: ["Small portion", "Hot environment", "Limited seating"],
      credibilityScore: 92,
      trend: [80, 82, 85, 88, 90, 92]
    },
    queueData: { bestTime: "10:00 AM", currentWait: 15, history: [10, 30, 45, 20, 10, 5] },
    dishes: [{ name: "Beef Noodle Soup", price: 100, isSignature: true, image: null }]
  },
  {
    id: 4,
    name: "Broccoli Revolution",
    category: "Vegan",
    badges: [],
    dietary: ["vegan", "glutenFree"],
    coordinates: [13.7400, 100.5400],
    googleMapsUrl: "https://www.google.com/maps/place/Broccoli+Revolution+Bangkok",
    images: [],
    reviews: { google: 4.3, facebook: 4.4, wongnai: 4.0 },
    influencerReviews: [],
    aiAnalysis: {
      pros: ["Health-conscious", "Modern atmosphere", "Creative menu"],
      cons: ["Pricey", "Small portions", "Service can be slow"],
      credibilityScore: 85,
      trend: [70, 75, 78, 80, 82, 85]
    },
    queueData: { bestTime: "2:00 PM", currentWait: 0, history: [0, 10, 20, 15, 5, 0] },
    dishes: [{ name: "Quinoa Burger", price: 250, isSignature: true, image: null }]
  }
];

export default RESTAURANTS;
