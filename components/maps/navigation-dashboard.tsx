"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { NearbyLocationsMap } from "@/components/maps/nearby-locations-map"
import { MapPin, Navigation, AlertTriangle, Info, CheckCircle, Star, Award, Zap, Sparkles } from "lucide-react"

export const NavigationDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative bg-gradient-to-r from-primary/90 to-primary rounded-lg p-6 text-primary-foreground shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/map-pattern.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-7 w-7" />
            <h1 className="text-2xl font-bold">Vehicle Navigation & Service Locator</h1>
            <Badge variant="outline" className="ml-auto font-medium bg-white/10 text-white border-white/20">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Premium Feature
            </Badge>
          </div>
          <p className="text-lg text-primary-foreground/90 max-w-3xl">
            Find essential vehicle services with our advanced OpenStreetMap integration—free, private, and customizable navigation without API keys or usage limits.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              No Google Maps API Costs
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Privacy-Focused
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Open-Source Maps
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered Assistance
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Information alert */}
      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm font-medium">
          This demo uses simulated location data. In a production environment, it would connect to real mapping APIs.
        </AlertDescription>
      </Alert>

      {/* Main navigation tabs */}
      <Tabs defaultValue="nearby" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-2">
          <TabsTrigger value="nearby" className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>Nearby Services</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            <span>Feature Highlights</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nearby" className="space-y-4">
          <NearbyLocationsMap />
        </TabsContent>
        
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-primary/10">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Cost Savings Analysis
                </CardTitle>
                <CardDescription>
                  Financial benefits of using OpenStreetMap
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">Google Maps API Costs:</div>
                    <ul className="ml-5 space-y-1 text-sm list-disc">
                      <li>Dynamic Maps: $7 per 1,000 loads (after free tier)</li>
                      <li>Directions API: $5 per 1,000 requests</li>
                      <li>Places API: $17 per 1,000 requests</li>
                      <li>Requires billing account and API key management</li>
                    </ul>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium">OpenStreetMap Solution:</div>
                    <ul className="ml-5 space-y-1 text-sm list-disc text-green-700">
                      <li>Maps: $0 (completely free)</li>
                      <li>Routing: $0 with OSRM or GraphHopper</li>
                      <li>Places: $0 with Nominatim or Overpass API</li>
                      <li>No API keys or billing accounts required</li>
                    </ul>
                  </div>
                  <div className="rounded-md bg-green-50 p-3 border border-green-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Estimated Annual Savings:</span>
                    </div>
                    <p className="mt-1 text-green-700">$10,000 - $50,000 depending on usage volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-primary/10">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Key Features & Benefits
                </CardTitle>
                <CardDescription>
                  Advantages of our implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <h3 className="font-medium flex items-center gap-1 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        No Usage Limits
                      </h3>
                      <p className="text-sm mt-1">Unlimited map views, searches, and routes with no throttling</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <h3 className="font-medium flex items-center gap-1 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Complete Privacy
                      </h3>
                      <p className="text-sm mt-1">No tracking or sending of user data to third-party services</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <h3 className="font-medium flex items-center gap-1 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Customizable UI
                      </h3>
                      <p className="text-sm mt-1">Fully branded experience with custom markers and route styling</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <h3 className="font-medium flex items-center gap-1 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        Offline Capabilities
                      </h3>
                      <p className="text-sm mt-1">Option to cache map tiles for limited offline functionality</p>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-primary/5 p-3 border border-primary/10">
                    <h3 className="font-medium flex items-center gap-1">
                      <Zap className="h-4 w-4 text-primary" />
                      AI Assistant Integration
                    </h3>
                    <p className="text-sm mt-1">
                      Natural language interface allows users to find services through conversation. The AI can interpret requests, set search parameters, and navigate to destinations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md border-primary/10">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle>Implementation Timeline</CardTitle>
              <CardDescription>
                From Google Maps to OpenStreetMap migration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  <div className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      1
                    </div>
                    <h3 className="font-medium text-lg">Research & Design (1 week)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Evaluated OpenStreetMap options, selected Leaflet/React-Leaflet, and designed component structure
                    </p>
                  </div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      2
                    </div>
                    <h3 className="font-medium text-lg">Core Implementation (2 weeks)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Integrated map component, built location search and filtering, created custom UI for service locations
                    </p>
                  </div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      3
                    </div>
                    <h3 className="font-medium text-lg">AI Assistant Integration (1 week)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Added natural language processing capabilities and connected to map interface
                    </p>
                  </div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      ✓
                    </div>
                    <h3 className="font-medium text-lg">Testing & Deployment</h3>
                    <div className="flex gap-3 mt-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Estimated savings: $3,000/month
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 