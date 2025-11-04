import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import Notification from '@/lib/models/Notification'

// Calculate distance between two GPS coordinates in meters (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// POST - Receive location and motion data from device
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { device_id, motion_triggered, timestamp, location } = body

    // Validate input
    if (!device_id || typeof motion_triggered !== 'boolean' || !location) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Find device by uniqueId
    const device = await Device.findOne({ uniqueId: device_id })

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      )
    }

    const currentTime = new Date()
    const previousLocation = device.location
    
    // Update device with new location
    device.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    }
    device.lastSeen = currentTime
    
    // Initialize motionEvents if not exists
    if (!device.motionEvents) {
      device.motionEvents = []
    }
    
    // Initialize theftDetection if not exists
    if (!device.theftDetection) {
      device.theftDetection = {
        isActive: false,
        theftAlerted: false,
        maxDistance: 0,
      }
    }

    // THEFT DETECTION LOGIC
    const isLocked = device.status === 'locked'
    
    if (motion_triggered && isLocked) {
      // Store motion event
      device.motionEvents.push({
        triggered: motion_triggered,
        timestamp: currentTime,
        location: location,
      })
      
      // Check if this is the first motion detection while locked
      if (!device.theftDetection.isActive) {
        // Activate theft detection and store initial location
        device.theftDetection.isActive = true
        device.theftDetection.initialLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
        }
        device.theftDetection.initialMotionTime = currentTime
        device.theftDetection.theftAlerted = false
        device.theftDetection.maxDistance = 0
        
        console.log('🚨 Theft detection ACTIVATED for device:', device.name)
        
        // Create initial motion notification
        await Notification.create({
          userId: device.userId,
          deviceId: device._id,
          type: 'motion_detected',
          message: `Motion detected on ${device.name}`,
          timestamp: currentTime,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          read: false,
        })
      } else if (device.theftDetection.initialLocation) {
        // Calculate distance from initial motion location
        const distance = calculateDistance(
          device.theftDetection.initialLocation.latitude,
          device.theftDetection.initialLocation.longitude,
          location.latitude,
          location.longitude
        )
        
        // Update max distance
        if (distance > (device.theftDetection.maxDistance || 0)) {
          device.theftDetection.maxDistance = distance
        }
        
        console.log(`📏 Distance moved: ${distance.toFixed(2)} meters (max: ${device.theftDetection.maxDistance.toFixed(2)}m)`)
        
        // THEFT ALERT: If bike moved more than 30 meters
        if (distance > 30 && !device.theftDetection.theftAlerted) {
          device.theftDetection.theftAlerted = true
          
          // Create THEFT ALERT notification
          await Notification.create({
            userId: device.userId,
            deviceId: device._id,
            type: 'theft_alert',
            message: `🚨 THEFT ALERT! ${device.name} moved ${distance.toFixed(0)} meters from initial location!`,
            timestamp: currentTime,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            metadata: {
              distanceMoved: distance,
              initialLocation: device.theftDetection.initialLocation,
            },
            read: false,
          })
          
          console.log('�🚨🚨 THEFT ALERT TRIGGERED! Distance:', distance.toFixed(2), 'meters')
        }
      }
    }
    
    // Reset theft detection when device is unlocked
    if (!isLocked && device.theftDetection.isActive) {
      device.theftDetection.isActive = false
      device.theftDetection.theftAlerted = false
      device.theftDetection.maxDistance = 0
      console.log('✅ Theft detection DEACTIVATED (device unlocked)')
    }

    await device.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Location and motion data updated',
        device: {
          id: device._id,
          name: device.name,
          uniqueId: device.uniqueId,
          location: device.location,
          lastSeen: device.lastSeen,
          motion_triggered,
        },
        theftDetection: device.theftDetection.isActive ? {
          active: device.theftDetection.isActive,
          distanceMoved: device.theftDetection.maxDistance,
          theftAlerted: device.theftDetection.theftAlerted,
        } : null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update location error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
