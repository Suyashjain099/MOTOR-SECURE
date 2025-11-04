import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  deviceId: mongoose.Types.ObjectId
  type: 'motion_detected' | 'device_locked' | 'device_unlocked' | 'location_updated' | 'theft_alert'
  message: string
  timestamp: Date
  location?: {
    latitude: number
    longitude: number
  }
  metadata?: {
    distanceMoved?: number
    initialLocation?: {
      latitude: number
      longitude: number
    }
  }
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    type: {
      type: String,
      enum: ['motion_detected', 'device_locked', 'device_unlocked', 'location_updated', 'theft_alert'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    metadata: {
      distanceMoved: Number,
      initialLocation: {
        latitude: Number,
        longitude: Number,
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
