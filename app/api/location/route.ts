import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import Notification from '@/lib/models/Notification'

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

    // Update device with new location and motion data
    const currentTime = new Date() // Use current server time
    
    device.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    }
    device.lastSeen = currentTime
    
    // Store motion triggered status
    if (!device.motionEvents) {
      device.motionEvents = []
    }
    
    if (motion_triggered) {
      device.motionEvents.push({
        triggered: motion_triggered,
        timestamp: currentTime, // Use current server time for accurate display
        location: location,
      })
      
      // Create notification for motion detection
      await Notification.create({
        userId: device.userId,
        deviceId: device._id,
        type: 'motion_detected',
        message: `Motion detected on ${device.name}`,
        timestamp: currentTime, // Use current server time
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        read: false,
      })
      
      console.log('📢 Notification created for motion detection')
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
