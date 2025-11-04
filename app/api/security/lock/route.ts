import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'
import Notification from '@/lib/models/Notification'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// POST - Lock/Unlock device
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const body = await request.json()
    const { device_id, lock_status } = body

    // Validate input
    if (!device_id || !lock_status) {
      return NextResponse.json(
        { success: false, message: 'Please provide device_id and lock_status' },
        { status: 400 }
      )
    }

    if (!['locked', 'unlocked'].includes(lock_status)) {
      return NextResponse.json(
        { success: false, message: 'lock_status must be either "locked" or "unlocked"' },
        { status: 400 }
      )
    }

    // Find device by uniqueId and userId
    const device = await Device.findOne({ uniqueId: device_id, userId: decoded.userId })

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found or access denied' },
        { status: 404 }
      )
    }

    // Update lock status
    device.status = lock_status
    device.lastSeen = new Date()
    await device.save()

    // Create notification for lock/unlock action
    await Notification.create({
      userId: decoded.userId,
      deviceId: device._id,
      type: lock_status === 'locked' ? 'device_locked' : 'device_unlocked',
      message: `${device.name} ${lock_status}`,
      timestamp: new Date(),
      location: device.location ? {
        latitude: device.location.latitude,
        longitude: device.location.longitude,
      } : undefined,
      read: false,
    })

    console.log(`📢 Notification created for device ${lock_status}`)

    return NextResponse.json(
      {
        success: true,
        message: `Device ${lock_status} successfully`,
        device: {
          id: device._id,
          uniqueId: device.uniqueId,
          name: device.name,
          status: device.status,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Lock/Unlock error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
