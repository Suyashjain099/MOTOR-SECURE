import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// GET all devices for the authenticated user
export async function GET(request: NextRequest) {
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

    // Find all devices for this user
    const devices = await Device.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        devices: devices.map((device) => ({
          id: device._id,
          name: device.name,
          uniqueId: device.uniqueId,
          addedDate: device.addedDate,
          location: device.location,
          status: device.status,
          lastSeen: device.lastSeen,
          motionEvents: device.motionEvents || [],
        })),
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get devices error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST - Add a new device
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
    const { name, uniqueId } = body

    // Validate input
    if (!name || !uniqueId) {
      return NextResponse.json(
        { success: false, message: 'Please provide device name and unique ID' },
        { status: 400 }
      )
    }

    // Check if device with this uniqueId already exists
    const existingDevice = await Device.findOne({ uniqueId })
    if (existingDevice) {
      return NextResponse.json(
        { success: false, message: 'A device with this ID already exists' },
        { status: 400 }
      )
    }

    // Create new device
    const device = await Device.create({
      userId: decoded.userId,
      name,
      uniqueId,
      addedDate: new Date(),
      status: 'active',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Device added successfully',
        device: {
          id: device._id,
          name: device.name,
          uniqueId: device.uniqueId,
          addedDate: device.addedDate,
          status: device.status,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Add device error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
