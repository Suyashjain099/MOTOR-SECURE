"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Device {
  id: string
  name: string
  uniqueId: string
  addedDate: string
}

interface AddDeviceModalProps {
  onAddDevice: (device: Device) => void
}

export default function AddDeviceModal({ onAddDevice }: AddDeviceModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [uniqueId, setUniqueId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deviceName.trim() && uniqueId.trim()) {
      const newDevice: Device = {
        id: Math.random().toString(36).substr(2, 9),
        name: deviceName,
        uniqueId: uniqueId,
        addedDate: new Date().toLocaleDateString(),
      }
      onAddDevice(newDevice)
      setDeviceName("")
      setUniqueId("")
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Add Device Button */}
      <Button onClick={() => setIsOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="w-4 h-4" />
        Add Device
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-card border border-border/30 rounded-lg shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border/30">
              <h2 className="text-xl font-semibold text-foreground">Add New Device</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="device-name" className="block text-sm font-medium text-foreground mb-2">
                  Device Name
                </label>
                <Input
                  id="device-name"
                  type="text"
                  placeholder="e.g., My Mountain Bike"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="unique-id" className="block text-sm font-medium text-foreground mb-2">
                  Unique Device ID
                </label>
                <Input
                  id="unique-id"
                  type="text"
                  placeholder="e.g., BIKE-2024-001"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border-border/30 text-foreground hover:bg-muted/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!deviceName.trim() || !uniqueId.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  Add Device
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
