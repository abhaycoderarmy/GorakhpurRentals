import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  images: [String], 
  color: String,
  availability: {
    type: Boolean,
    default: true,
  },
  rentDuration: {
    type: [String],
    default: ["2 days", "5 days", "1 week"],
  },
  category: {
    type: String,
    default: "Lehenga",
  },
  availableDates: [{
    type: Date
  }],
  // Store booked date ranges
  bookedDates: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
    }
  ],
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: Number,
      comment: String,
    },
  ],
}, { timestamps: true });

// Method to check if product is available for given date range
productSchema.methods.isAvailableForDates = function(startDate, endDate) {
  const requestStart = new Date(startDate);
  const requestEnd = new Date(endDate);
  
  // First check if the product is generally available
  if (!this.availability) {
    return false;
  }
  
  // Check if any booked dates overlap with requested dates
  for (let booking of this.bookedDates) {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    
    // Check for date overlap
    if (requestStart <= bookingEnd && requestEnd >= bookingStart) {
      return false; // Dates overlap, not available
    }
  }
  
  if (this.availableDates && this.availableDates.length > 0) {
    const requestDates = [];
    const currentDate = new Date(requestStart);
    
    // Generate all dates in the requested range
    while (currentDate <= requestEnd) {
      requestDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check if all requested dates are in the available dates
    for (let reqDate of requestDates) {
      const isDateAvailable = this.availableDates.some(availableDate => {
        const available = new Date(availableDate);
        return available.toDateString() === reqDate.toDateString();
      });
      
      if (!isDateAvailable) {
        return false; // At least one requested date is not available
      }
    }
  }
  
  return true; // No overlap found and all dates are available
};

// Method to get available dates that are not booked
productSchema.methods.getActualAvailableDates = function() {
  if (!this.availableDates || this.availableDates.length === 0) {
    return [];
  }
  
  return this.availableDates.filter(availableDate => {
    const checkDate = new Date(availableDate);
    
    // Check if this date is not in any booked range
    for (let booking of this.bookedDates) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      if (checkDate >= bookingStart && checkDate <= bookingEnd) {
        return false; // This date is booked
      }
    }
    
    return true; // This date is available
  });
};

export default mongoose.model('Product', productSchema);