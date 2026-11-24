/**
 * Utility to format and normalize airline names into standard Title Case / Official Brand Name
 */
export const formatAirlineName = (name?: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Known airline brand canonical casings
  const airlineMap: Record<string, string> = {
    'air india': 'Air India',
    'airindia': 'Air India',
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
    'emirates': 'Emirates',
    'ek': 'Emirates',
    'qatar airways': 'Qatar Airways',
    'qr': 'Qatar Airways',
    'etihad': 'Etihad Airways',
    'etihad airways': 'Etihad Airways',
    'ey': 'Etihad Airways',
    'singapore airlines': 'Singapore Airlines',
    'sq': 'Singapore Airlines',
    'lufthansa': 'Lufthansa',
    'lh': 'Lufthansa',
    'british airways': 'British Airways',
    'ba': 'British Airways',
  };

  if (airlineMap[lower]) {
    return airlineMap[lower];
  }

  // General Title Case for any airline (e.g. "air arabia" -> "Air Arabia")
  return trimmed.replace(/\b[a-z]/g, (char) => char.toUpperCase());
};
