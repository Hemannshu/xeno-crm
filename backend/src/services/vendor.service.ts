import { logger } from '../utils/logger';
import axios from 'axios';

interface MessagePayload {
  customerId: string;
  campaignId: string;
  message: string;
  customerName: string;
}

class VendorService {
  private readonly SUCCESS_RATE = 0.9; // 90% success rate
  private readonly DELIVERY_RECEIPT_URL = process.env.DELIVERY_RECEIPT_URL || 'http://localhost:3000/api/delivery-receipt';

  async sendMessage(payload: MessagePayload): Promise<boolean> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      // Simulate success/failure based on success rate
      const isSuccess = Math.random() < this.SUCCESS_RATE;

      if (isSuccess) {
        logger.info(`Message sent successfully to customer ${payload.customerId} for campaign ${payload.campaignId}`);
        
        // Send delivery receipt
        await this.sendDeliveryReceipt({
          customerId: payload.customerId,
          campaignId: payload.campaignId,
          status: 'SENT',
          error: null
        });
        
        return true;
      } else {
        logger.error(`Failed to send message to customer ${payload.customerId} for campaign ${payload.campaignId}`);
        
        // Send delivery receipt for failure
        await this.sendDeliveryReceipt({
          customerId: payload.customerId,
          campaignId: payload.campaignId,
          status: 'FAILED',
          error: 'Vendor delivery failed'
        });
        
        return false;
      }
    } catch (error) {
      logger.error('Error in vendor service:', error);
      return false;
    }
  }

  private async sendDeliveryReceipt(data: {
    customerId: string;
    campaignId: string;
    status: 'SENT' | 'FAILED';
    error: string | null;
  }) {
    try {
      await axios.post(this.DELIVERY_RECEIPT_URL, data);
      logger.info(`Delivery receipt sent for customer ${data.customerId}`);
    } catch (error) {
      logger.error('Error sending delivery receipt:', error);
    }
  }
}

export const vendorService = new VendorService(); 