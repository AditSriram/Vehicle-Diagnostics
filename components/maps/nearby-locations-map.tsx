"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { LocationCoordinates, NearbyPlace, NavigationRoute, MapViewOptions } from "@/types"
import { MapPin, Navigation, Fuel, Wrench, Star, Clock, AlertCircle, Info, Zap, ArrowRight, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AIChatbot } from "./ai-chatbot"
import { fetchNearbyPlaces } from "@/services/google-maps-service"

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "450px", // Increased height for better visualization
}

// Default center (can be updated with user's location)
const defaultCenter = {
  lat: 51.5074,
  lng: -0.1278,
}

// Dynamic import of the Map Component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
      <div className="text-center p-4 animate-pulse">
        <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading interactive map...</p>
        <p className="text-xs text-gray-500 mt-1">Please wait while we prepare your navigation view</p>
      </div>
    </div>
  )
})

export const NearbyLocationsMap = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null)
  const [directions, setDirections] = useState<NavigationRoute | null>(null)
  const [placeType, setPlaceType] = useState<MapViewOptions["placeType"]>("petrol_station")
  const [radius, setRadius] = useState<number>(5) // 5 km default radius
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const [placesError, setPlacesError] = useState<string | null>(null)

  // Get current location
  useEffect(() => {
    setIsLoadingLocation(true)
    setLocationError(null)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error.message || "Permission denied or location unavailable")
          // Set default location when geolocation fails
          setCurrentLocation({
            latitude: defaultCenter.lat,
            longitude: defaultCenter.lng,
          })
          setIsLoadingLocation(false)
          
          // Set appropriate error message based on the error code
          switch(error.code) {
            case 1:
              setLocationError("Location access was denied. Using default location instead.")
              break;
            case 2:
              setLocationError("Your location is currently unavailable. Using default location instead.")
              break;
            case 3:
              setLocationError("Location request timed out. Using default location instead.")
              break;
            default:
              setLocationError("Could not access your precise location. Using default location instead.")
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      )
    } else {
      setCurrentLocation({
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
      })
      setIsLoadingLocation(false)
      setLocationError("Geolocation is not supported by your browser. Using default location.")
    }
  }, [])

  // Fetch places from Google Maps API
  useEffect(() => {
    const getPlaces = async () => {
      if (!currentLocation) return;
      
      setIsLoadingPlaces(true);
      setPlacesError(null);
      
      try {
        // Fetch places from Google Maps API
        const places = await fetchNearbyPlaces(currentLocation, placeType, radius);
        
        if (places.length === 0) {
          setPlacesError(`No ${placeType === "petrol_station" ? "petrol pumps" : "auto parts stores"} found within ${radius} km.`);
        } else {
          setPlacesError(null);
        }
        
        setNearbyPlaces(places);
      } catch (error) {
        console.error("Error fetching places:", error);
        setPlacesError("Failed to fetch places. Please try again later.");
      } finally {
        setIsLoadingPlaces(false);
      }
    };
    
    getPlaces();
  }, [currentLocation, placeType, radius]);

  // Force refresh places data
  const refreshPlaces = () => {
    if (currentLocation) {
      // Clear existing places first
      setNearbyPlaces([]);
      
      // Re-fetch places
      setIsLoadingPlaces(true);
      fetchNearbyPlaces(currentLocation, placeType, radius)
        .then((places) => {
          setNearbyPlaces(places);
          if (places.length === 0) {
            setPlacesError(`No ${placeType === "petrol_station" ? "petrol pumps" : "auto parts stores"} found within ${radius} km.`);
          } else {
            setPlacesError(null);
          }
        })
        .catch((error) => {
          console.error("Error refreshing places:", error);
          setPlacesError("Failed to refresh places. Please try again later.");
        })
        .finally(() => {
          setIsLoadingPlaces(false);
        });
    }
  };

  // Get directions to a place
  const handleGetDirections = (place: NearbyPlace) => {
    if (!currentLocation) return

    // Create mock directions
    const mockRoute: NavigationRoute = {
      distance: place.distance,
      duration: place.estimatedTimeToReach,
      startLocation: currentLocation,
      endLocation: place.location,
      steps: [
        {
          instruction: "Head east on Main St",
          distance: place.distance * 0.3,
          duration: place.estimatedTimeToReach * 0.3,
        },
        {
          instruction: "Turn right onto Highway Rd",
          distance: place.distance * 0.5,
          duration: place.estimatedTimeToReach * 0.5,
        },
        {
          instruction: `Arrive at ${place.name}`,
          distance: place.distance * 0.2,
          duration: place.estimatedTimeToReach * 0.2,
        },
      ],
    }

    setDirections(mockRoute)
    setSelectedPlace(place)
  }

  // Clear directions
  const clearDirections = () => {
    setDirections(null)
    setSelectedPlace(null)
  }

  // Format price level to dollar signs
  const formatPriceLevel = (level?: number) => {
    if (level === undefined) return "Price N/A"
    return "$".repeat(level) || "Free"
  }

  // Format rating to stars
  const formatRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {rating.toFixed(1)}
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />
      </div>
    )
  }
  
  // Handle chatbot map view update
  const handleMapViewUpdate = (options: Partial<MapViewOptions>) => {
    if (options.placeType) setPlaceType(options.placeType)
    if (options.radius) setRadius(options.radius)
  }
  
  // Handle chatbot navigation request
  const handleStartNavigation = (placeType: MapViewOptions["placeType"], radius: number) => {
    setPlaceType(placeType)
    setRadius(radius)
    
    // Set a small timeout to ensure the nearbyPlaces have been updated
    setTimeout(() => {
      if (nearbyPlaces.length > 0) {
        handleGetDirections(nearbyPlaces[0]) // Navigate to closest place
      }
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main dashboard card */}
        <Card className="md:col-span-2 border-primary/10 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Service Locations
            </CardTitle>
            <CardDescription className="text-sm">
              Find the nearest petrol pumps and auto parts stores for your vehicle maintenance needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-0">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-1/2">
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <RadioGroup
                    defaultValue={placeType}
                    onValueChange={(value) => setPlaceType(value as MapViewOptions["placeType"])}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="petrol_station" id="petrol" />
                      <Label htmlFor="petrol" className="flex items-center">
                        <Fuel className="h-4 w-4 mr-1 text-primary" />
                        Petrol Pumps
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="auto_parts_store" id="parts" />
                      <Label htmlFor="parts" className="flex items-center">
                        <Wrench className="h-4 w-4 mr-1 text-primary" />
                        Auto Parts
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Search Radius: {radius} km</Label>
                  </div>
                  <Slider
                    defaultValue={[radius]} 
                    max={20}
                    min={1}
                    step={1}
                    onValueChange={(value) => setRadius(value[0])}
                    className="py-2"
                  />
                </div>
              </div>
            </div>

            <div className="md:flex gap-6">
              <div className="w-full md:w-2/3">
                <div style={mapContainerStyle} className="rounded-lg border overflow-hidden shadow-inner relative">
                  {locationError && (
                    <div className="absolute top-2 right-2 left-2 bg-yellow-100 border border-yellow-300 rounded-md p-2 z-10 shadow-md">
                      <div className="flex gap-2 items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-700 shrink-0" />
                        <p className="text-xs text-yellow-800">{locationError}</p>
                      </div>
                    </div>
                  )}
                  {placesError && (
                    <div className="absolute top-2 right-2 left-2 bg-blue-50 border border-blue-200 rounded-md p-2 z-10 shadow-md mt-14">
                      <div className="flex gap-2 items-center">
                        <Info className="h-4 w-4 text-blue-700 shrink-0" />
                        <p className="text-xs text-blue-800">{placesError}</p>
                      </div>
                    </div>
                  )}
                  {currentLocation && (
                    <MapComponent 
                      currentLocation={currentLocation} 
                      nearbyPlaces={nearbyPlaces} 
                      selectedPlace={selectedPlace}
                      setSelectedPlace={setSelectedPlace}
                      directions={directions}
                      getDirections={handleGetDirections}
                    />
                  )}
                  {isLoadingPlaces && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg animate-pulse flex flex-col items-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium">Loading places...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center px-1">
                  <div className="text-xs text-gray-500">
                    Powered by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenStreetMap</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      onClick={refreshPlaces}
                      disabled={isLoadingPlaces || !currentLocation}
                    >
                      <RefreshCw className={cn("h-3 w-3 mr-1", isLoadingPlaces && "animate-spin")} />
                      Refresh
                    </Button>
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      <Info className="h-3 w-3 mr-1" />
                      Mock Data
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/3 mt-4 md:mt-0">
                <Card className="border-primary/10 shadow-sm bg-card">
                  <CardHeader className="py-3 px-4 border-b bg-muted/40">
                    <CardTitle className="text-sm flex justify-between items-center">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 text-primary mr-1" />
                        Nearby Locations
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {nearbyPlaces.length} found
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                      {isLoadingPlaces && (
                        <div className="flex justify-center items-center py-8">
                          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                        </div>
                      )}
                      {!isLoadingPlaces && nearbyPlaces.length > 0 ? (
                        <div className="divide-y">
                          {nearbyPlaces.map((place) => (
                            <div
                              key={place.id}
                              className={cn(
                                "p-3 cursor-pointer transition-colors",
                                selectedPlace?.id === place.id
                                  ? "border-l-4 border-l-primary bg-primary/5"
                                  : "border-l-4 border-l-transparent hover:bg-gray-50"
                              )}
                              onClick={() => setSelectedPlace(place)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-sm">{place.name}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{place.address}</p>
                                </div>
                                {formatRating(place.rating)}
                              </div>
                              <div className="flex justify-between mt-2 text-xs">
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1 text-primary" />
                                  {place.distance.toFixed(1)} km
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1 text-primary" />
                                  {place.estimatedTimeToReach} min
                                </div>
                                <div>
                                  {place.open ? (
                                    <span className="text-green-600 font-medium">Open</span>
                                  ) : (
                                    <span className="text-red-600 font-medium">Closed</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2 h-8 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleGetDirections(place)
                                }}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Navigate
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : !isLoadingPlaces ? (
                        <div className="text-center py-8 px-4">
                          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">
                            No {placeType === "petrol_station" ? "petrol pumps" : "auto parts stores"} found
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Try increasing the search radius or changing location type
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={refreshPlaces}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {directions && (
              <Card className="mt-4 border-primary/10 shadow-md bg-primary/5">
                <CardHeader className="py-3 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center">
                      <Navigation className="h-4 w-4 text-primary mr-2" />
                      Directions to {selectedPlace?.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm">
                      <Badge variant="secondary" className="font-normal">
                        {directions.distance.toFixed(1)} km
                      </Badge>
                      <span>•</span>
                      <Badge variant="secondary" className="font-normal">
                        {directions.duration} min
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  <ol className="space-y-3 pl-6 list-decimal marker:text-primary">
                    {directions.steps.map((step, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{step.instruction}</span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {step.distance.toFixed(1)} km • {Math.round(step.duration)} min
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
                <CardFooter className="flex justify-between pt-0 pb-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={clearDirections}
                  >
                    Close Directions
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs gap-1"
                  >
                    Start Navigation
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardContent>
        </Card>
        
        {/* AI Chatbot */}
        <div className="md:col-span-1">
          <AIChatbot
            onUpdateMapView={handleMapViewUpdate}
            onStartNavigation={handleStartNavigation}
          />
        </div>
      </div>
    </div>
  )
} 