import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['all', 'verified', 'unverified'],
    default: 'all'
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  images: [{
    filename: String,
    originalName: String,
    url: String
  }]
});

// Add indexes for better query performance
newsletterSchema.index({ createdAt: -1 });
newsletterSchema.index({ recipientType: 1 });

export default mongoose.model("Newsletter", newsletterSchema);