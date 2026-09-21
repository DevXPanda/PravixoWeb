// Helper to generate deterministic, gender-appropriate DiceBear avatars
export function getGenderAvatar(name = "User", gender = "", role = "creator") {
  const seed = encodeURIComponent((name || "User").trim());
  const cleanGender = (gender || "").toLowerCase().trim();

  if (role === "brand") {
    return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
  }

  if (cleanGender === "female") {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&top=bigHair,bob,bun,curly,curvy,longButNotTooLong,miaWallace,straight01,straight02,straightAndStrand&accessoriesProbability=15&facialHairProbability=0`;
  }

  // Default to male / male tops for male or unspecified creator
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&top=shortFlat,shortRound,shortCurly,shortWaved,theCaesar,theCaesarAndSidePart,sides&accessoriesProbability=0&facialHairProbability=20`;
}

export const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1800&q=85",
];

export const DEFAULT_BANNER_IMAGES = DEFAULT_BANNERS;
export const DEFAULT_BANNER = DEFAULT_BANNERS[0];
