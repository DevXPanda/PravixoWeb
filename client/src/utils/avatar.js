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
