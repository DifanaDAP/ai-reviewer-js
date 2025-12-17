import mongoose from 'mongoose'
import {info, warning} from '@actions/core'

export const connectToDatabase = async (uri: string): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return
    }
    await mongoose.connect(uri)
    info('Successfully connected to MongoDB')
  } catch (err) {
    warning(`Failed to connect to MongoDB: ${err}`)
  }
}

export const closeDatabaseConnection = async (): Promise<void> => {
  await mongoose.disconnect()
}
