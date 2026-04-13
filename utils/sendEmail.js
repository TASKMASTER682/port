// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

/**
 * Send Email notification using Nodemailer
 * @param {string} type - Type of notification (admin, client, partner, test)
 * @param {object} data - Data for the email
 */
const sendEmailNotification = async (type, data) => {
  try {
    // Get email settings
    const settings = await Settings.findOne();
    
    if (!settings || !settings.smtpEmail || !settings.smtpPassword) {
      console.log('Email not configured');
      return;
    }

    const { smtpHost, smtpPort, smtpEmail, smtpPassword } = settings;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpEmail,
        pass: smtpPassword
      }
    });

    let mailOptions = {};

    switch (type) {
      case 'new_lead':
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: smtpEmail, // Send to admin
          subject: '🔥 New Lead Received!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">New Lead Alert!</h2>
              <div style="background: #F5E5E1; padding: 20px; border-radius: 10px;">
                <p><strong>Name:</strong> ${data.leadData.name}</p>
                <p><strong>Email:</strong> ${data.leadData.email}</p>
                <p><strong>Phone:</strong> ${data.leadData.phone}</p>
                <p><strong>Service:</strong> ${data.leadData.service}</p>
                <p><strong>Message:</strong> ${data.leadData.message || 'No message'}</p>
              </div>
              <p style="margin-top: 20px;">Login to your admin panel to respond.</p>
            </div>
          `
        };
        break;

      case 'auto_reply':
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: data.email,
          subject: 'Thank you for contacting us!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">Hello ${data.name}!</h2>
              <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
              <p>If you have any urgent queries, feel free to reach us via WhatsApp.</p>
              <div style="margin-top: 30px; padding: 20px; background: #F5E5E1; border-radius: 10px;">
                <p style="margin: 0;"><strong>Best regards,</strong></p>
                <p style="margin: 5px 0;">WebStudio Team</p>
              </div>
            </div>
          `
        };
        break;

      case 'new_partner':
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: smtpEmail, // Send to admin
          subject: '🤝 New Partner Signup!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">New Partner Joined!</h2>
              <div style="background: #F5E5E1; padding: 20px; border-radius: 10px;">
                <p><strong>Name:</strong> ${data.partnerData.name}</p>
                <p><strong>Email:</strong> ${data.partnerData.email}</p>
                <p><strong>Phone:</strong> ${data.partnerData.phone}</p>
                <p><strong>Experience:</strong> ${data.partnerData.experience || 'Not provided'}</p>
              </div>
            </div>
          `
        };
        break;

      case 'welcome':
        const welcomeTemplate = settings.partnerWelcomeEmail || 'Welcome to our Partner Program!';
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: data.email,
          subject: 'Welcome to Partner Program! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">Welcome, ${data.name}!</h2>
              <p>${welcomeTemplate}</p>
              <div style="background: #F9B487; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Commission: 15%</h3>
                <p>Earn 15% commission on every successful referral!</p>
              </div>
              <p>We'll send you marketing materials and your unique referral link shortly.</p>
              <p><strong>Best regards,</strong><br>WebStudio Team</p>
            </div>
          `
        };
        break;

      case 'payout_completed':
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: data.partner.email,
          subject: '✅ Payout Completed!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">Payout Processed!</h2>
              <p>Hello ${data.partner.name},</p>
              <p>Your payout has been successfully processed.</p>
              <div style="background: #F5E5E1; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Amount:</strong> ₹${data.payoutData.amount}</p>
                <p><strong>Transaction ID:</strong> ${data.payoutData.transactionId || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(data.payoutData.paidAt).toLocaleDateString()}</p>
              </div>
              <p>The amount should reflect in your account within 2-3 business days.</p>
              <p><strong>Best regards,</strong><br>WebStudio Team</p>
            </div>
          `
        };
        break;

      case 'test':
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: smtpEmail,
          subject: '🧪 Test Email from Portfolio CRM',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #427A76;">Test Email</h2>
              <p>${data.message}</p>
              <p>If you received this email, your SMTP configuration is working correctly! ✅</p>
            </div>
          `
        };
        break;

      default:
        mailOptions = {
          from: `"Portfolio CRM" <${smtpEmail}>`,
          to: smtpEmail,
          subject: 'Notification from Portfolio CRM',
          text: data.message || 'Notification'
        };
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('Email Notification Error:', error.message);
    throw error;
  }
};

module.exports = { sendEmailNotification };

/**
 * SMTP CONFIGURATION INSTRUCTIONS:
 * 
 * For Gmail:
 * 1. Enable 2-Step Verification on your Google Account
 * 2. Generate an App Password:
 *    - Go to Google Account Settings
 *    - Security > 2-Step Verification > App Passwords
 *    - Generate password for "Mail"
 * 3. Use these settings:
 *    - smtpHost: smtp.gmail.com
 *    - smtpPort: 587
 *    - smtpEmail: your@gmail.com
 *    - smtpPassword: your-app-password (16 characters)
 * 
 * For other providers (Outlook, Yahoo, etc.), use their respective SMTP settings.
 */