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
        line?: number
        priority: string
        category: string
        title: string
        message: string
        suggestion?: string
        codeSnippet?: string
    }>
    createdAt: Date
}

const FeedbackSchema = new Schema({
    file: String,
    line: Number,
    priority: String,
    category: String,
    title: String,
    message: String,
    suggestion: String,
    codeSnippet: String
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
