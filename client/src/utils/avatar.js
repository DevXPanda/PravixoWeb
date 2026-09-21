// Avatar Collections and Helper Functions

export const AVATAR_PRESETS = {
  creators: {
    boys: [
      { id: "boy_1", name: "Alex (Smiling)", url: "https://api.dicebear.com/9.x/micah/svg?seed=Alex&mouth=smile&hair=fonze&facialHairProbability=0" },
      { id: "boy_2", name: "Ryan (Cheerful)", url: "https://api.dicebear.com/9.x/micah/svg?seed=Ryan&mouth=laughing&hair=mrClean&facialHairProbability=15" },
      { id: "boy_3", name: "Leo (Cool)", url: "https://api.dicebear.com/9.x/micah/svg?seed=Leo&mouth=pucker&hair=full&facialHairProbability=0" },
      { id: "boy_4", name: "David (Friendly)", url: "https://api.dicebear.com/9.x/micah/svg?seed=David&mouth=smile&hair=dannyPhantom&facialHairProbability=20" },
      { id: "boy_5", name: "Sam (Casual)", url: "https://api.dicebear.com/9.x/micah/svg?seed=Sam&mouth=laughing&hair=pixie&facialHairProbability=0" },
      { id: "boy_6", name: "Kabir (Modern)", url: "https://api.dicebear.com/9.x/micah/svg?seed=Kabir&mouth=smirk&hair=turban&facialHairProbability=25" },
    ],
    girls: [
      { id: "girl_1", name: "Emma (Joyful)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Emma&mouth=happy01,happy02&eyes=happy,smiling" },
      { id: "girl_2", name: "Sophia (Sweet)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sophia&mouth=happy03,happy04&eyes=smiling" },
      { id: "girl_3", name: "Aanya (Vibrant)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Aanya&mouth=happy05,happy06&eyes=round" },
      { id: "girl_4", name: "Mia (Delight)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Mia&mouth=happy07,happy08&eyes=happy" },
      { id: "girl_5", name: "Chloe (Sunny)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Chloe&mouth=happy09,happy10&eyes=smiling" },
      { id: "girl_6", name: "Zoya (Radiant)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Zoya&mouth=happy11,happy12&eyes=variant01" },
    ],
    aged: [
      { id: "aged_1", name: "Arthur (Senior Pro)", url: "https://api.dicebear.com/9.x/micah/svg?seed=GrandpaArthur&hair=mrClean&mouth=smile&facialHair=beard&facialHairProbability=100" },
      { id: "aged_2", name: "Martha (Experienced)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=GrandmaMartha&glasses=variant01,variant02&eyes=smiling&mouth=happy01" },
      { id: "aged_3", name: "Sharma Ji (Veteran)", url: "https://api.dicebear.com/9.x/micah/svg?seed=SeniorMentor&glasses=round,square&hair=full&mouth=smile&facialHairProbability=50" },
      { id: "aged_4", name: "Kalyani (Mentor)", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=ElderMatron&glasses=variant03&mouth=happy03&eyes=happy" },
    ]
  },
  brands: {
    faces: [
      { id: "bf_1", name: "Corporate Exec", url: "https://api.dicebear.com/9.x/micah/svg?seed=BizLeader&mouth=smile&hair=fonze" },
      { id: "bf_2", name: "Creative Lead", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=DesignChief&mouth=happy02&eyes=smiling" },
      { id: "bf_3", name: "Brand Rep", url: "https://api.dicebear.com/9.x/micah/svg?seed=BrandRep&mouth=smile&hair=pixie" },
      { id: "bf_4", name: "Official Emblem", url: "https://api.dicebear.com/9.x/identicon/svg?seed=EnterpriseHQ" },
    ],
    categories: [
      { id: "cat_shoes", name: "Shoes & Footwear", icon: "👟", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_fashion", name: "Fashion & Apparel", icon: "👗", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_tech", name: "Tech & Gadgets", icon: "💻", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_beauty", name: "Beauty & Cosmetics", icon: "💄", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_food", name: "Food & Beverages", icon: "🍔", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_fitness", name: "Fitness & Gym", icon: "🏋️", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_gaming", name: "Gaming & Esports", icon: "🎮", url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=300&h=300&q=80" },
      { id: "cat_travel", name: "Travel & Lifestyle", icon: "✈️", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&h=300&q=80" },
    ]
  }
};

// Helper to generate deterministic, gender-appropriate DiceBear avatars
export function getGenderAvatar(name = "User", gender = "", role = "creator") {
  const seed = encodeURIComponent((name || "User").trim());
  const cleanGender = (gender || "").toLowerCase().trim();

  if (role === "brand") {
    return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
  }

  if (cleanGender === "female") {
    // Friendly, vibrant female creator illustration (Lorelei with cheerful expression)
    return `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&mouth=happy01,happy02,happy03,happy04,happy05,happy06,happy07,happy08,happy09,happy10,happy11,happy12,happy13,happy14,happy15,happy16,happy17,happy18&eyes=happy,smiling,round,variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10`;
  }

  // Friendly, modern male creator illustration (Micah with smiling mouth & clean hairstyle)
  return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing,pucker,smirk&hair=fonze,mrClean,mrT,dannyPhantom,full,pixie,turban&facialHairProbability=10`;
}

export const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1800&q=85",
];

export const DEFAULT_BANNER_IMAGES = DEFAULT_BANNERS;
export const DEFAULT_BANNER = DEFAULT_BANNERS[0];
