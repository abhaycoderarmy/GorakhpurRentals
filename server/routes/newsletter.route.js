// Enhanced newsletter routes - newsletter.routes.js (FIXED VERSION)
import express from "express";
import User from "../models/user.model.js";
import Newsletter from "../models/newsletter.model.js";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/newsletter-images/';
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'newsletter-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Enhanced Admin authentication middleware
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isAdmin && user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

// Upload newsletter images
router.post("/upload-image", requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/newsletter-images/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    console.log('Fetching user statistics...');
    
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    const verifiedUsers = await User.countDocuments({ 
      $or: [
        { isVerified: true },
        { emailVerified: true },
        { verified: true }
      ]
    });
    
    const adminUsers = await User.countDocuments({ 
      $or: [
        { isAdmin: true },
        { role: 'admin' }
      ]
    });
    
    const unverifiedUsers = totalUsers - verifiedUsers;
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Get sample email addresses to verify database has valid emails
    const sampleUsers = await User.find({}, 'email').limit(5);
    const validEmails = sampleUsers.filter(user => 
      user.email && 
      user.email.includes('@') && 
      user.email.includes('.')
    ).length;

    res.json({
      totalUsers,
      verifiedUsers,
      adminUsers,
      unverifiedUsers,
      recentUsers,
      validEmails,
      sampleEmails: sampleUsers.map(u => u.email).filter(e => e),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error.message 
    });
  }
});

// FIXED: Enhanced send newsletter endpoint
router.post("/send", requireAdmin, async (req, res) => {
  const { subject, body, recipientType = 'all' } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }

  try {
    let userQuery = {};
    
    switch (recipientType) {
      case 'verified':
        userQuery = { 
          $or: [
            { isVerified: true },
            { emailVerified: true },
            { verified: true }
          ]
        };
        break;
      case 'unverified':
        userQuery = { 
          $and: [
            { isVerified: { $ne: true } },
            { emailVerified: { $ne: true } },
            { verified: { $ne: true } }
          ]
        };
        break;
      case 'all':
      default:
        userQuery = {};
        break;
    }

    console.log('User query:', userQuery);
    
    // Get users with valid email addresses only
    const users = await User.find({
      ...userQuery,
      email: { 
        $exists: true, 
        $ne: null, 
        $ne: '',
        $regex: /.+@.+\..+/ // Basic email validation
      }
    }).select('email name firstName lastName');
    
    console.log(`Found ${users.length} users with valid emails for recipient type: ${recipientType}`);
    
    if (users.length === 0) {
      return res.status(400).json({ 
        error: `No ${recipientType} users with valid email addresses found`,
        recipientType,
        totalUsersInDB: await User.countDocuments()
      });
    }

    // Extract and validate emails
    const emails = users
      .map(user => user.email)
      .filter(email => email && email.includes('@') && email.includes('.'))
      .filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates

    console.log(`Sending to ${emails.length} unique, valid email addresses`);

    if (emails.length === 0) {
      return res.status(400).json({ 
        error: 'No valid email addresses found after filtering',
        totalUsers: users.length 
      });
    }

    // Create transporter with better configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 3, // Reduced from 5 to avoid rate limits
      maxMessages: 50,   // Reduced from 100
      rateDelta: 1000,   // 1 second between emails
      rateLimit: 5       // Max 5 emails per second
    });

    // Verify transporter
    await transporter.verify();
    console.log('Email transporter verified');

    // FIXED: Process body content without regex issues
    let processedBody = body;
    
    // Simply use the body as-is if it contains base64 images
    // The email client will handle the base64 images properly
    
    // Enhanced email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .header, .content, .footer { padding: 20px !important; }
            .header h1 { font-size: 24px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Gorakhpur Rentals
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Your trusted rental partner
            </p>
          </div>
          
          <!-- Content -->
          <div class="content" style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px; font-weight: 600; line-height: 1.3;">
              ${subject}
            </h2>
            <div style="color: #4a5568; line-height: 1.6; font-size: 16px;">
              ${processedBody}
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="padding: 0 30px 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://gorakpurrentals.com'}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px; transition: transform 0.2s;">
              Visit Our Website
            </a>
          </div>
          
          <!-- Footer -->
          <div class="footer" style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              © 2025 Gorakhpur Rentals. All rights reserved.
            </p>
            <div style="margin-top: 15px;">
              <a href="${process.env.FRONTEND_URL || '#'}" 
                 style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px;">
                Visit Website
              </a>
              <span style="color: #cbd5e0;">|</span>
              <a href="${process.env.FRONTEND_URL}/contact" 
                 style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px;">
                Contact Us
              </a>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                You received this email because you're a registered user of Gorakhpur Rentals.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // IMPROVED: Send emails with better error handling and progress tracking
    const batchSize = 25; // Smaller batch size for better reliability
    const batches = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;
    const failedEmails = [];

    console.log(`Sending ${emails.length} emails in ${batches.length} batches of ${batchSize}`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        console.log(`Sending batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);
        
        await transporter.sendMail({
          from: `"Gorakhpur Rentals Newsletter" <${process.env.EMAIL_USER}>`,
          bcc: batch,
          subject: subject,
          html: emailTemplate,
          headers: {
            'List-Unsubscribe': `<${process.env.FRONTEND_URL}/unsubscribe>`,
            'X-Mailer': 'Gorakhpur Rentals Newsletter System',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal'
          }
        });
        
        successCount += batch.length;
        console.log(`✅ Batch ${batchIndex + 1} sent successfully`);
        
      } catch (error) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, error.message);
        failureCount += batch.length;
        failedEmails.push(...batch);
        
        // Continue with remaining batches even if one fails
      }

      // Longer delay between batches to respect Gmail limits
      if (batchIndex < batches.length - 1) {
        console.log('Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      }
    }

    // Close the transporter
    transporter.close();

    // Save newsletter to database
    const newsletter = await Newsletter.create({
      subject,
      body: processedBody,
      recipientType,
      recipientCount: emails.length,
      successCount,
      failureCount,
      sentAt: new Date()
    });

    const response = {
      message: `Newsletter sending completed!`,
      stats: {
        totalRecipients: emails.length,
        successCount,
        failureCount,
        recipientType,
        successRate: `${((successCount / emails.length) * 100).toFixed(1)}%`
      },
      newsletterId: newsletter._id
    };

    // Add failed emails info if any
    if (failedEmails.length > 0) {
      response.failedEmails = failedEmails.slice(0, 10); // Only show first 10 failed emails
      response.message += ` ${failureCount} emails failed to send.`;
    }

    res.json(response);

  } catch (error) {
    console.error('Newsletter sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send newsletter',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get newsletter history
router.get("/history", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsletters = await Newsletter.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments();

    res.json({
      newsletters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete newsletter from history
router.delete("/history/:id", requireAdmin, async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;