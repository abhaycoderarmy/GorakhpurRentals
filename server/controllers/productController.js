import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      rentDuration,
      availability = true,
      color,
      availableDates = [],
      excludedDates = [], // Handle excluded dates
    } = req.body;

    console.log("Received availableDates:", availableDates); // Debug log
    console.log("Received excludedDates:", excludedDates); // Debug log

    // Convert string to arrays if necessary
    const rentDurationsArray = Array.isArray(rentDuration)
      ? rentDuration
      : rentDuration?.split(",").map((item) => item.trim());

    // Process available dates - handle both array and string formats
    let availableDatesArray = [];
    if (Array.isArray(availableDates)) {
      availableDatesArray = availableDates;
    } else if (typeof availableDates === "string" && availableDates.trim()) {
      availableDatesArray = availableDates
        .split(",")
        .map((date) => date.trim());
    }

    // Process excluded dates - handle both array and string formats
    let excludedDatesArray = [];
    if (Array.isArray(excludedDates)) {
      excludedDatesArray = excludedDates;
    } else if (typeof excludedDates === "string" && excludedDates.trim()) {
      excludedDatesArray = excludedDates.split(",").map((date) => date.trim());
    }

    // Filter out excluded dates from available dates
    const finalAvailableDates = availableDatesArray.filter((date) => {
      const dateStr =
        typeof date === "string" ? date : date.toISOString().split("T")[0];
      return !excludedDatesArray.includes(dateStr);
    });

    // Convert date strings to Date objects and validate
    const processedAvailableDates = finalAvailableDates
      .map((dateStr) => {
        // Handle both string and Date object inputs
        if (dateStr instanceof Date) {
          return dateStr;
        }

        // Parse string dates
        const date = new Date(dateStr);

        // Validate the date
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date found: ${dateStr}`);
          return null;
        }

        return date;
      })
      .filter((date) => date !== null); // Remove invalid dates

    console.log("Processed available dates:", processedAvailableDates); // Debug log

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      // Upload each image to cloudinary
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "gorakhpur_rentals",
            resource_type: "image",
          });
          imageUrls.push(result.secure_url);
          
          // Clean up local file after upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with other images even if one fails
        }
      }
    }

    const product = await Product.create({
      name,
      price,
      description,
      category,
      rentDuration: rentDurationsArray,
      availability,
      images: imageUrls,
      color,
      bookedDates: [], // Initialize empty booked dates array
      availableDates: processedAvailableDates, // Use processed Date objects
    });

    console.log("Created product with dates:", product.availableDates); // Debug log

    res.status(201).json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Check product availability for specific dates
export const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    // Parse input dates
    const requestStartDate = new Date(startDate);
    const requestEndDate = new Date(endDate);

    // Validate dates
    if (isNaN(requestStartDate.getTime()) || isNaN(requestEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (requestStartDate > requestEndDate) {
      return res
        .status(400)
        .json({ error: "Start date must be before end date" });
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestStartDate < today) {
      return res
        .status(400)
        .json({ error: "Cannot check availability for past dates" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Use the model method to check availability
    const available = product.isAvailableForDates(requestStartDate, requestEndDate);

    // Get available dates that are not booked
    const actualAvailableDates = product.getActualAvailableDates();

    // Format dates for response (remove time component for cleaner output)
    const formattedAvailableDates = actualAvailableDates.map((date) => {
      const dateObj = new Date(date);
      return dateObj.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
    });

    const formattedBookedDates = [];

    product.bookedDates?.forEach((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      // Generate all dates in the booking range
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        formattedBookedDates.push(d.toISOString().split("T")[0]);
      }
    });

    res.json({
      available,
      availableDates: formattedAvailableDates,
      bookedDates: formattedBookedDates,
      requestedRange: {
        startDate: requestStartDate.toISOString().split("T")[0],
        endDate: requestEndDate.toISOString().split("T")[0],
      },
      message: available
        ? "Product is available for the selected dates"
        : "Product is not available for the selected dates",
    });
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      availability,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query object
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (availability !== undefined) {
      query.availability = availability === 'true';
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('ratings.userId', 'name')
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Add computed fields
    const productsWithComputedFields = products.map(product => ({
      ...product,
      averageRating: product.ratings?.length > 0 
        ? product.ratings.reduce((sum, rating) => sum + rating.rating, 0) / product.ratings.length
        : 0,
      totalRatings: product.ratings?.length || 0,
      actualAvailableDates: product.availableDates ? product.availableDates.filter(availableDate => {
        const checkDate = new Date(availableDate);
        
        // Check if this date is not in any booked range
        for (let booking of (product.bookedDates || [])) {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          if (checkDate >= bookingStart && checkDate <= bookingEnd) {
            return false; // This date is booked
          }
        }
        
        return true; // This date is available
      }) : []
    }));

    res.status(200).json({
      products: productsWithComputedFields,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error while fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ratings.userId', 'name email')
      .populate('bookedDates.userId', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Add computed fields
    const productWithComputedFields = {
      ...product,
      averageRating: product.ratings?.length > 0 
        ? product.ratings.reduce((sum, rating) => sum + rating.rating, 0) / product.ratings.length
        : 0,
      totalRatings: product.ratings?.length || 0,
      actualAvailableDates: product.availableDates ? product.availableDates.filter(availableDate => {
        const checkDate = new Date(availableDate);
        
        // Check if this date is not in any booked range
        for (let booking of (product.bookedDates || [])) {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          if (checkDate >= bookingStart && checkDate <= bookingEnd) {
            return false; // This date is booked
          }
        }
        
        return true; // This date is available
      }) : []
    };

    res.status(200).json(productWithComputedFields);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error while fetching product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      description,
      category,
      rentDuration,
      availability,
      color,
      availableDates,
      excludedDates,
      imagesToDelete = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Handle image updates
    let updatedImages = [...product.images];

    // Remove deleted images from Cloudinary and array
    if (imagesToDelete && imagesToDelete.length > 0) {
      const imagesToDeleteArray = Array.isArray(imagesToDelete) 
        ? imagesToDelete 
        : [imagesToDelete];

      for (const imageUrl of imagesToDeleteArray) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`gorakhpur_rentals/${publicId}`);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
        
        // Remove from array
        updatedImages = updatedImages.filter(img => img !== imageUrl);
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "gorakhpur_rentals",
            resource_type: "image",
          });
          updatedImages.push(result.secure_url);
          
          // Clean up local file after upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      }
    }

    // Process rent durations
    const rentDurationsArray = Array.isArray(rentDuration)
      ? rentDuration
      : rentDuration?.split(",").map((item) => item.trim());

    // Process available dates - handle both array and string formats
    let availableDatesArray = [];
    if (Array.isArray(availableDates)) {
      availableDatesArray = availableDates;
    } else if (typeof availableDates === "string" && availableDates.trim()) {
      availableDatesArray = availableDates
        .split(",")
        .map((date) => date.trim());
    }

    // Process excluded dates - handle both array and string formats
    let excludedDatesArray = [];
    if (Array.isArray(excludedDates)) {
      excludedDatesArray = excludedDates;
    } else if (typeof excludedDates === "string" && excludedDates.trim()) {
      excludedDatesArray = excludedDates.split(",").map((date) => date.trim());
    }

    // Filter out excluded dates from available dates
    const finalAvailableDates = availableDatesArray.filter((date) => {
      const dateStr =
        typeof date === "string" ? date : date.toISOString().split("T")[0];
      return !excludedDatesArray.includes(dateStr);
    });

    // Convert date strings to Date objects and validate
    const processedAvailableDates = finalAvailableDates
      .map((dateStr) => {
        if (dateStr instanceof Date) {
          return dateStr;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date found: ${dateStr}`);
          return null;
        }

        return date;
      })
      .filter((date) => date !== null);

    // Update product
    const updateData = {
      name,
      price,
      description,
      category,
      rentDuration: rentDurationsArray,
      availability: availability !== undefined ? availability : product.availability,
      color,
      images: updatedImages,
      availableDates: processedAvailableDates,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error while updating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`gorakhpur_rentals/${publicId}`);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};

