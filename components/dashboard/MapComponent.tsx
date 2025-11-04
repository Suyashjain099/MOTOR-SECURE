"use client"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface MapComponentProps {
  latitude: number
  longitude: number
  deviceId: string
}

export default function MapComponent({ latitude, longitude, deviceId }: MapComponentProps) {
  useEffect(() => {
    // Initialize map
    const map = L.map("map").setView([latitude, longitude], 15)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map)
    marker.bindPopup(`<b>Bike Location</b><br>${deviceId}`)

    // Cleanup
    return () => {
      map.remove()
    }
  }, [latitude, longitude, deviceId])

  return <div id="map" className="w-full h-96 rounded-lg" />
}
