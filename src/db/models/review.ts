import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
    repoOwner: string
    repoName: string
    prNumber: number
    commitId: string
    summary: string
    securityIssues: string[]
    performanceIssues: string[]
    codeStyleIssues: string[]
    feedbacks: Array<{
        file?: string
        priority: string
        category: string
        message: string
    }>
    createdAt: Date
}

const FeedbackSchema = new Schema({
    file: String,
    priority: String,
    category: String,
    message: String
}, { _id: false })

const ReviewSchema: Schema = new Schema({
    repoOwner: { type: String, required: true },
    repoName: { type: String, required: true },
    prNumber: { type: Number, required: true },
    commitId: { type: String, required: true },
    summary: { type: String },
    securityIssues: [{ type: String }],
    performanceIssues: [{ type: String }],
    codeStyleIssues: [{ type: String }],
    feedbacks: [FeedbackSchema],
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IReview>('Review', ReviewSchema)
