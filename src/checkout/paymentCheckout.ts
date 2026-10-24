/**
 * Future Payment Gateway Module (Phase 3)
 * When ORDER_MODE in src/config.ts is switched to 'payment',
 * this module handles bKash / SSLCommerz / Stripe checkout integration.
 */
import { CartItem } from '../types';
import { CheckoutDetails } from './whatsappCheckout';

export interface PaymentInitResponse {
  paymentUrl: string;
  transactionId: string;
}

export async function initializeOnlinePayment(
  items: CartItem[],
  details: CheckoutDetails
): Promise<PaymentInitResponse> {
  // Future implementation for bKash / SSLCommerz API
  console.log('Initializing online payment gateway for items:', items, details);
  
  return {
    paymentUrl: '#',
    transactionId: 'SIMULATED-TXN-' + Date.now()
  };
}
