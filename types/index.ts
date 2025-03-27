// Common types
export type ProbabilityScore = number // 0-100%
export type TimeEstimate = number // in hours
export type DistanceEstimate = number // in kilometers

// Tire Burst Prediction Model Types
export interface TireMaterialProperties {
  hardness: number // Shore A scale
  compoundType: string
  thermalConductivity: number
  heatCapacity: number
}

export interface TireTemperatureData {
  internal: number // in Celsius
  external: number // in Celsius
  timestamp: number
}

export interface SpeedDurationMatrix {
  speed: number // in km/h
  duration: number // in minutes
  timestamp: number
}

export interface LoadDistribution {
  frontLeft: number // in kg
  frontRight: number
  rearLeft: number
  rearRight: number
  timestamp: number
}

export interface AirPressureData {
  pressure: number // in kPa
  decayRate: number // in kPa/hour
  timestamp: number
}

export interface ProximityHeatSource {
  source: "engine" | "emissions" | "exhaust"
  temperature: number // in Celsius
  distance: number // in cm
  timestamp: number
}

export interface RoadSurfaceData {
  temperature: number // in Celsius
  roughness: number // scale 0-10
  timestamp: number
}

export interface TireBurstPredictionInput {
  materialProperties: TireMaterialProperties
  temperatureData: TireTemperatureData[]
  speedDurationMatrix: SpeedDurationMatrix[]
  loadDistribution: LoadDistribution[]
  airPressureData: AirPressureData[]
  proximityHeatSources: ProximityHeatSource[]
  roadSurfaceData: RoadSurfaceData[]
}

export interface TireBurstPredictionOutput {
  burstProbability: ProbabilityScore
  criticalTemperatureThreshold: number
  safeOperatingEnvelope: {
    maxSpeed: number
    maxLoad: number
    maxTemperature: number
    maxDuration: number
  }
  maintenanceAlerts: {
    level70: boolean
    level85: boolean
    level95: boolean
  }
}

// Engine Failure Prediction Model Types
export interface MetalFatigueData {
  vibrationSignature: number[]
  frequency: number
  amplitude: number
  timestamp: number
}

export interface OilDegradationData {
  viscosity: number
  contamination: number // parts per million
  acidityLevel: number // pH scale
  timestamp: number
}

export interface ThermalStressData {
  coldStartCount: number
  operatingTemperature: number
  thermalCycleCount: number
  timestamp: number
}

export interface CombustionEfficiencyData {
  fuelConsumption: number // liters per 100km
  exhaustGasTemperature: number
  oxygenSensorReading: number
  timestamp: number
}

export interface BearingWearData {
  acousticProfile: number[]
  frequency: number
  amplitude: number
  timestamp: number
}

export interface EngineFailurePredictionInput {
  metalFatigueData: MetalFatigueData[]
  oilDegradationData: OilDegradationData[]
  thermalStressData: ThermalStressData[]
  combustionEfficiencyData: CombustionEfficiencyData[]
  bearingWearData: BearingWearData[]
}

export interface EngineFailurePredictionOutput {
  remainingUsefulLife: {
    hours: TimeEstimate
    kilometers: DistanceEstimate
  }
  failureProbabilityHeatmap: Record<string, ProbabilityScore> // component -> probability
  maintenancePriorities: Array<{
    component: string
    priority: number // 1-10 scale
    recommendedAction: string
  }>
  sparePartsConsumptionForecast: Array<{
    part: string
    quantity: number
    estimatedReplacementDate: Date
  }>
}

// System Integration Types
export interface TelemetryData {
  vehicleId: string
  timestamp: number
  tireData: TireBurstPredictionInput
  engineData: EngineFailurePredictionInput
}

export interface AlertConfig {
  visual: boolean
  audio: boolean
  haptic: boolean
  threshold: number // 0-100%
}

export interface SystemIntegrationConfig {
  telemetryLatencyThreshold: number // in ms
  alertConfig: AlertConfig
  adaptiveLearningEnabled: boolean
  oem: {
    protocol: string
    version: string
    endpoint: string
  }
}

// Google Maps Integration Types
export interface LocationCoordinates {
  latitude: number
  longitude: number
}

export interface NearbyPlace {
  id: string
  name: string
  placeType: MapViewOptions["placeType"]
  location: LocationCoordinates
  address: string
  rating: number // 0-5 scale
  priceLevel?: number // 0-4 scale
  distance: number // in kilometers
  estimatedTimeToReach: number // in minutes
  open: boolean
}

export interface NavigationRoute {
  distance: number // in kilometers
  duration: number // in minutes
  startLocation: LocationCoordinates
  endLocation: LocationCoordinates
  steps: Array<{
    instruction: string
    distance: number // in kilometers
    duration: number // in minutes
  }>
}

export interface MapViewOptions {
  zoom: number 
  radius: number // in kilometers
  placeType: "petrol_station" | "auto_parts_store" | "car_repair" | "car_dealer"
  sortBy: "distance" | "rating" | "price"
  filterByOpen: boolean
}

// AI Chatbot Types
export interface ChatbotIntent {
  type: "find_location" | "set_radius" | "navigation" | "maintenance_info" | "general_query"
  confidence: number // 0-1 scale
}

export interface ChatbotEntity {
  type: "location_type" | "distance" | "time" | "part_name" | "service_type"
  value: string | number
  confidence: number // 0-1 scale
}

export interface ChatbotQuery {
  text: string
  intent: ChatbotIntent
  entities: ChatbotEntity[]
  timestamp: number
}

export interface ChatbotResponse {
  text: string
  suggestedActions?: string[]
  mapViewUpdate?: MapViewOptions
  navigationStart?: boolean
  timestamp: number
}

