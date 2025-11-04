"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface User {
  name: string
  email: string
}

export default function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Clear session storage
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("devices")

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if API fails, clear local data and redirect
      sessionStorage.clear()
      router.push("/login")
    }
  }

  return (
    <header className="bg-card/50 border-b border-border/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SBL</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Smart Bike Lock</h1>
            <p className="text-xs text-muted-foreground">Security Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
