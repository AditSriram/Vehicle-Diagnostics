"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChatbotIntent, ChatbotEntity, ChatbotQuery, ChatbotResponse, MapViewOptions } from "@/types"
import { Send, Bot as BotIcon, MapPin, User, Sparkles, Fuel, Wrench, Info } from "lucide-react"
import nlp from "compromise"

interface AIChatbotProps {
  onUpdateMapView?: (options: Partial<MapViewOptions>) => void
  onStartNavigation?: (placeType: MapViewOptions["placeType"], radius: number) => void
}

export const AIChatbot = ({ onUpdateMapView, onStartNavigation }: AIChatbotProps) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: number }>>([
    {
      text: "Hi there! I'm your AI navigation assistant. I can help you find nearby petrol pumps or auto parts stores. How can I assist you today?",
      isUser: false,
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Process user query with NLP
  const processQuery = (text: string): ChatbotQuery => {
    const doc = nlp(text)
    
    // Determine intent
    let intent: ChatbotIntent = {
      type: "general_query",
      confidence: 0.5,
    }

    if (doc.has("find") || doc.has("show") || doc.has("where") || doc.has("nearby") || doc.has("close") || doc.has("locate")) {
      intent = {
        type: "find_location",
        confidence: 0.8,
      }
    } else if (doc.has("set") || doc.has("within") || doc.has("distance") || doc.has("km") || doc.has("kilometer") || doc.has("range")) {
      intent = {
        type: "set_radius",
        confidence: 0.8,
      }
    } else if (doc.has("navigate") || doc.has("directions") || doc.has("go to") || doc.has("route") || doc.has("take me")) {
      intent = {
        type: "navigation",
        confidence: 0.8,
      }
    }

    // Extract entities
    const entities: ChatbotEntity[] = []

    // Location type entity
    if (doc.has("petrol") || doc.has("gas") || doc.has("fuel") || doc.has("pump")) {
      entities.push({
        type: "location_type",
        value: "petrol_station",
        confidence: 0.9,
      })
    } else if (doc.has("part") || doc.has("parts") || doc.has("store") || doc.has("shop") || doc.has("repair")) {
      entities.push({
        type: "location_type",
        value: "auto_parts_store",
        confidence: 0.9,
      })
    }

    // Distance entity
    const distances = doc.match("#Value (km|kilometer|kilometers)")
    if (distances.found) {
      const distanceText = distances.text()
      const distanceNum = parseInt(distanceText.match(/\d+/)?.[0] || "5", 10)
      entities.push({
        type: "distance",
        value: distanceNum,
        confidence: 0.9,
      })
    } else {
      // Try to find just numbers that might refer to distance
      const numMatch = text.match(/\b(\d+)\b/)
      if (numMatch) {
        entities.push({
          type: "distance",
          value: parseInt(numMatch[1], 10),
          confidence: 0.7,
        })
      }
    }

    return {
      text,
      intent,
      entities,
      timestamp: Date.now(),
    }
  }

  // Generate response based on processed query
  const generateResponse = (query: ChatbotQuery): ChatbotResponse => {
    let responseText = ""
    let mapViewUpdate: Partial<MapViewOptions> | undefined
    let navigationStart = false

    // Get location type from entities or default to petrol_station
    const locationTypeEntity = query.entities.find((e) => e.type === "location_type")
    const locationType = locationTypeEntity
      ? (locationTypeEntity.value as MapViewOptions["placeType"])
      : "petrol_station"

    // Get distance from entities or default to 5km
    const distanceEntity = query.entities.find((e) => e.type === "distance")
    const distance = distanceEntity ? (distanceEntity.value as number) : 5

    // Generate suggestions based on the query
    generateSuggestions(query);

    // Handle different intents
    switch (query.intent.type) {
      case "find_location":
        responseText = `I'll find ${
          locationType === "petrol_station" ? "petrol pumps" : "auto parts stores"
        } within ${distance} km of your location. I've updated the map to show these locations.`;
        mapViewUpdate = {
          placeType: locationType,
          radius: distance,
        }
        break

      case "set_radius":
        responseText = `I've updated the search radius to ${distance} km. You'll now see locations within this distance.`;
        mapViewUpdate = {
          radius: distance,
        }
        break

      case "navigation":
        responseText = `Starting navigation to the nearest ${
          locationType === "petrol_station" ? "petrol pump" : "auto parts store"
        } within ${distance} km. Turn-by-turn directions are now available.`;
        mapViewUpdate = {
          placeType: locationType,
          radius: distance,
        }
        navigationStart = true
        break

      default:
        // General query - provide a helpful response
        if (query.text.toLowerCase().includes("help") || query.text.toLowerCase().includes("what can you")) {
          responseText = `I can help you find nearby service locations and navigate to them. Try saying:
          • "Find petrol pumps within 10 km"
          • "Show me auto parts stores nearby" 
          • "Navigate to the nearest gas station"
          • "Set search radius to 15 km"`;
        } else if (query.text.toLowerCase().includes("thank") || query.text.toLowerCase().includes("thanks")) {
          responseText = "You're welcome! Is there anything else I can help you with?";
        } else {
          responseText = `I can help you find nearby petrol pumps or auto parts stores. Try asking something like "Find petrol pumps within 10 km" or "Show me auto parts stores nearby".`;
        }
    }

    return {
      text: responseText,
      mapViewUpdate,
      navigationStart,
      timestamp: Date.now(),
    }
  }

  // Generate context-aware suggestions
  const generateSuggestions = (query: ChatbotQuery) => {
    const suggestions: string[] = [];
    
    // Get location type from entities or provide both options
    const locationTypeEntity = query.entities.find((e) => e.type === "location_type");
    const locationType = locationTypeEntity?.value as MapViewOptions["placeType"] | undefined;
    
    // Get distance entity
    const distanceEntity = query.entities.find((e) => e.type === "distance");
    const distance = distanceEntity ? (distanceEntity.value as number) : 5;
    
    if (query.intent.type === "find_location" || query.intent.type === "general_query") {
      if (!locationType) {
        suggestions.push("Find petrol pumps nearby");
        suggestions.push("Show auto parts stores");
      } else if (locationType === "petrol_station") {
        suggestions.push(`Find auto parts stores within ${distance} km`);
        suggestions.push(`Navigate to nearest petrol pump`);
      } else {
        suggestions.push(`Find petrol pumps within ${distance} km`);
        suggestions.push(`Navigate to nearest auto parts store`);
      }
      
      if (!distanceEntity) {
        suggestions.push(`Set search radius to 10 km`);
      } else {
        suggestions.push(`Set search radius to ${distance + 5} km`);
      }
    } else if (query.intent.type === "set_radius") {
      suggestions.push(`Find petrol pumps within ${distance} km`);
      suggestions.push(`Show auto parts stores within ${distance} km`);
    } else if (query.intent.type === "navigation") {
      suggestions.push("Show more options");
      suggestions.push(locationType === "petrol_station" 
        ? "Show auto parts stores instead" 
        : "Show petrol pumps instead");
    }
    
    // Add some variation
    if (Math.random() > 0.7) {
      suggestions.push("What can you help me with?");
    }
    
    // Limit to 3 suggestions
    setSuggestions(suggestions.slice(0, 3));
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing) return

    // Add user message
    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)
    setSuggestions([])

    // Process the query
    const processedQuery = processQuery(inputValue)
    const response = generateResponse(processedQuery)

    // Apply any map view updates
    if (response.mapViewUpdate && onUpdateMapView) {
      onUpdateMapView(response.mapViewUpdate)
    }

    // Start navigation if requested
    if (response.navigationStart && onStartNavigation && response.mapViewUpdate) {
      onStartNavigation(
        response.mapViewUpdate.placeType || "petrol_station",
        response.mapViewUpdate.radius || 5
      )
    }

    // Add bot response after a short delay to simulate thinking
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: response.text,
          isUser: false,
          timestamp: Date.now(),
        },
      ])
      setIsProcessing(false)
    }, 700)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    // Submit the form programmatically
    const form = document.getElementById("chatForm") as HTMLFormElement
    if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
  }

  return (
    <Card className="flex flex-col h-[400px] shadow-lg border-primary/20">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <BotIcon className="h-5 w-5 text-primary" />
          <span>AI Navigation Assistant</span>
          <Sparkles className="h-4 w-4 text-amber-500 ml-1" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0 px-3 pt-3">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[85%] shadow-sm ${
                  message.isUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!message.isUser && <BotIcon className="h-4 w-4 mt-1 shrink-0 text-primary" />}
                  <div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  {message.isUser && <User className="h-4 w-4 mt-1 shrink-0" />}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-muted max-w-[75%] rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <BotIcon className="h-4 w-4 text-primary" />
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {/* Suggestions */}
      {suggestions.length > 0 && !isProcessing && (
        <div className="px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.includes("petrol") || suggestion.includes("gas") ? (
                  <Fuel className="h-3 w-3 mr-1 text-primary" />
                ) : suggestion.includes("parts") || suggestion.includes("store") ? (
                  <Wrench className="h-3 w-3 mr-1 text-primary" />
                ) : suggestion.includes("help") ? (
                  <Info className="h-3 w-3 mr-1 text-primary" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1 text-primary" />
                )}
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="border-t p-3 flex flex-col gap-3">
        <form id="chatForm" onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about nearby services..."
            className="flex-grow border-primary/20 focus-visible:ring-primary"
            onFocus={() => {
              // Generate initial suggestions when input is focused
              if (suggestions.length === 0 && messages.length < 3) {
                setSuggestions([
                  "Find petrol pumps nearby",
                  "Show auto parts stores",
                  "What can you help me with?"
                ]);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
} 