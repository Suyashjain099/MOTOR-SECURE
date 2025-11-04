import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// GET all notifications for the authenticated user
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

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Find notifications for this user
    const notifications = await Notification.find({ userId: decoded.userId })
      .populate('deviceId', 'name uniqueId')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)

    const totalCount = await Notification.countDocuments({ userId: decoded.userId })
    const unreadCount = await Notification.countDocuments({ userId: decoded.userId, read: false })

    return NextResponse.json(
      {
        success: true,
        notifications: notifications.map((notification) => ({
          id: notification._id,
          type: notification.type,
          message: notification.message,
          timestamp: notification.timestamp,
          location: notification.location,
          metadata: notification.metadata,
          read: notification.read,
          device: notification.deviceId,
        })),
        totalCount,
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
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
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      await Notification.updateMany(
        { userId: decoded.userId, read: false },
        { read: true }
      )
      return NextResponse.json(
        { success: true, message: 'All notifications marked as read' },
        { status: 200 }
      )
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: decoded.userId },
        { read: true }
      )
      return NextResponse.json(
        { success: true, message: 'Notifications marked as read' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
