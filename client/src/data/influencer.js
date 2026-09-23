// src/data/influencer.js

export const CATEGORY_OPTIONS = [
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Food & Dining",
  "Travel",
  "Fitness",
  "Gaming",
  "Technology",
  "Finance",
  "Education",
  "Entertainment",
  "Health",
  "Photography",
  "Music",
  "Sports",
  "Other",
];

export const categories = [
  { id: "cat_0", name: "Fashion", emoji: "👗" },
  { id: "cat_1", name: "Beauty", emoji: "💄" },
  { id: "cat_2", name: "Lifestyle", emoji: "✨" },
  { id: "cat_3", name: "Food & Dining", emoji: "🍽️" },
  { id: "cat_4", name: "Travel", emoji: "✈️" },
  { id: "cat_5", name: "Fitness", emoji: "💪" },
  { id: "cat_6", name: "Gaming", emoji: "🎮" },
  { id: "cat_7", name: "Technology", emoji: "💻" },
  { id: "cat_8", name: "Finance", emoji: "💰" },
  { id: "cat_9", name: "Education", emoji: "📚" },
  { id: "cat_10", name: "Entertainment", emoji: "🎬" },
  { id: "cat_11", name: "Health", emoji: "❤️" },
  { id: "cat_12", name: "Photography", emoji: "📸" },
  { id: "cat_13", name: "Music", emoji: "🎵" },
  { id: "cat_14", name: "Sports", emoji: "🏆" },
  { id: "cat_15", name: "Other", emoji: "🌟" },
];

export const locations = [
  "Mumbai, India",
  "Delhi, India",
  "Bengaluru, India",
  "Hyderabad, India",
  "Chennai, India",
  "Kolkata, India",
  "Pune, India",
  "Ahmedabad, India",
  "Jaipur, India",
  "Chandigarh, India",
  "Goa, India",
];

export const formatFollowers = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000000000) {
    return `${(number / 1000000000)
      .toFixed(1)
      .replace(/\.0$/, "")}B`;
  }

  if (number >= 1000000) {
    return `${(number / 1000000)
      .toFixed(1)
      .replace(/\.0$/, "")}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000)
      .toFixed(1)
      .replace(/\.0$/, "")}K`;
  }

  return String(number);
};

// Static creators
export const influencers = [
  {
    id: "creator_mock_1",
    name: "Aarav Sharma",
    handle: "@aaravcreates",
    category: "Lifestyle",
    followers: 125000,
    startingPrice: 15000,
    isBarterAllowed: true,
    location: "Delhi, India",
    rating: 4.8,
    reviews: 24,
    available: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",

    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80",

    bio:
      "Lifestyle creator sharing fashion, travel, daily life and brand experiences.",

    instagramHandle: "aaravcreates",
    instagramFollowers: 85000,

    facebookHandle: "aaravcreates",
    facebookFollowers: 12000,

    linkedinHandle: "aarav-sharma",
    linkedinFollowers: 5000,

    youtubeHandle: "aaravcreates",
    youtubeFollowers: 18000,

    quoraHandle: "Aarav-Sharma",
    quoraFollowers: 3000,

    twitterHandle: "aaravcreates",
    twitterFollowers: 2000,

    pricingTiers: [],
    role: "creator",
    verificationStatus: "verified",

    portfolioImages: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    ],
  },

  {
    id: "creator_mock_2",
    name: "Riya Kapoor",
    handle: "@riyakapoor",
    category: "Fashion",
    followers: 245000,
    startingPrice: 25000,
    location: "Mumbai, India",
    rating: 4.9,
    reviews: 42,
    available: true,

    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya",

    cover:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80",

    bio:
      "Fashion and beauty creator focused on styling, beauty and lifestyle content.",

    instagramHandle: "riyakapoor",
    instagramFollowers: 180000,

    facebookHandle: "riyakapoor",
    facebookFollowers: 20000,

    linkedinHandle: "riya-kapoor",
    linkedinFollowers: 8000,

    youtubeHandle: "riyakapoor",
    youtubeFollowers: 30000,

    quoraHandle: "Riya-Kapoor",
    quoraFollowers: 4000,

    twitterHandle: "riyakapoor",
    twitterFollowers: 3000,

    pricingTiers: [],
    role: "creator",
    verificationStatus: "verified",

    portfolioImages: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
    ],
  },
];

// Static brands
export const mockBrands = [
  {
    id: "brand_mock_hawai",
    name: "Hawai Restaurant",
    handle: "@hawai.restaurant",
    category: "Food & Dining",
    followers: 0,
    startingPrice: 0,
    location: "Delhi NCR",
    rating: 4.7,
    reviews: 18,
    available: true,

    avatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Hawai",

    cover:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=80",

    bio:
      "Restaurant and food brand looking to collaborate with food, lifestyle and family creators.",

    role: "brand",

    companySize: "50 - 200 employees",
    website: "https://www.hawai.restaurant",

    campaignsCount: 14,
    hiredCount: 52,

    prefNiches:
      "Food, Dining, Family Vlogs, Lifestyle",

    prefBudget:
      "₹10K - ₹40K per post",

    prefReach:
      "10K+ followers",

    prefRegions:
      "Delhi & NCR",

    portfolioImages: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80",
    ],
  },
];

export default influencers;