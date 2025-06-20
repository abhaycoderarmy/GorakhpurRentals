import GiftCard from "../models/giftcard.model.js";

// Create a new gift card (admin)
export const createGiftCard = async (req, res) => {
  try {
    const { 
      code, 
      discountType, 
      discount, 
      minimumPurchase, 
      validTill, 
      maxUsage 
    } = req.body;

    // Validation
    if (!code || !discount || !validTill) {
      return res.status(400).json({ 
        error: "Code, discount, and valid till date are required" 
      });
    }

    if (new Date(validTill) <= new Date()) {
      return res.status(400).json({ 
        error: "Valid till date must be in the future" 
      });
    }

    if (discountType === 'percentage' && discount > 100) {
      return res.status(400).json({ 
        error: "Percentage discount cannot exceed 100%" 
      });
    }

    const giftCard = await GiftCard.create({ 
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discount,
      minimumPurchase: minimumPurchase || 0,
      validTill,
      maxUsage: maxUsage || null
    });

    res.status(201).json({
      success: true,
      data: giftCard,
      message: "Gift card created successfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Gift card code already exists" 
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// Get all gift cards (admin)
export const getAllGiftCards = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      active, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by active status
    if (active !== undefined) {
      query.active = active === 'true';
    }

    // Search functionality
    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const giftCards = await GiftCard.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await GiftCard.countDocuments(query);

    res.json({
      success: true,
      data: giftCards,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single gift card (admin)
export const getGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    
    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    res.json({
      success: true,
      data: giftCard
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update gift card (admin)
export const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validation for valid till date
    if (updateData.validTill && new Date(updateData.validTill) <= new Date()) {
      return res.status(400).json({ 
        error: "Valid till date must be in the future" 
      });
    }

    // Validation for percentage discount
    if (updateData.discountType === 'percentage' && updateData.discount > 100) {
      return res.status(400).json({ 
        error: "Percentage discount cannot exceed 100%" 
      });
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const giftCard = await GiftCard.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    res.json({
      success: true,
      data: giftCard,
      message: "Gift card updated successfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Gift card code already exists" 
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete gift card (admin)
export const deleteGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    
    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    res.json({
      success: true,
      message: "Gift card deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle gift card active status (admin)
export const toggleGiftCardStatus = async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    
    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    giftCard.active = !giftCard.active;
    await giftCard.save();

    res.json({
      success: true,
      data: giftCard,
      message: `Gift card ${giftCard.active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify gift card (public)
export const verifyGiftCard = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Gift card code is required" });
    }

    const giftCard = await GiftCard.findOne({ 
      code: code.toUpperCase(), 
      active: true 
    });

    if (!giftCard) {
      return res.status(404).json({ error: "Invalid gift card code" });
    }

    // Check if gift card is valid
    if (!giftCard.isValid()) {
      // Update status if expired
      if (new Date(giftCard.validTill) < new Date()) {
        giftCard.active = false;
        await giftCard.save();
        return res.status(400).json({ error: "Gift card has expired" });
      }
      
      if (giftCard.maxUsage && giftCard.usageCount >= giftCard.maxUsage) {
        return res.status(400).json({ error: "Gift card usage limit reached" });
      }
    }

    // Check minimum purchase requirement
    if (orderAmount < giftCard.minimumPurchase) {
      return res.status(400).json({ 
        error: `Minimum purchase amount of ₹${giftCard.minimumPurchase} required` 
      });
    }

    const discountAmount = giftCard.calculateDiscount(orderAmount);

    res.json({
      success: true,
      data: {
        code: giftCard.code,
        discountType: giftCard.discountType,
        discount: giftCard.discount,
        discountAmount,
        minimumPurchase: giftCard.minimumPurchase,
        validTill: giftCard.validTill
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply gift card (when order is placed)
export const applyGiftCard = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const giftCard = await GiftCard.findOne({ 
      code: code.toUpperCase(), 
      active: true 
    });

    if (!giftCard || !giftCard.isValid()) {
      return res.status(400).json({ error: "Invalid or expired gift card" });
    }

    if (orderAmount < giftCard.minimumPurchase) {
      return res.status(400).json({ 
        error: `Minimum purchase amount of ₹${giftCard.minimumPurchase} required` 
      });
    }

    // Increment usage count
    giftCard.usageCount += 1;
    
    // Deactivate if max usage reached
    if (giftCard.maxUsage && giftCard.usageCount >= giftCard.maxUsage) {
      giftCard.active = false;
    }

    await giftCard.save();

    const discountAmount = giftCard.calculateDiscount(orderAmount);

    res.json({
      success: true,
      data: {
        discountAmount,
        finalAmount: orderAmount - discountAmount
      },
      message: "Gift card applied successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};