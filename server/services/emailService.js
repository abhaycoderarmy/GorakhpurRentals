import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true, // Enable connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }

  async sendBulkEmail(recipients, subject, htmlContent, options = {}) {
    const {
      batchSize = 50,
      delayBetweenBatches = 1000,
      fromName = 'Gorakhpur Rentals'
    } = options;

    const batches = this.createBatches(recipients, batchSize);
    let results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await this.transporter.sendMail({
          from: `"${fromName}" <${process.env.EMAIL_USER}>`,
          bcc: batch,
          subject: subject,
          html: htmlContent,
          headers: {
            'List-Unsubscribe': `<${process.env.FRONTEND_URL}/unsubscribe>`,
            'X-Mailer': 'Gorakhpur Rentals Newsletter System'
          }
        });
        
        results.success += batch.length;
        console.log(`Batch ${i + 1}/${batches.length} sent successfully (${batch.length} recipients)`);
        
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: i + 1,
          recipients: batch.length,
          error: error.message
        });
        console.error(`Batch ${i + 1} failed:`, error.message);
      }

      // Add delay between batches (except for the last one)
      if (i < batches.length - 1) {
        await this.delay(delayBetweenBatches);
      }
    }

    return results;
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateNewsletterTemplate(subject, body, options = {}) {
    const {
      brandName = 'Gorakhpur Rentals',
      brandColor = '#667eea',
      websiteUrl = process.env.FRONTEND_URL || 'https://gorakpurrentals.com',
      unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe`
    } = options;

    return `
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
            .cta-button { display: block !important; margin: 10px 0 !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, ${brandColor} 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1;">
              ${brandName}
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; position: relative; z-index: 1;">
              Your trusted rental partner
            </p>
          </div>
          
          <!-- Content -->
          <div class="content" style="padding: 50px 40px;">
            <h2 style="color: #2d3748; margin-bottom: 25px; font-size: 28px; font-weight: 600; line-height: 1.3; border-bottom: 3px solid ${brandColor}; padding-bottom: 15px;">
              ${subject}
            </h2>
            <div style="color: #4a5568; line-height: 1.8; font-size: 16px;">
              ${body}
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="padding: 0 40px 40px; text-align: center;">
            <a href="${websiteUrl}" class="cta-button"
               style="display: inline-block; background: linear-gradient(135deg, ${brandColor} 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; margin: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); text-transform: uppercase; letter-spacing: 1px;">
              Explore Rentals
            </a>
            <a href="${websiteUrl}/contact" class="cta-button"
               style="display: inline-block; background: transparent; color: ${brandColor}; padding: 18px 35px; text-decoration: none; border: 2px solid ${brandColor}; border-radius: 30px; font-weight: 600; font-size: 16px; margin: 15px; transition: all 0.3s ease;">
              Contact Us
            </a>
          </div>
          
          <!-- Social Media Section -->
          <div style="padding: 30px 40px; background: linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%); text-align: center;">
            <h3 style="color: #4a5568; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Stay Connected</h3>
            <div style="margin-bottom: 20px;">
              <!-- Social media icons would go here -->
              <span style="color: #718096; font-size: 14px;">Follow us on social media for updates and offers</span>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer" style="background: #2d3748; color: #e2e8f0; padding: 40px; text-align: center;">
            <div style="margin-bottom: 25px;">
              <h4 style="color: white; margin-bottom: 15px; font-size: 18px; font-weight: 600;">${brandName}</h4>
              <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                Making quality rentals accessible to everyone in Gorakhpur and beyond.
              </p>
            </div>
            
            <div style="border-top: 1px solid #4a5568; padding-top: 25px; margin-top: 25px;">
              <div style="margin-bottom: 20px;">
                <a href="${websiteUrl}" 
                   style="color: #81e6d9; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">
                  Visit Website
                </a>
                <span style="color: #718096;">|</span>
                <a href="${websiteUrl}/contact" 
                   style="color: #81e6d9; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">
                  Contact Support
                </a>
                <span style="color: #718096;">|</span>
                <a href="${unsubscribeUrl}" 
                   style="color: #f56565; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">
                  Unsubscribe
                </a>
              </div>
              
              <div style="border-top: 1px solid #4a5568; padding-top: 20px; margin-top: 20px;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
                  © 2025 ${brandName}. All rights reserved.<br>
                  You received this email because you're a registered user of our platform.
                </p>
                <p style="color: #718096; font-size: 11px; margin: 0; font-style: italic;">
                  This email was sent from a notification-only address. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();