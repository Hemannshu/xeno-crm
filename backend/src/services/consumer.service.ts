import { rabbitmq } from '../config/rabbitmq';
import { db } from '../config/database';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { vendorService } from './vendor.service';

// Validation schemas
const customerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  userId: z.string(),
});

const orderSchema = z.object({
  orderNumber: z.string(),
  total: z.number().positive(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
  paymentMethod: z.string().optional(),
  customerId: z.string(),
  userId: z.string(),
  items: z.record(z.any()).default({}),
});

// Add new validation schema for campaign messages
const campaignMessageSchema = z.object({
  campaignId: z.string(),
  customerId: z.string(),
  message: z.string(),
  customerName: z.string(),
  logId: z.string(),
});

// Add validation schema for delivery receipts
const deliveryReceiptSchema = z.object({
  customerId: z.string(),
  campaignId: z.string(),
  status: z.enum(['SENT', 'FAILED']),
  error: z.string().nullable(),
});

class ConsumerService {
  private deliveryReceiptBatch: any[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds

  public async startConsumers(): Promise<void> {
    try {
      // Start customer consumer
      await rabbitmq.consume('customer-queue', async (data) => {
        try {
          const validatedData = customerSchema.parse(data);
          
          // First check if the user exists
          const user = await db.getPrisma().user.findUnique({
            where: { id: validatedData.userId }
          });

          if (!user) {
            throw new Error(`User with ID ${validatedData.userId} not found`);
          }

          // Check if customer with this email already exists
          const existingCustomer = await db.getPrisma().customer.findUnique({
            where: { email: validatedData.email }
          });

          if (existingCustomer) {
            // Update the existing customer instead of creating a new one
            await db.getPrisma().customer.update({
              where: { email: validatedData.email },
              data: {
                name: validatedData.name,
                phone: validatedData.phone,
                address: validatedData.address,
                user: {
                  connect: {
                    id: validatedData.userId
                  }
                }
              }
            });
            logger.info('Existing customer data updated successfully');
          } else {
            // Create new customer if email doesn't exist
            await db.getPrisma().customer.create({
              data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                address: validatedData.address,
                user: {
                  connect: {
                    id: validatedData.userId
                  }
                }
              }
            });
            logger.info('New customer data persisted successfully');
          }
        } catch (error) {
          logger.error('Error persisting customer data:', error);
          throw error;
        }
      });

      // Start order consumer
      await rabbitmq.consume('order-queue', async (data) => {
        try {
          const validatedData = orderSchema.parse(data);
          await db.getPrisma().order.create({
            data: validatedData,
          });
          logger.info('Order data persisted successfully');
        } catch (error) {
          logger.error('Error persisting order data:', error);
          throw error;
        }
      });

      // Start campaign consumer
      await rabbitmq.consume('campaign-queue', async (data) => {
        try {
          const validatedData = campaignMessageSchema.parse(data);
          
          // Send message through vendor service
          const isSuccess = await vendorService.sendMessage({
            customerId: validatedData.customerId,
            campaignId: validatedData.campaignId,
            message: validatedData.message,
            customerName: validatedData.customerName,
          });

          // Queue delivery receipt
          await rabbitmq.publish('delivery-receipt-queue', {
            customerId: validatedData.customerId,
            campaignId: validatedData.campaignId,
            status: isSuccess ? 'SENT' : 'FAILED',
            error: isSuccess ? null : 'Vendor delivery failed',
          });

          logger.info(`Campaign message processed for customer ${validatedData.customerId}`);
        } catch (error) {
          logger.error('Error processing campaign message:', error);
          throw error;
        }
      });

      // Start delivery receipt consumer with batch processing
      await rabbitmq.consume('delivery-receipt-queue', async (data) => {
        try {
          const validatedData = deliveryReceiptSchema.parse(data);
          
          // Add to batch
          this.deliveryReceiptBatch.push(validatedData);

          // Process batch if it reaches the size limit
          if (this.deliveryReceiptBatch.length >= this.BATCH_SIZE) {
            await this.processDeliveryReceiptBatch();
          } else {
            // Set timeout to process remaining receipts
            setTimeout(() => this.processDeliveryReceiptBatch(), this.BATCH_TIMEOUT);
          }
        } catch (error) {
          logger.error('Error processing delivery receipt:', error);
          throw error;
        }
      });

      logger.info('All consumers started successfully');
    } catch (error) {
      logger.error('Failed to start consumers:', error);
      throw error;
    }
  }

  private async processDeliveryReceiptBatch() {
    if (this.deliveryReceiptBatch.length === 0) return;

    try {
      const batch = [...this.deliveryReceiptBatch];
      this.deliveryReceiptBatch = [];

      // Update communication logs in batch
      await db.getPrisma().$transaction(
        batch.map(receipt => 
          db.getPrisma().communicationLog.updateMany({
            where: {
              campaignId: receipt.campaignId,
              customerId: receipt.customerId,
            },
            data: {
              status: receipt.status,
              sentAt: receipt.status === 'SENT' ? new Date() : undefined,
              error: receipt.error || undefined,
            },
          })
        )
      );

      logger.info(`Processed batch of ${batch.length} delivery receipts`);
    } catch (error) {
      logger.error('Error processing delivery receipt batch:', error);
      // Add failed receipts back to the batch
      this.deliveryReceiptBatch = [...this.deliveryReceiptBatch, ...batch];
    }
  }
}

export const consumerService = new ConsumerService(); 