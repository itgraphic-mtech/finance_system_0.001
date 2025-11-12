/**
 * Region code to Thai name mapping
 * Mapping for Thai regions
 */

const REGION_MAP: Record<string, string> = {
  'R': 'ใต้',
  'N': 'เหนือ',
  'Q': 'อีสานบน',
  'P': 'อีสานล่าง',
  'M': 'ตะวันออก',
  'O': 'กลาง',
  'A': 'กรุงเทพและปริมณทล',
  'B': 'กรุงเทพและปริมณทล',
  'C': 'กรุงเทพและปริมณทล',
  'D': 'กรุงเทพและปริมณทล',
  'E': 'กรุงเทพและปริมณทล',
  'F': 'กรุงเทพและปริมณทล',
  'G': 'กรุงเทพและปริมณทล',
};

/**
 * Convert region code to Thai name
 * If region code is not found, return "ลูกค้าบริษัท"
 */
export function getRegionName(code: string): string {
  if (!code) return 'ลูกค้าบริษัท';
  return REGION_MAP[code.toUpperCase()] || 'ลูกค้าบริษัท';
}

/**
 * Get all unique region names from codes
 */
export function getUniqueRegionNames(codes: string[]): string[] {
  const uniqueNames = new Set<string>();
  codes.forEach((code) => {
    uniqueNames.add(getRegionName(code));
  });
  return Array.from(uniqueNames).sort();
}

/**
 * Get region code from region name (reverse mapping)
 */
export function getRegionCode(name: string): string | null {
  for (const [code, regionName] of Object.entries(REGION_MAP)) {
    if (regionName === name) return code;
  }
  return null;
}
