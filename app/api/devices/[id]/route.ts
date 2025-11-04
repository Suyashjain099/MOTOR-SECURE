import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// GET a specific device
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const device = await Device.findOne({ _id: params.id, userId: decoded.userId })

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        device: {
          id: device._id,
          name: device.name,
          uniqueId: device.uniqueId,
          addedDate: device.addedDate,
          location: device.location,
          status: device.status,
          lastSeen: device.lastSeen,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get device error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

// PATCH - Update device
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const body = await request.json()

    // Find and update device
    const device = await Device.findOneAndUpdate(
      { _id: params.id, userId: decoded.userId },
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Device updated successfully',
        device: {
          id: device._id,
          name: device.name,
          uniqueId: device.uniqueId,
          addedDate: device.addedDate,
          location: device.location,
          status: device.status,
          lastSeen: device.lastSeen,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update device error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

// DELETE - Remove device
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Find and delete device
    const device = await Device.findOneAndDelete({ _id: params.id, userId: decoded.userId })

    if (!device) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Device deleted successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete device error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
