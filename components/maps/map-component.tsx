"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import { LocationCoordinates, NearbyPlace, NavigationRoute } from "@/types"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Props interface for the MapComponent
interface MapComponentProps {
  currentLocation: LocationCoordinates
  nearbyPlaces: NearbyPlace[]
  selectedPlace: NearbyPlace | null
  setSelectedPlace: (place: NearbyPlace | null) => void
  directions: NavigationRoute | null
  getDirections: (place: NearbyPlace) => void
}

// Create a global variable to ensure icons are fixed only once
let iconsFixed = false;

// Fix Leaflet marker icons
const fixLeafletIcons = () => {
  // Only run in browser environment and only once
  if (typeof window === 'undefined' || iconsFixed) return;
  
  // Set flag to true to prevent multiple calls
  iconsFixed = true;
  
  delete L.Icon.Default.prototype._getIconUrl;
    
  // Modern custom icons for better visual appeal
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Create custom marker icons - safely
const createCustomIcon = (iconUrl: string, size: [number, number] = [32, 32]) => {
  // Only create icons in browser environment
  if (typeof window === 'undefined') return null;
  
  try {
    return new L.Icon({
      iconUrl,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1]],
      popupAnchor: [0, -size[1]],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [13, 41]
    });
  } catch (error) {
    console.error("Error creating custom icon:", error);
    return null;
  }
};

// Default icons for fallback - create safely
let defaultUserIcon: L.Icon | null = null;
let defaultPlaceIcon: L.Icon | null = null;

// Initialize default icons safely (only in browser)
if (typeof window !== 'undefined') {
  try {
    // Ensure default icons are properly set up first
    fixLeafletIcons();
    defaultUserIcon = new L.Icon.Default();
    defaultPlaceIcon = new L.Icon.Default();
  } catch (error) {
    console.error("Error initializing default icons:", error);
  }
}

