/**
 * Utility to format and normalize airline names into standard Title Case / Official Brand Name
 */
export const formatAirlineName = (name?: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Known airline brand canonical casings & IATA codes
  const airlineMap: Record<string, string> = {
    'air india': 'Air India',
    'airindia': 'Air India',
    'ai': 'Air India',
    'indigo': 'IndiGo',
    '6e': 'IndiGo',
    'spicejet': 'SpiceJet',
    'sg': 'SpiceJet',
    'vistara': 'Vistara',
    'uk': 'Vistara',
    'akasa air': 'Akasa Air',
    'akasa': 'Akasa Air',
    'qp': 'Akasa Air',
    'air india express': 'Air India Express',
    'airindiaexpress': 'Air India Express',
    'ix': 'Air India Express',
    'star air': 'Star Air',
    's5': 'Star Air',
    'flybig': 'FlyBig',
    'alliance air': 'Alliance Air',
    '9i': 'Alliance Air',
    'fly91': 'Fly91',
    'ic': 'Fly91',
    'fitsair': 'FitsAir',
    'fits air': 'FitsAir',
    '8d': 'FitsAir',
    'srilankan': 'SriLankan Airlines',
    'srilankan airlines': 'SriLankan Airlines',
    'ul': 'SriLankan Airlines',
    'emirates': 'Emirates',
    'ek': 'Emirates',
    'qatar airways': 'Qatar Airways',
    'qr': 'Qatar Airways',
    'etihad': 'Etihad Airways',
    'etihad airways': 'Etihad Airways',
    'ey': 'Etihad Airways',
    'air arabia': 'Air Arabia',
    'g9': 'Air Arabia',
    'flydubai': 'flydubai',
    'fly dubai': 'flydubai',
    'fz': 'flydubai',
    'oman air': 'Oman Air',
    'wy': 'Oman Air',
    'gulf air': 'Gulf Air',
    'gf': 'Gulf Air',
    'kuwait airways': 'Kuwait Airways',
    'ku': 'Kuwait Airways',
    'saudia': 'Saudia',
    'sv': 'Saudia',
    'flynas': 'flynas',
    'xy': 'flynas',
    'singapore airlines': 'Singapore Airlines',
    'sq': 'Singapore Airlines',
    'scoot': 'Scoot',
    'tr': 'Scoot',
    'malaysia airlines': 'Malaysia Airlines',
    'mh': 'Malaysia Airlines',
    'airasia': 'AirAsia',
    'air asia': 'AirAsia',
    'ak': 'AirAsia',
    'i5': 'AirAsia',
    'fd': 'AirAsia',
    'd7': 'AirAsia',
    'thai airways': 'Thai Airways',
    'tg': 'Thai Airways',
    'vietjet': 'VietJet Air',
    'vietjet air': 'VietJet Air',
    'vj': 'VietJet Air',
    'vietnam airlines': 'Vietnam Airlines',
    'vn': 'Vietnam Airlines',
    'cathay pacific': 'Cathay Pacific',
    'cx': 'Cathay Pacific',
    'turkish airlines': 'Turkish Airlines',
    'tk': 'Turkish Airlines',
    'lufthansa': 'Lufthansa',
    'lh': 'Lufthansa',
    'british airways': 'British Airways',
    'ba': 'British Airways',
    'air france': 'Air France',
    'af': 'Air France',
    'klm': 'KLM',
    'kl': 'KLM',
    'swiss': 'SWISS',
    'lx': 'SWISS',
  };

  if (airlineMap[lower]) {
    return airlineMap[lower];
  }

  // General Title Case for any airline (e.g. "air arabia" -> "Air Arabia")
  return trimmed.replace(/\b[a-z]/g, (char) => char.toUpperCase());
};

/**
 * Upgrades square 200x200 pics.avs.io URLs to crisp 400x160 landscape airline logos.
 */
export const resolveCrispAirlineLogo = (logoUrl?: string): string => {
  if (!logoUrl) return '';
  return logoUrl.replace('pics.avs.io/200/200/', 'pics.avs.io/400/160/');
};
