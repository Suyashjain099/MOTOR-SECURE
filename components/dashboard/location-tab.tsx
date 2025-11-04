"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"

// Import Map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg bg-muted/20 flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
})

interface LocationData {
  device_id: string
  motion_triggered: boolean
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
}

export default function LocationTab() {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Fetch initial location data
    fetchLocationData()

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchLocationData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchLocationData = async () => {
    try {
      const response = await fetch("/api/devices")
      if (response.ok) {
        const data = await response.json()
        if (data.devices && data.devices.length > 0) {
          // Find the device with the most recent lastSeen timestamp
          const device = data.devices.reduce((latest: any, current: any) => {
            if (!latest) return current
            const latestTime = new Date(latest.lastSeen || 0).getTime()
            const currentTime = new Date(current.lastSeen || 0).getTime()
            return currentTime > latestTime ? current : latest
          }, null)
          
          if (device && device.location && device.location.latitude && device.location.longitude) {
            console.log('📍 Location updated:', device.uniqueId, device.location)
            setLocationData({
              device_id: device.uniqueId,
              motion_triggered: false,
              timestamp: device.lastSeen || new Date().toISOString(),
              location: {
                latitude: device.location.latitude,
                longitude: device.location.longitude,
              },
            })
          } else {
            console.warn('⚠️ Device has no valid location data')
          }
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error)
    }
  }

  if (!locationData) {
    return (
      <Card className="bg-card/50 border-border/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            Live Bike Location
          </CardTitle>
          <CardDescription className="text-muted-foreground">Real-time location tracking via GPS</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No location data available. Device needs to send location data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapPin className="w-5 h-5 text-primary" />
          Live Bike Location
        </CardTitle>
        <CardDescription className="text-muted-foreground">Real-time location tracking via GPS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* OpenStreetMap */}
          {isClient && locationData && (
            <MapComponent
              latitude={locationData.location.latitude}
              longitude={locationData.location.longitude}
              deviceId={locationData.device_id}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Device ID</p>
              <p className="font-mono text-sm text-primary font-semibold">{locationData.device_id}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Last Update</p>
              <p className="text-sm text-foreground font-semibold">
                {new Date(locationData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Coordinates</p>
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-sm text-foreground">
                <span className="text-muted-foreground">Lat:</span> {locationData.location.latitude.toFixed(6)}°
              </p>
              <p className="font-mono text-sm text-foreground">
                <span className="text-muted-foreground">Lng:</span> {locationData.location.longitude.toFixed(6)}°
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
