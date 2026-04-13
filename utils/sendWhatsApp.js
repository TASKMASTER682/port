// backend/utils/sendWhatsApp.js
const Settings = require('../models/Settings');

/**
 * Send WhatsApp notification using WhatsApp Cloud API
 * @param {string} type - Type of notification (admin, partner, client, test)
 * @param {object} data - Data for the notification
 */
const sendWhatsAppNotification = async (type, data) => {
  try {
    // Get WhatsApp settings
    const settings = await Settings.findOne();
    
    if (!settings || !settings.whatsappNumber || !settings.whatsappToken) {
      console.log('WhatsApp not configured');
      return;
    }

    const { whatsappNumber, whatsappToken } = settings;

    // Prepare message based on type
    let message = '';
    let recipientNumber = whatsappNumber;

    switch (type) {
      case 'new_lead':
        message = `🔥 *New Lead Alert!*\n\nName: ${data.leadName}\nService: ${data.service}\nMessage: ${data.message || 'No message'}`;
        break;

      case 'new_partner':
        message = `🤝 *New Partner Signup!*\n\nName: ${data.partnerName}\nEmail: ${data.email}`;
        break;

      case 'partner_referral':
        message = `💰 *New Referral!*\n\nPartner: ${data.partnerName}\nLead: ${data.leadName}\nCommission: ₹${data.commission}`;
        break;

      case 'payout_completed':
        message = `✅ *Payout Completed!*\n\nAmount: ₹${data.amount}\nTransaction ID: ${data.transactionId || 'N/A'}`;
        break;

      case 'test':
        message = `🧪 Test message from Portfolio CRM\n\n${data.message}`;
        break;

      default:
        message = data.message || 'Notification from Portfolio CRM';
    }

    // WhatsApp Cloud API endpoint
    // Format: https://graph.facebook.com/v17.0/{phone-number-id}/messages
    const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${whatsappNumber}/messages`;

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ WhatsApp notification sent successfully');
      return result;
    } else {
      console.error('❌ WhatsApp API Error:', result);
      throw new Error(result.error?.message || 'WhatsApp send failed');
    }

  } catch (error) {
    console.error('WhatsApp Notification Error:', error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppNotification };

/**
 * WHATSAPP CLOUD API SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://developers.facebook.com/
 * 2. Create a Business App
 * 3. Add WhatsApp product
 * 4. Get your Phone Number ID
 * 5. Get your Access Token
 * 6. Add these to Settings in Admin Panel:
 *    - whatsappNumber: Your Phone Number ID
 *    - whatsappToken: Your Access Token
 * 
 * Note: For production, use a permanent access token
 */