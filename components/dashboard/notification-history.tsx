"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CheckCircle, Lock, Unlock } from "lucide-react"

interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
  read: boolean
  device: {
    name: string
    uniqueId: string
  }
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Fetch notifications
    fetchNotifications()

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=5")
      if (response.ok) {
        const data = await response.json()
        if (data.notifications) {
          setNotifications(data.notifications)
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "motion_detected":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "device_locked":
        return <Lock className="w-4 h-4 text-primary" />
      case "device_unlocked":
        return <Unlock className="w-4 h-4 text-primary" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatDescription = (notification: Notification) => {
    if (notification.type === "motion_detected" && notification.location) {
      return `Threat at ${notification.location.latitude.toFixed(4)}, ${notification.location.longitude.toFixed(4)}`
    }
    return notification.message
  }

  return (
    <Card className="bg-card/50 border-border/30 backdrop-blur-sm h-fit sticky top-24">
      <CardHeader>
        <CardTitle className="text-foreground">Notification History</CardTitle>
        <CardDescription className="text-muted-foreground">Recent alerts and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="flex gap-3 pb-3 border-b border-border/20 last:border-0 last:pb-0">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {notification.type === "motion_detected" ? "Motion Detected" : 
                   notification.type === "device_locked" ? "Bike Locked" :
                   notification.type === "device_unlocked" ? "Bike Unlocked" : 
                   notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {formatDescription(notification)}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(notification.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

