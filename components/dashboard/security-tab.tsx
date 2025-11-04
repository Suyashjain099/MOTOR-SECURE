"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface SecurityData {
  device_id: string
  motion_triggered: boolean
  timestamp: string
}

interface MotionEvent {
  triggered: boolean
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
}

interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  metadata?: {
    distanceMoved?: number
    initialLocation?: {
      latitude: number
      longitude: number
    }
  }
  read: boolean
  device: {
    name: string
    uniqueId: string
  }
}

export default function SecurityTab() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null)
  const [lockEnabled, setLockEnabled] = useState(false)
  const [motionEvents, setMotionEvents] = useState<MotionEvent[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch security data and notifications
    fetchSecurityData()
    fetchNotifications()

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchSecurityData()
      fetchNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch("/api/devices")
      if (response.ok) {
        const data = await response.json()
        if (data.devices && data.devices.length > 0) {
          // Find the device with the most recent update or lock001
          const device = data.devices.find((d: any) => d.uniqueId === 'lock001') || data.devices[0]
          
          console.log('🔐 Security Tab - Device:', device.uniqueId, 'Status:', device.status)
          
          // Set lock status from device
          setLockEnabled(device.status === 'locked')
          
          setSecurityData({
            device_id: device.uniqueId,
            motion_triggered: device.motionEvents && device.motionEvents.length > 0,
            timestamp: device.lastSeen || new Date().toISOString(),
          })
          
          // Update motion events
          if (device.motionEvents) {
            setMotionEvents(device.motionEvents.slice(-5).reverse()) // Show last 5 events
          }
        }
      }
    } catch (error) {
      console.error("Error fetching security data:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10")
      if (response.ok) {
        const data = await response.json()
        if (data.notifications) {
          console.log('📢 Fetched notifications:', data.notifications.length)
          setNotifications(data.notifications)
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleToggleLock = async () => {
    if (!securityData) return
    
    setIsLoading(true)
    const newLockStatus = !lockEnabled
    
    try {
      const response = await fetch("/api/security/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: securityData.device_id,
          lock_status: newLockStatus ? "locked" : "unlocked",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLockEnabled(newLockStatus)
        console.log(`🔒 Lock status updated to: ${newLockStatus ? 'locked' : 'unlocked'}`)
        
        // Immediately refresh data to show updated status
        fetchSecurityData()
        fetchNotifications()
      } else {
        alert(data.message || "Failed to update lock status")
      }
    } catch (error) {
      console.error("Error toggling lock:", error)
      alert("Failed to update lock status")
    } finally {
      setIsLoading(false)
    }
  }

  if (!securityData) return null

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Motor Security Status
          </CardTitle>
          <CardDescription className="text-muted-foreground">Real-time security monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          <div
            className={`rounded-lg p-6 border ${
              lockEnabled ? "bg-destructive/10 border-destructive/30" : "bg-primary/10 border-primary/30"
            }`}
          >
            <div className="flex items-center gap-4">
              {lockEnabled ? (
                <AlertTriangle className="w-8 h-8 text-destructive" />
              ) : (
                <CheckCircle className="w-8 h-8 text-primary" />
              )}
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {lockEnabled ? "Bike Locked - Security Active" : "Bike Safe"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lockEnabled
                    ? "Motion detection enabled - any movement will trigger alert"
                    : "Running mode - no alerts triggered"}
                </p>
              </div>
            </div>
          </div>

          {/* Lock Toggle */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Bike Lock Control</p>
            <Button
              onClick={handleToggleLock}
              disabled={isLoading}
              className={`w-full py-6 text-lg font-semibold transition-all ${
                lockEnabled
                  ? "bg-destructive hover:bg-destructive/90 text-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isLoading ? "Updating..." : lockEnabled ? "Unlock Bike" : "Lock Bike"}
            </Button>
          </div>

          {/* Alert Information - Show notifications from database */}
          {notifications.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Recent Notifications</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification) => {
                  const isTheft = notification.type === 'theft_alert'
                  const isMotion = notification.type === 'motion_detected'
                  const distance = notification.metadata?.distanceMoved
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`rounded-lg p-3 border ${
                        isTheft
                          ? 'bg-red-500/20 border-red-500/50 animate-pulse' 
                          : isMotion 
                          ? 'bg-destructive/10 border-destructive/30' 
                          : 'bg-primary/10 border-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {isTheft ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          ) : isMotion ? (
                            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                          )}
                          <div>
                            <p className={`text-sm font-semibold ${
                              isTheft ? 'text-red-500 font-bold' : isMotion ? 'text-destructive' : 'text-primary'
                            }`}>
                              {isTheft ? '🚨 THEFT ALERT!' : notification.message}
                            </p>
                            {isTheft && distance && (
                              <p className="text-xs text-red-400 font-semibold mt-1">
                                Bike moved {Math.round(distance)} meters from locked position!
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                            {notification.location && notification.location.latitude && notification.location.longitude && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Location: {notification.location.latitude.toFixed(6)}, {notification.location.longitude.toFixed(6)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Device: {notification.device.name}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className={`w-2 h-2 rounded-full ${isTheft ? 'bg-red-500' : 'bg-primary'}`} title="Unread" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Alert Type</p>
              <p className="font-semibold text-foreground">{lockEnabled ? "Motion Detected" : "None"}</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <p className={`font-semibold ${lockEnabled ? "text-destructive" : "text-primary"}`}>
                {lockEnabled ? "Locked" : "Unlocked"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
