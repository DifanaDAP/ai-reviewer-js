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
    createdAt: Date
}

const ReviewSchema: Schema = new Schema({
    repoOwner: { type: String, required: true },
    repoName: { type: String, required: true },
    prNumber: { type: Number, required: true },
    commitId: { type: String, required: true },
    summary: { type: String },
    securityIssues: [{ type: String }],
    performanceIssues: [{ type: String }],
    codeStyleIssues: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IReview>('Review', ReviewSchema)
