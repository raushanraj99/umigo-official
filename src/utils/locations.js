// Simple in-memory cache to avoid repeated API lookups
const cityCache = new Map();

/**
 * Parse WKB (Well-Known Binary) Point (with SRID)
 * Format: [1 byte endian][4 bytes type][4 bytes SRID][8 bytes X][8 bytes Y]
 */
export function parseWKBPoint(wkbHex) {
  try {
    const bytes = new Uint8Array(
      wkbHex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
    );
    const view = new DataView(bytes.buffer);
    const littleEndian = view.getUint8(0) === 1;

    // Skip endian (1) + type (4) + SRID (4)
    const x = view.getFloat64(9, littleEndian);
    const y = view.getFloat64(17, littleEndian);

    return { lat: y, lng: x };
  } catch (err) {
    console.error("parseWKBPoint failed:", err);
    return { lat: null, lng: null };
  }
}

/**
 * Reverse geocode lat/lng → city using a CORS-safe API
 */
export async function getCityName(lat, lng) {
  if (!lat || !lng) return "Unknown";

  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cityCache.has(key)) return cityCache.get(key);

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    const city =
      data.city || data.locality || data.principalSubdivision || "Unknown";

    cityCache.set(key, city);
    return city;
  } catch (err) {
    console.error("getCityName failed:", err);
    return "Unknown";
  }
}
