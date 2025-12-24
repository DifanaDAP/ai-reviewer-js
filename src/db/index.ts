import mongoose from 'mongoose'
import {info, warning, error as logError} from '@actions/core'

export let isMongoConnected = false
export let mongoConnectionError: string | null = null

export const connectToDatabase = async (uri: string): Promise<boolean> => {
  info('🔄 Attempting to connect to MongoDB...')
  
  // Validate URI format first
  if (!uri) {
    warning('⚠️ MongoDB URI is empty - skipping database connection')
    isMongoConnected = false
    mongoConnectionError = 'URI is empty'
    return false
  }
  
  // Basic URI validation
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    logError('❌ Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://')
    isMongoConnected = false
    mongoConnectionError = 'Invalid URI format'
    return false
  }
  
  try {
    if (mongoose.connection.readyState >= 1) {
      info('✅ MongoDB already connected')
      isMongoConnected = true
      mongoConnectionError = null
      return true
    }
    
    // Set connection options with timeout
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000
    }
    
    info(`🔄 Connecting to MongoDB (timeout: ${connectionOptions.serverSelectionTimeoutMS}ms)...`)
    await mongoose.connect(uri, connectionOptions)
    
    // Test the connection by running a simple command
    await mongoose.connection.db?.admin().ping()
    
    info('✅ Successfully connected to MongoDB')
    info(`   Database: ${mongoose.connection.name}`)
    info(`   Host: ${mongoose.connection.host}`)
    isMongoConnected = true
    mongoConnectionError = null
    return true
  } catch (err: any) {
    const errorMessage = err?.message || String(err)
    logError(`❌ MongoDB Connection FAILED!`)
    logError(`   Error: ${errorMessage}`)
    
    // Provide helpful error messages based on common issues
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      logError('   💡 Hint: Cannot resolve hostname. Check if the MongoDB URI is correct.')
    } else if (errorMessage.includes('authentication')) {
      logError('   💡 Hint: Authentication failed. Check username/password in the URI.')
    } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
      logError('   💡 Hint: Connection timed out. Check network access and firewall rules.')
    } else if (errorMessage.includes('ECONNREFUSED')) {
      logError('   💡 Hint: Connection refused. Is MongoDB running and accessible?')
    }
    
    isMongoConnected = false
    mongoConnectionError = errorMessage
    return false
  }
}

export const closeDatabaseConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    info('🔄 Closing MongoDB connection...')
    await mongoose.disconnect()
    info('✅ MongoDB connection closed')
    isMongoConnected = false
  }
}

/**
 * Get MongoDB connection status for reporting
 */
export const getMongoStatus = (): { connected: boolean; error: string | null } => {
  return {
    connected: isMongoConnected,
    error: mongoConnectionError
  }
}
