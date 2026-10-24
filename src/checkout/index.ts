import { ORDER_MODE } from '../config';
import { CartItem } from '../types';
import {
  generateWhatsAppOrderUrl,
  generateSingleProductOrderUrl,
  CheckoutDetails,
  SingleProductOrderDetails,
  openWhatsAppSingleProduct,
  normalizeBdPhone,
  isValidBdPhone,
} from './whatsappCheckout';
import { initializeOnlinePayment } from './paymentCheckout';

export {
  openWhatsAppSingleProduct,
  generateSingleProductOrderUrl,
  normalizeBdPhone,
  isValidBdPhone,
};
export type { CheckoutDetails, SingleProductOrderDetails };

export async function processCheckout(
  items: CartItem[],
  details: CheckoutDetails,
  onWhatsAppRedirect: (url: string) => void
) {
  if (ORDER_MODE === 'whatsapp') {
    const url = generateWhatsAppOrderUrl(items, details);
    onWhatsAppRedirect(url);
  } else {
    // Phase 3 Payment Gateway Mode
    const paymentInfo = await initializeOnlinePayment(items, details);
    window.location.href = paymentInfo.paymentUrl;
  }
}