// Helper component to update the map view when props change
function MapController({ 
  currentLocation, 
  selectedPlace 
}: { 
  currentLocation: LocationCoordinates,
  selectedPlace: NearbyPlace | null 
}) {
  const map = useMap();
  
  useEffect(() => {
    // Center map on user's location
    map.setView([currentLocation.latitude, currentLocation.longitude], 13);
    
    // Add zoom control to bottom right - safely
    try {
      if (map.zoomControl) {
        map.removeControl(map.zoomControl);
      }
      L.control.zoom({ position: 'bottomright' }).addTo(map);
    } catch (error) {
      console.error("Error setting zoom control:", error);
    }
    
    // Add scale control - check if it doesn't already exist
    try {
      const controls = map.getContainer().querySelectorAll('.leaflet-control-scale');
      if (controls.length === 0) {
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
      }
    } catch (error) {
      console.error("Error setting scale control:", error);
    }
  }, [map, currentLocation]);
  
  useEffect(() => {
    // If a place is selected, create bounds to show both locations
    if (selectedPlace) {
      try {
        const bounds = L.latLngBounds(
          [currentLocation.latitude, currentLocation.longitude],
          [selectedPlace.location.latitude, selectedPlace.location.longitude]
        );
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [map, currentLocation, selectedPlace]);
  
  return null;
}

// Main component
const MapComponent = ({ 
  currentLocation, 
  nearbyPlaces, 
  selectedPlace, 
  setSelectedPlace, 
  directions, 
  getDirections 
}: MapComponentProps) => {
  // State to track if icons are loaded
  const [iconsLoaded, setIconsLoaded] = useState(false);
  
  // We'll use refs to store our custom icons
  const userLocationIcon = useRef<L.Icon | null>(null);
  const petrolStationIcon = useRef<L.Icon | null>(null);
  const autoPartsIcon = useRef<L.Icon | null>(null);
  
  // Initialize Leaflet icons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Fix default icons
    fixLeafletIcons();
    
    // Create custom icons for different marker types
    userLocationIcon.current = createCustomIcon(
      'https://cdn-icons-png.flaticon.com/512/7893/7893590.png',
      [36, 36]
    );
    
    petrolStationIcon.current = createCustomIcon(
      'https://cdn-icons-png.flaticon.com/512/3097/3097988.png',
      [30, 30]
    );
    
    autoPartsIcon.current = createCustomIcon(
      'https://cdn-icons-png.flaticon.com/512/2554/2554936.png',
      [30, 30]
    );
    
    // Mark icons as loaded
    setIconsLoaded(true);
  }, []);
  
  // Format price level to dollar signs
  const formatPriceLevel = (level?: number) => {
    if (level === undefined) return "Price N/A";
    return "$".repeat(level) || "Free";
  };
  
  // Determine the icon for a place based on its type
  const getIconForPlace = (place: NearbyPlace) => {
    // If icons aren't loaded yet or we're on server, return undefined (let Leaflet use its default)
    if (!iconsLoaded || typeof window === 'undefined') return undefined;
    
    try {
      if (place.placeType === "petrol_station") {
        return petrolStationIcon.current || defaultPlaceIcon || undefined;
      } else if (place.placeType === "auto_parts_store") {
        return autoPartsIcon.current || defaultPlaceIcon || undefined;
      }
      return defaultPlaceIcon || undefined;
    } catch (error) {
      console.error("Error getting place icon:", error);
      return undefined;
    }
  };
  
  // Use a fallback or default icon if custom icons aren't available
  const getUserIcon = () => {
    // If icons aren't loaded yet or we're on server, return undefined (let Leaflet use its default)
    if (!iconsLoaded || typeof window === 'undefined') return undefined;
    
    try {
      return userLocationIcon.current || defaultUserIcon || undefined;
    } catch (error) {
      console.error("Error getting user icon:", error);
      return undefined;
    }
  };
  
  return (
    <MapContainer
      center={[currentLocation.latitude, currentLocation.longitude]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false} // We'll add this manually in a better position
      className="z-0 rounded-lg shadow-inner"
    >
      {/* Controller for map updates */}
      <MapController currentLocation={currentLocation} selectedPlace={selectedPlace} />
      
      {/* Premium-looking tile layer (Stadia Maps) */}
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
      />
      
      {/* Current Location Marker */}
      <Marker 
        position={[currentLocation.latitude, currentLocation.longitude]}
        icon={getUserIcon()}
      >
        <Popup className="custom-popup">
          <div className="text-center">
            <h3 className="font-bold text-primary">Your Location</h3>
            <p className="text-xs text-gray-600">Current position</p>
          </div>
        </Popup>
      </Marker>
      
      {/* Nearby Places Markers */}
      {nearbyPlaces.map((place) => (
        <Marker 
          key={place.id}
          position={[place.location.latitude, place.location.longitude]}
          icon={getIconForPlace(place)}
          eventHandlers={{
            click: () => {
              setSelectedPlace(place);
            }
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-sm text-primary">{place.name}</h3>
              <p className="text-xs text-gray-600">{place.address}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs">Rating: <b>{place.rating.toFixed(1)}</b></span>
                <span className="text-xs font-medium">{formatPriceLevel(place.priceLevel)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs"><b>{place.distance.toFixed(1)} km</b> away</span>
                <span className="text-xs"><b>{place.estimatedTimeToReach} min</b> drive</span>
              </div>
              <button 
                className="w-full mt-2 text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  getDirections(place);
                }}
              >
                Navigate Now
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Direction Path with improved style */}
      {directions && selectedPlace && (
        <>
          {/* Outer glow effect with wider line underneath */}
          <Polyline 
            positions={[
              [currentLocation.latitude, currentLocation.longitude],
              [selectedPlace.location.latitude, selectedPlace.location.longitude]
            ]}
            color="#8b5cf6"
            weight={8}
            opacity={0.3}
            lineCap="round"
          />
          {/* Main line */}
          <Polyline 
            positions={[
              [currentLocation.latitude, currentLocation.longitude],
              [selectedPlace.location.latitude, selectedPlace.location.longitude]
            ]}
            color="#6d28d9"
            weight={4}
            opacity={0.8}
            lineCap="round"
            dashArray="10,10"
          />
        </>
      )}
    </MapContainer>
  );
};

export default MapComponent; 