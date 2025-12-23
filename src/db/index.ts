import mongoose from 'mongoose'
import {info, warning} from '@actions/core'

export let isMongoConnected = false

export const connectToDatabase = async (uri: string): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      info('MongoDB already connected')
      isMongoConnected = true
      return true
    }
    await mongoose.connect(uri)
    info('✅ Successfully connected to MongoDB')
    isMongoConnected = true
    return true
  } catch (err) {
    warning(`❌ MongoDB NOT CONNECTED: ${err}`)
    isMongoConnected = false
    return false
  }
}

export const closeDatabaseConnection = async (): Promise<void> => {
  await mongoose.disconnect()
}
