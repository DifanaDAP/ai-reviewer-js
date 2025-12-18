import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Review from './db/models/review'

// Load environment variables
dotenv.config()

async function testConnection() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        console.error('❌ MONGODB_URI is not defined in .env')
        process.exit(1)
    }

    console.log(`Connecting to MongoDB at ${uri}...`)

    try {
        await mongoose.connect(uri)
        console.log('✅ Successfully connected to MongoDB!')

        // Test Write
        console.log('Testing write operation...')
        const testReview = new Review({
            repoOwner: 'test-owner',
            repoName: 'test-repo',
            prNumber: 123,
            commitId: 'test-commit-id',
            summary: 'Test summary from verification script',
            securityIssues: [],
            performanceIssues: [],
            codeStyleIssues: [],
            feedbacks: [],
        })
        const savedReview = await testReview.save()
        console.log('✅ Write successful! Document ID:', savedReview._id)

        // Test Read
        console.log('Testing read operation...')
        const foundReview = await Review.findById(savedReview._id)
        if (foundReview) {
            console.log('✅ Read successful! Found document for PR:', foundReview.prNumber)
        } else {
            console.error('❌ Read failed! Could not find document.')
        }

        // Cleanup
        console.log('Cleaning up...')
        await Review.deleteOne({ _id: savedReview._id })
        console.log('✅ Cleanup successful!')

    } catch (error) {
        console.error('❌ Connection or operation failed:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB.')
    }
}

testConnection()
