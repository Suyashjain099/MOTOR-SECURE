import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  uniqueId: string
  addedDate: Date
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  status: 'active' | 'inactive' | 'locked' | 'unlocked'
  lastSeen?: Date
  motionEvents?: Array<{
    triggered: boolean
    timestamp: Date
    location: {
      latitude: number
      longitude: number
    }
  }>
  createdAt: Date
  updatedAt: Date
}

const DeviceSchema: Schema<IDevice> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a device name'],
      trim: true,
    },
    uniqueId: {
      type: String,
      required: [true, 'Please provide a unique device ID'],
      unique: true,
      trim: true,
    },
    addedDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'locked', 'unlocked'],
      default: 'active',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    motionEvents: [
      {
        triggered: Boolean,
        timestamp: Date,
        location: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Create indexes for better query performance
DeviceSchema.index({ userId: 1, uniqueId: 1 })

// Prevent model recompilation during hot reloads
const Device: Model<IDevice> = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema)

export default Device
