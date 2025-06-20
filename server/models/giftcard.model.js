import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema({
  code: { 
    type: String, 
    unique: true, 
    required: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    required: true,
    default: 'percentage'
  },
  discount: { 
    type: Number, 
    required: true,
    min: 0
  },
  minimumPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  validTill: { 
    type: Date, 
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: null // null means unlimited usage
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to update the updatedAt field
giftCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if gift card is valid
giftCardSchema.methods.isValid = function() {
  const now = new Date();
  return this.active && 
         new Date(this.validTill) >= now && 
         (this.maxUsage === null || this.usageCount < this.maxUsage);
};

// Method to calculate discount amount
giftCardSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid() || orderAmount < this.minimumPurchase) {
    return 0;
  }
  
  if (this.discountType === 'percentage') {
    return (orderAmount * this.discount) / 100;
  } else {
    return Math.min(this.discount, orderAmount);
  }
};

export default mongoose.model("GiftCard", giftCardSchema);