export default function ApiDocs() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Tire Burst Prediction API</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">POST /api/predict/tire</h3>
            <p className="mb-4">Predicts tire burst probability based on input parameters.</p>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Request Body:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "materialProperties": {
    "hardness": 70,
    "compoundType": "synthetic_rubber",
    "thermalConductivity": 0.25,
    "heatCapacity": 1.8
  },
  "temperatureData": [
    { "internal": 65, "external": 45, "timestamp": 1647984000000 },
    ...
  ],
  "speedDurationMatrix": [
    { "speed": 100, "duration": 30, "timestamp": 1647984000000 },
    ...
  ],
  "loadDistribution": [
    { "frontLeft": 450, "frontRight": 430, "rearLeft": 480, "rearRight": 460, "timestamp": 1647984000000 },
    ...
  ],
  "airPressureData": [
    { "pressure": 220, "decayRate": 0.5, "timestamp": 1647984000000 },
    ...
  ],
  "proximityHeatSources": [
    { "source": "engine", "temperature": 90, "distance": 50, "timestamp": 1647984000000 },
    ...
  ],
  "roadSurfaceData": [
    { "temperature": 35, "roughness": 3, "timestamp": 1647984000000 },
    ...
  ]
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">Response:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "burstProbability": 65,
  "criticalTemperatureThreshold": 105,
  "safeOperatingEnvelope": {
    "maxSpeed": 90,
    "maxLoad": 800,
    "maxTemperature": 90,
    "maxDuration": 180
  },
  "maintenanceAlerts": {
    "level70": false,
    "level85": false,
    "level95": false
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Engine Failure Prediction API</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">POST /api/predict/engine</h3>
            <p className="mb-4">Predicts engine failure risk based on input parameters.</p>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Request Body:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "metalFatigueData": [
    { "vibrationSignature": [0.1, 0.2, 0.3, ...], "frequency": 120, "amplitude": 0.5, "timestamp": 1647984000000 },
    ...
  ],
  "oilDegradationData": [
    { "viscosity": 9.5, "contamination": 1200, "acidityLevel": 6.2, "timestamp": 1647984000000 },
    ...
  ],
  "thermalStressData": [
    { "coldStartCount": 350, "operatingTemperature": 95, "thermalCycleCount": 1200, "timestamp": 1647984000000 },
    ...
  ],
  "combustionEfficiencyData": [
    { "fuelConsumption": 8.5, "exhaustGasTemperature": 350, "oxygenSensorReading": 14.2, "timestamp": 1647984000000 },
    ...
  ],
  "bearingWearData": [
    { "acousticProfile": [0.1, 0.3, 0.5, ...], "frequency": 2500, "amplitude": 0.8, "timestamp": 1647984000000 },
    ...
  ]
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">Response:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "remainingUsefulLife": {
    "hours": 1250,
    "kilometers": 75000
  },
  "failureProbabilityHeatmap": {
    "crankshaft": 25,
    "pistons": 40,
    "valves": 55,
    "bearings": 70,
    "camshaft": 30,
    "oilSystem": 45,
    "coolingSystem": 35,
    "fuelSystem": 50
  },
  "maintenancePriorities": [
    {
      "component": "Bearings",
      "priority": 7,
      "recommendedAction": "Schedule bearing replacement within 1000 km"
    },
    ...
  ],
  "sparePartsConsumptionForecast": [
    {
      "part": "Rod Bearing Set",
      "quantity": 2,
      "estimatedReplacementDate": "2023-04-15T00:00:00.000Z"
    },
    ...
  ]
}`}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Telemetry API</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">POST /api/telemetry</h3>
            <p className="mb-4">Processes real-time telemetry data and returns predictions.</p>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Request Body:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "vehicleId": "VIN12345678901234",
  "timestamp": 1647984000000,
  "tireData": {
    // Tire burst prediction input data
    ...
  },
  "engineData": {
    // Engine failure prediction input data
    ...
  }
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">Response:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "processingTime": 150,
  "tirePrediction": {
    // Tire burst prediction output
    ...
  },
  "enginePrediction": {
    // Engine failure prediction output
    ...
  }
}`}
              </pre>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <h3 className="text-lg font-medium mb-2">GET /api/telemetry</h3>
            <p className="mb-4">Retrieves fleet-wide insights based on collected telemetry data.</p>

            <div>
              <h4 className="font-medium mb-1">Response:</h4>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`{
  "averageTireBurstProbability": 45.2,
  "averageEngineRemainingLife": 2350,
  "commonMaintenanceIssues": [
    "bearings (12 vehicles)",
    "valves (8 vehicles)",
    "fuelSystem (5 vehicles)"
  ],
  "vehicleCount": 25
}`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