// Add a rating to a product
export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; // Assuming user is attached to request via auth middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user has already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      r => r.userId.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      product.ratings[existingRatingIndex] = {
        userId,
        rating: Number(rating),
        comment: comment || ""
      };
    } else {
      // Add new rating
      product.ratings.push({
        userId,
        rating: Number(rating),
        comment: comment || ""
      });
    }

    await product.save();

    const updatedProduct = await Product.findById(id)
      .populate('ratings.userId', 'name email');

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Server error while adding rating" });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ availability: true });
    const categories = await Product.distinct('category');
    
    // Get products with upcoming bookings
    const today = new Date();
    const productsWithUpcomingBookings = await Product.countDocuments({
      'bookedDates.startDate': { $gte: today }
    });

    // Get average price
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      totalProducts,
      availableProducts,
      unavailableProducts: totalProducts - availableProducts,
      totalCategories: categories.length,
      categories,
      productsWithUpcomingBookings,
      priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({ error: "Server error while fetching statistics" });
  }
};
// Add this new export to your controller
export const getProductBookedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const bookedDatesArray = [];
    product.bookedDates?.forEach((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      // Generate all dates in the booking range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        bookedDatesArray.push(d.toISOString().split('T')[0]);
      }
    });

    res.json({ bookedDates: bookedDatesArray });
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ error: "Server error" });
  }
};
