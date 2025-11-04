"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lock, MapPin, Shield } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Lock className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-foreground">Smart Bike Lock</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional IoT bike security system with real-time GPS tracking and motion detection
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card/50 border border-border/30 rounded-lg p-6 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Live Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Real-time GPS location tracking with OpenStreetMap
            </p>
          </div>
          
          <div className="bg-card/50 border border-border/30 rounded-lg p-6 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Motion Detection</h3>
            <p className="text-sm text-muted-foreground">
              Instant alerts when unauthorized movement is detected
            </p>
          </div>
          
          <div className="bg-card/50 border border-border/30 rounded-lg p-6 backdrop-blur-sm">
            <Lock className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Secure Lock</h3>
            <p className="text-sm text-muted-foreground">
              Remote lock/unlock with encrypted communication
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Button>
          <Button
            onClick={() => router.push("/signup")}
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}
