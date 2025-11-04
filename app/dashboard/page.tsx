"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import DashboardHeader from "@/components/dashboard/header"
import DashboardNav from "@/components/dashboard/nav"
import LocationTab from "@/components/dashboard/location-tab"
import SecurityTab from "@/components/dashboard/security-tab"
import NotificationHistory from "@/components/dashboard/notification-history"

interface Device {
  id: string
  name: string
  uniqueId: string
  addedDate: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"location" | "security">("location")
  const [user, setUser] = useState<any>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const lastMotionEventCount = useRef<Record<string, number>>({})
  const lastTheftAlertCheck = useRef<Record<string, boolean>>({})
  const audioRef = useRef<any>(null)
  const theftAudioRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('🎵 Audio context created')
      }
      
      // Always try to resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
        console.log('🎵 Audio context resumed')
      }
    }
    
    // Add click listener to initialize audio (required for autoplay policy)
    document.addEventListener('click', initAudioContext)
    document.addEventListener('keydown', initAudioContext)
    
    // Create alert sound function - continuous alarm for 5 seconds
    const createAlertSound = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        const ctx = audioContextRef.current
        
        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(e => console.log('Could not resume audio:', e))
        }
        
        // Create a fast, loud alarm pattern that plays for 5 seconds
        const totalDuration = 5 // 5 seconds total
        const beepDuration = 0.08 // Each beep is 80ms (faster!)
        const pauseDuration = 0.04 // 40ms pause between beeps (faster!)
        const patternLength = beepDuration + pauseDuration
        const beepCount = Math.floor(totalDuration / patternLength)
        
        console.log(`🔊 Playing ${beepCount} fast beeps over ${totalDuration} seconds`)
        
        for (let i = 0; i < beepCount; i++) {
          const startTime = ctx.currentTime + (i * patternLength)
          
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)
          
          // Alternating frequencies for more urgent alarm sound
          oscillator.frequency.value = i % 2 === 0 ? 1600 : 1200
          oscillator.type = 'square' // Square wave is louder
          
          // Maximum safe volume
          gainNode.gain.setValueAtTime(1.0, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration)
          
          oscillator.start(startTime)
          oscillator.stop(startTime + beepDuration)
        }
        
        console.log(`🔊 Alert sound scheduled! Context state:`, ctx.state)
      } catch (error) {
        console.error('Audio error:', error)
      }
    }
    
    audioRef.current = { play: createAlertSound }
    
    // Create THEFT alert sound - more intense 10-second alarm
    const createTheftAlertSound = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        const ctx = audioContextRef.current
        
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(e => console.log('Could not resume audio:', e))
        }
        
        // Create an intense 10-second alarm for THEFT
        const totalDuration = 10 // 10 seconds for theft alert
        const beepDuration = 0.1 // 100ms beeps
        const pauseDuration = 0.05 // 50ms pause
        const patternLength = beepDuration + pauseDuration
        const beepCount = Math.floor(totalDuration / patternLength)
        
        console.log(`🚨🚨🚨 PLAYING THEFT ALERT: ${beepCount} intense beeps over ${totalDuration} seconds`)
        
        for (let i = 0; i < beepCount; i++) {
          const startTime = ctx.currentTime + (i * patternLength)
          
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)
          
          // Very high pitched alternating frequencies for urgent alarm
          oscillator.frequency.value = i % 2 === 0 ? 2000 : 1800
          oscillator.type = 'square'
          
          // Maximum volume
          gainNode.gain.setValueAtTime(1.0, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration)
          
          oscillator.start(startTime)
          oscillator.stop(startTime + beepDuration)
        }
        
        console.log(`🚨 THEFT ALERT SOUND ACTIVATED!`)
      } catch (error) {
        console.error('Theft audio error:', error)
      }
    }
    
    theftAudioRef.current = { play: createTheftAlertSound }
    
    const fetchUserAndDevices = async () => {
      try {
        // First, try to get user from API
        const userResponse = await fetch("/api/auth/me")
        if (!userResponse.ok) {
          router.push("/login")
          return
        }
        const userData = await userResponse.json()
        setUser(userData.user)
        sessionStorage.setItem("user", JSON.stringify(userData.user))

        // Then fetch devices
        const devicesResponse = await fetch("/api/devices")
        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json()
          setDevices(devicesData.devices)
          
          // Check for motion events
          checkForMotionAlerts(devicesData.devices)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndDevices()
    
    // Poll for device updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const devicesResponse = await fetch("/api/devices")
        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json()
          setDevices(devicesData.devices)
          checkForMotionAlerts(devicesData.devices)
        }
      } catch (error) {
        console.error("Error polling devices:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const checkForMotionAlerts = (devices: any[]) => {
    console.log('🔍 Checking for motion alerts...', devices.length, 'devices')
    
    devices.forEach((device) => {
      console.log(`Device ${device.uniqueId}: status=${device.status}, motionEvents=${device.motionEvents?.length || 0}`)
      
      // CHECK FOR THEFT ALERT FIRST (higher priority)
      if (device.theftDetection && device.theftDetection.isActive && device.theftDetection.theftAlerted) {
        const deviceId = device.uniqueId
        
        // Check if we've already shown this theft alert
        if (!lastTheftAlertCheck.current[deviceId]) {
          console.log('🚨🚨🚨 THEFT ALERT DETECTED!')
          
          const distance = device.theftDetection.maxDistance || 0
          
          // Show critical theft alert
          toast.error("🚨 THEFT ALERT - BIKE IS BEING STOLEN!", {
            description: `${device.name} has moved ${distance.toFixed(0)} meters from its locked position!`,
            duration: 20000, // Show for 20 seconds
          })
          
          // Play intense 10-second theft alarm
          if (theftAudioRef.current && theftAudioRef.current.play) {
            console.log('Playing 10-second THEFT ALARM...')
            theftAudioRef.current.play()
          }
          
          // Mark as alerted
          lastTheftAlertCheck.current[deviceId] = true
        }
        
        return // Skip normal motion check if theft detected
      }
      
      // Reset theft alert flag when device is unlocked
      if (device.status !== 'locked' && lastTheftAlertCheck.current[device.uniqueId]) {
        lastTheftAlertCheck.current[device.uniqueId] = false
      }
      
      // NORMAL MOTION DETECTION (only if bike is locked)
      if (device.status === 'locked' && device.motionEvents && device.motionEvents.length > 0) {
        const motionEventCount = device.motionEvents.length
        const deviceId = device.uniqueId
        
        console.log(`Device ${deviceId} - Current: ${motionEventCount}, Last: ${lastMotionEventCount.current[deviceId]}`)
        
        // Initialize tracking for this device if not exists
        if (lastMotionEventCount.current[deviceId] === undefined) {
          console.log(`Initializing tracking for ${deviceId}`)
          lastMotionEventCount.current[deviceId] = motionEventCount
          return // Don't trigger on first load
        }
        
        // Check if there's a new motion event for this specific device
        if (motionEventCount > lastMotionEventCount.current[deviceId]) {
          const latestEvent = device.motionEvents[motionEventCount - 1]
          
          console.log('🚨 NEW MOTION DETECTED! Triggering alert...')
          
          // Format timestamp for display
          const eventTime = new Date(latestEvent.timestamp)
          const timeStr = eventTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
          
          // Show toast notification
          toast.error("⚠️ Motion Detected - Bike Not Safe!", {
            description: `Unauthorized movement detected on ${device.name} at ${timeStr}`,
            duration: 10000,
          })
          
          console.log('Toast notification triggered')
          
          // Play alert sound (5-second continuous alarm)
          if (audioRef.current && audioRef.current.play) {
            console.log('Playing 5-second alarm...')
            audioRef.current.play()
          } else {
            console.error('Audio ref not available')
          }
          
          lastMotionEventCount.current[deviceId] = motionEventCount
        } else {
          console.log(`No new motion for ${deviceId}`)
        }
      }
      
      // Reset counter when bike is unlocked
      if (device.status !== 'locked' && lastMotionEventCount.current[device.uniqueId] !== undefined) {
        console.log(`Device ${device.uniqueId} unlocked, resetting counter`)
        lastMotionEventCount.current[device.uniqueId] = device.motionEvents ? device.motionEvents.length : 0
      }
    })
  }

  const handleAddDevice = async (device: Device) => {
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: device.name,
          uniqueId: device.uniqueId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDevices([...devices, data.device])
      } else {
        const error = await response.json()
        alert(error.message || "Failed to add device")
      }
    } catch (error) {
      console.error("Error adding device:", error)
      alert("Failed to add device")
    }
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader user={user} />
      <div className="flex gap-6 max-w-7xl mx-auto p-6">
        <div className="flex-1 space-y-6">
          <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} onAddDevice={handleAddDevice} />
          {activeTab === "location" && <LocationTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
        <div className="w-80 space-y-6">
          <NotificationHistory />
          {devices.length > 0 && (
            <div className="bg-card/30 border border-border/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Your Devices</h3>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div key={device.id} className="bg-background/20 rounded p-2 text-sm">
                    <p className="text-foreground font-medium">{device.name}</p>
                    <p className="text-muted-foreground text-xs">ID: {device.uniqueId}</p>
                    <p className="text-muted-foreground text-xs">Added: {device.addedDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
