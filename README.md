# Vehicle Predictive Maintenance System

A next-generation dashboard for vehicle predictive maintenance that helps predict and prevent vehicle failures before they occur.

## Features

### Core Analytics
- Tire burst prediction based on operating conditions
- Engine failure prediction with component-level analysis
- Safe operating envelope visualization
- Component failure heatmap
- Maintenance timeline forecasting

### Navigation Services
- **Google Maps Integration for Nearby Services**
  - Real-time location-based search for petrol pumps and auto parts stores
  - Interactive map showing top-rated service locations within a user-defined radius
  - Turn-by-turn navigation instructions to selected locations
  - Detailed information about each location including ratings, distance, and opening status

- **AI Chatbot for Natural Language Navigation**
  - Natural language processing for interpreting location queries
  - Set search parameters through conversational interface
  - Quick-access buttons for common requests
  - Context-aware responses that trigger map updates

### Simulation
- Tire performance simulation under various conditions

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vehicle-predictive-maintenance.git
cd vehicle-predictive-maintenance
```

2. Install dependencies
```bash
pnpm install
```

3. Set up your Google Maps API key
- Create a `.env.local` file in the root directory
- Add your Google Maps API key:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```
- You can get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)

4. Run the development server
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Frontend**: Next.js with React 19
- **Styling**: Tailwind CSS
- **Maps**: Google Maps API (Places API, Directions API)
- **NLP**: Compromise.js for natural language processing
- **Charts and Visualization**: Recharts

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
  - `/dashboard` - Dashboard components for maintenance prediction
  - `/maps` - Map integration components
  - `/simulation` - Simulation components
  - `/ui` - Reusable UI components
- `/types` - TypeScript type definitions
- `/styles` - CSS styles
- `/public` - Static assets

## Configuration

### Google Maps API

For the Google Maps integration to work properly, you need to enable the following APIs in your Google Cloud Console:

- Maps JavaScript API
- Places API
- Directions API
- Geocoding API

## License

This project is licensed under the MIT License - see the LICENSE file for details. 