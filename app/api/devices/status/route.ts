import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Device from '@/lib/models/Device'

// GET - IoT device queries its current lock status
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get device_id from query parameters
    const { searchParams } = new URL(request.url)
    const device_id = searchParams.get('device_id')

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: 'device_id is required' },
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

    // Return current status
    return NextResponse.json(
      {
        success: true,
        device_id: device.uniqueId,
        status: device.status || 'unlocked',
        should_lock: device.status === 'locked',
        last_updated: device.lastSeen,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get device status error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
