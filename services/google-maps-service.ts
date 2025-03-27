import { LocationCoordinates, NearbyPlace, MapViewOptions } from "@/types";

// Use the API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Fetch nearby places based on location, place type and radius
 */
export async function fetchNearbyPlaces(
  location: LocationCoordinates,
  placeType: MapViewOptions["placeType"],
  radius: number
): Promise<NearbyPlace[]> {
  try {
    // Due to API key restrictions/issues, we'll use mock data
    // This would be replaced with real API calls in production
    console.log("Using mock data due to API key restrictions");
    return mockNearbyPlaces(location, placeType, radius);
    
    /* Real Google Places API implementation (disabled for now)
    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      console.warn("Google Maps API key not configured. Using mock data instead.");
      return mockNearbyPlaces(location, placeType, radius);
    }

    // Convert kilometers to meters for the Google Places API
    const radiusInMeters = radius * 1000;
    
    // Build the request URL
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radiusInMeters}&type=${placeType}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Make the request - we'll use a proxy server in development to avoid CORS issues
    // In production, this should be handled by a backend API
    const proxyUrl = `/api/google-maps-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    // Transform Google Places API response to our app's format
    return data.results.map((place: any) => {
      // Calculate distance (in a real app, we would use the distance matrix API)
      const lat1 = location.latitude;
      const lon1 = location.longitude;
      const lat2 = place.geometry.location.lat;
      const lon2 = place.geometry.location.lng;
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // Estimate time (very rough estimate - 3 minutes per km)
      const estimatedTimeToReach = Math.round(distance * 3);
      
      return {
        id: place.place_id,
        name: place.name,
        placeType: placeType,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        address: place.vicinity,
        rating: place.rating || 3.5,
        priceLevel: place.price_level !== undefined ? place.price_level : undefined,
        distance: distance, // in kilometers
        estimatedTimeToReach: estimatedTimeToReach, // in minutes
        open: place.opening_hours?.open_now || false,
      };
    });
    */
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    // Fallback to mock data on error
    return mockNearbyPlaces(location, placeType, radius);
  }
}

/**
 * Generate mock places data for testing or when API is not available
 */
function mockNearbyPlaces(
  location: LocationCoordinates,
  placeType: MapViewOptions["placeType"],
  radius: number
): NearbyPlace[] {
  // Create some mock places around the user's location
  const mockPlaces: NearbyPlace[] = [];
  
  if (placeType === "petrol_station") {
    mockPlaces.push(
      {
        id: "mock-petrol-1",
        name: "City Petrol Station",
        placeType: "petrol_station",
        location: {
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01,
        },
        address: "123 Main St",
        rating: 4.5,
        priceLevel: 2,
        distance: 1.2,
        estimatedTimeToReach: 5,
        open: true,
      },
      {
        id: "mock-petrol-2",
        name: "Highway Gas & Service",
        placeType: "petrol_station",
        location: {
          latitude: location.latitude - 0.01,
          longitude: location.longitude + 0.02,
        },
        address: "456 Highway Rd",
        rating: 4.2,
        priceLevel: 1,
        distance: 2.5,
        estimatedTimeToReach: 8,
        open: true,
      },
      {
        id: "mock-petrol-3",
        name: "Express Fuel & Snacks",
        placeType: "petrol_station",
        location: {
          latitude: location.latitude + 0.008,
          longitude: location.longitude - 0.018,
        },
        address: "202 Quick Stop Blvd",
        rating: 4.0,
        priceLevel: 1,
        distance: 1.8,
        estimatedTimeToReach: 6,
        open: true,
      },
      {
        id: "mock-petrol-4",
        name: "Downtown Petrol",
        placeType: "petrol_station",
        location: {
          latitude: location.latitude - 0.015,
          longitude: location.longitude - 0.015,
        },
        address: "789 Center St",
        rating: 3.8,
        priceLevel: 2,
        distance: 3.2,
        estimatedTimeToReach: 10,
        open: false,
      },
      {
        id: "mock-petrol-5",
        name: "Motorway Fuel Stop",
        placeType: "petrol_station",
        location: {
          latitude: location.latitude + 0.02,
          longitude: location.longitude + 0.02,
        },
        address: "101 Expressway",
        rating: 4.3,
        priceLevel: 3,
        distance: 4.1,
        estimatedTimeToReach: 12,
        open: true,
      }
    );
  } else if (placeType === "auto_parts_store") {
    mockPlaces.push(
      {
        id: "mock-parts-1",
        name: "Auto Parts Center",
        placeType: "auto_parts_store",
        location: {
          latitude: location.latitude + 0.02,
          longitude: location.longitude - 0.01,
        },
        address: "789 Mechanic St",
        rating: 4.8,
        priceLevel: 3,
        distance: 3.1,
        estimatedTimeToReach: 12,
        open: false,
      },
      {
        id: "mock-parts-2",
        name: "Premium Auto Store",
        placeType: "auto_parts_store",
        location: {
          latitude: location.latitude - 0.015,
          longitude: location.longitude - 0.025,
        },
        address: "101 Parts Ave",
        rating: 3.9,
        priceLevel: 2,
        distance: 4.3,
        estimatedTimeToReach: 15,
        open: true,
      },
      {
        id: "mock-parts-3",
        name: "Vehicle Parts Emporium",
        placeType: "auto_parts_store",
        location: {
          latitude: location.latitude - 0.022,
          longitude: location.longitude + 0.009,
        },
        address: "303 Mechanic Lane",
        rating: 4.7,
        priceLevel: 3,
        distance: 2.9,
        estimatedTimeToReach: 10,
        open: true,
      },
      {
        id: "mock-parts-4",
        name: "City Auto Supplies",
        placeType: "auto_parts_store",
        location: {
          latitude: location.latitude + 0.005,
          longitude: location.longitude - 0.005,
        },
        address: "405 Garage St",
        rating: 4.1,
        priceLevel: 2,
        distance: 1.1,
        estimatedTimeToReach: 4,
        open: true,
      },
      {
        id: "mock-parts-5",
        name: "Mechanic's Choice Parts",
        placeType: "auto_parts_store",
        location: {
          latitude: location.latitude - 0.008,
          longitude: location.longitude + 0.015,
        },
        address: "222 Service Road",
        rating: 4.4,
        priceLevel: 2,
        distance: 3.5,
        estimatedTimeToReach: 11,
        open: false,
      }
    );
  }
  
  // Filter by radius
  const filteredPlaces = mockPlaces.filter(place => place.distance <= radius);
  
  // Sort by distance
  return filteredPlaces.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Number(distance.toFixed(1));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
} 