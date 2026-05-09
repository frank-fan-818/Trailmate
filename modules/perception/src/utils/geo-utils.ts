/**
 * Haversine formula — calculate distance between two geographic coordinates.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Known geofence regions defined as center + radius.
 */
export interface GeofenceRegion {
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

/** Predefined special-area geofences (border areas, high-risk zones). */
export const SPECIAL_AREA_GEOFENCES: GeofenceRegion[] = [
  {
    name: '边境地区',
    latitude: 47.35,
    longitude: 130.30,
    radiusMeters: 50000
  },
  {
    name: '高风险地区',
    latitude: 23.35,
    longitude: 116.68,
    radiusMeters: 30000
  }
]

/**
 * Check whether a coordinate falls within a geofence region.
 */
export function isInGeofence(
  lat: number,
  lng: number,
  region: GeofenceRegion
): boolean {
  return haversineDistance(lat, lng, region.latitude, region.longitude) <= region.radiusMeters
}

/**
 * Check whether a coordinate falls within any of the predefined special areas.
 */
export function checkSpecialArea(lat: number, lng: number): string | null {
  for (const region of SPECIAL_AREA_GEOFENCES) {
    if (isInGeofence(lat, lng, region)) {
      return region.name
    }
  }
  return null
}
