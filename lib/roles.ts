// Role categories for filtering
export const ROLE_CATEGORIES = {
  ACHIEVEMENT: "Achievement",
  LANGUAGE: "Language",
  COMMUNITY: "Community",
  DEVELOPER: "Developer",
  STAFF: "Staff",
  OTHER: "Other",
};

// General Discord roles - already ordered by importance (most important at top)
export const GENERAL_ROLES = [
  "Staff Prover",
  "Regional Lead",
  "Regional Helper",
  "Dev Helper",
  "Cargo Prover",
  "Super Prover",
  "Programmable Truth Lead",
  "Prover",
  "Truth Prover",
  "sp1up Prover",
  "Helper Prover",
  "Truth Prover (KOL)",
  "ProvedURLUV (KOL)",
  "Proofer",
  "PWOOFER",
  "PROVED UR LUV",
  "SUCCINCT CRACKED EMPLOYEE",
  "Programmable Truth Potential",
  "Super Prover Potential",
  "gmoon math",
  "Beta Prover",
  "ALL IN SUCCINCT",
  "Dev Channel",
  "PROOF OF DEV",
  "PROOF OF ART",
  "PROOF OF MUSIC",
  "PROOF OF VIDEO",
  "PROOF OF WRITING",
  "PROOF OF FUN",
  "PROOF OF TROLL",
  "PROOF OF BRUH",
  "PROOF OF FENT",
  "PROOF OF GOONER",
  "Proof Verified",
  "Retired Prover",
  "lets pruv it",
  "ZK Frens",
  "zkOG",
  "zkART",
  "ZK EVENTS",
  "Contribution Team",
  "TICKET🩷🩷🩷🩷🩷🩷",
  "EVENTS LEAD",
  "Server Booster",
  "X Prover",
];

// Regional/Language roles
export const REGIONAL_ROLES = [
  "🇮🇳-🇵🇰・हिन्दी-اردو",
  "عربي・🇸🇦",
  "🇧🇩・বাংলা",
  "🇧🇷・português",
  "🇨🇳・中文",
  "🇪🇸・español",
  "🇮🇩・indonesia",
  "🇮🇷・فارسی",
  "🇯🇵・日本語",
  "🇰🇷・한국어",
  "🇳🇬・Pidgin",
  "🇵🇭・pilipino",
  "🇵🇱・polski",
  "🇷🇺・русский",
  "🇹🇭・ภาษาไทย",
  "🇹🇷・türkçe",
  "🇺🇦・українська",
  "🇻🇳・tiếng-việt",
];

// All roles combined
export const ALL_ROLES = [...GENERAL_ROLES, ...REGIONAL_ROLES];

// Role configuration with category
export interface RoleConfig {
  category: string;
  index: number; // Store the original index for sorting
}

// Create role configurations with original index for sorting
export const ROLE_CONFIGS: Record<string, RoleConfig> = {};

// Initialize role configs with their original index for sorting
GENERAL_ROLES.forEach((role, index) => {
  ROLE_CONFIGS[role] = {
    category: categorizeRole(role),
    index: index,
  };
});

REGIONAL_ROLES.forEach((role, index) => {
  ROLE_CONFIGS[role] = {
    category: ROLE_CATEGORIES.LANGUAGE,
    index: GENERAL_ROLES.length + index,
  };
});

/**
 * Get the category for a role
 * @param role The role to categorize
 * @returns The category of the role
 */
export function categorizeRole(role: string): string {
  // Check if it's a regional/language role
  if (
    REGIONAL_ROLES.includes(role) ||
    /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(role) ||
    role.includes("・")
  ) {
    return ROLE_CATEGORIES.LANGUAGE;
  }

  // Categorize based on keywords
  if (
    role.includes("Staff") ||
    role.includes("Lead") ||
    role.includes("EMPLOYEE") ||
    role.includes("Helper")
  ) {
    return ROLE_CATEGORIES.STAFF;
  }

  if (
    (role.includes("Prover") && !role.includes("X Prover")) ||
    role.includes("Proof") ||
    role.includes("Truth") ||
    role.includes("Proofer") ||
    role.includes("PWOOFER") ||
    role.includes("Verified") ||
    role.includes("PROVED") ||
    role.includes("Potential")
  ) {
    return ROLE_CATEGORIES.ACHIEVEMENT;
  }

  if (
    role.includes("DEV") ||
    role.includes("Dev") ||
    role.includes("Cargo") ||
    role.includes("sp1up")
  ) {
    return ROLE_CATEGORIES.DEVELOPER;
  }

  if (
    role.includes("EVENT") ||
    role.includes("Booster") ||
    role.includes("pruv it") ||
    role.includes("ZK") ||
    role.includes("zk") ||
    role.includes("TICKET") ||
    role.includes("Team") ||
    role.includes("ALL IN")
  ) {
    return ROLE_CATEGORIES.COMMUNITY;
  }

  // Default to "Other" category
  return ROLE_CATEGORIES.OTHER;
}

/**
 * Get the original index of a role (lower index = higher importance)
 * @param role The role to get index for
 * @returns The original index
 */
export function getRoleIndex(role: string): number {
  if (role in ROLE_CONFIGS) {
    return ROLE_CONFIGS[role].index;
  }

  // If not found, return a high number to put it at the end
  return 1000;
}

/**
 * Sort roles by their original order (most important first)
 * @param roles Array of roles to sort
 * @returns Sorted array of roles
 */
export function sortRolesByImportance(roles: string[]): string[] {
  return [...roles].sort((a, b) => {
    const indexA = getRoleIndex(a);
    const indexB = getRoleIndex(b);
    return indexA - indexB;
  });
}

/**
 * Group roles by category while maintaining original order within each category
 * @param roles Array of roles to group
 * @returns Object with categories as keys and arrays of roles as values
 */
export function groupRolesByCategory(
  roles: string[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  // Initialize categories
  Object.values(ROLE_CATEGORIES).forEach((category) => {
    grouped[category] = [];
  });

  // Group roles by category
  roles.forEach((role) => {
    const category = categorizeRole(role);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(role);
  });

  // Sort roles within each category by original index
  Object.keys(grouped).forEach((category) => {
    grouped[category] = sortRolesByImportance(grouped[category]);
  });

  return grouped;
}
/**
 * Get the highest role from a list of roles
 * @param roles Array of roles to check
 * @returns The highest role based on original index
 */
