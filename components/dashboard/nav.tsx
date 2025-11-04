"use client"

import { MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddDeviceModal from "./add-device-modal"

interface Device {
  id: string
  name: string
  uniqueId: string
  addedDate: string
}

interface DashboardNavProps {
  activeTab: "location" | "security"
  setActiveTab: (tab: "location" | "security") => void
  onAddDevice: (device: Device) => void
}

export default function DashboardNav({ activeTab, setActiveTab, onAddDevice }: DashboardNavProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-card/30 p-1 rounded-lg border border-border/30 w-fit">
        <Button
          onClick={() => setActiveTab("location")}
          variant={activeTab === "location" ? "default" : "ghost"}
          className={`gap-2 ${
            activeTab === "location"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Location
        </Button>
        <Button
          onClick={() => setActiveTab("security")}
          variant={activeTab === "security" ? "default" : "ghost"}
          className={`gap-2 ${
            activeTab === "security"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <Shield className="w-4 h-4" />
          Motor Security
        </Button>
      </div>

      <AddDeviceModal onAddDevice={onAddDevice} />
    </div>
  )
}
